import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Package, TrendingUp, X } from 'lucide-react';
import { CONFIG, parseGoogleSheetUrl, parseCSV, cellValue, MATCHING_PRIMARY_COLS } from './config';
import MatchingTable from './MatchingTable';
import CustomerDetailsModal from './CustomerDetailsModal';
import VendorResponseModal from './VendorResponseModal';

const VendorMatchManager = () => {
  const [matchingData, setMatchingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [rfqStatus, setRfqStatus] = useState({});
  const [newEntries, setNewEntries] = useState(new Set());
  const [vendorResponseModal, setVendorResponseModal] = useState({ isOpen: false, data: null, matchData: null });
  const [selectedVendors, setSelectedVendors] = useState({});

  // Fetch data on mount and interval
  useEffect(() => {
    fetchSheetData();
    const interval = setInterval(fetchSheetData, CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const fetchSheetData = async () => {
    if (!CONFIG.MATCHING_SHEET_URL) {
      setError('Configuration Error: VITE_MATCHING_SHEET_URL not set');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    
    const matchingInfo = parseGoogleSheetUrl(CONFIG.MATCHING_SHEET_URL);

    if (!matchingInfo.sheetId) {
      setError('Invalid Google Sheets URL configuration');
      setLoading(false);
      return;
    }

    try {
      const matchingUrl = `https://docs.google.com/spreadsheets/d/${matchingInfo.sheetId}/gviz/tq?tqx=out:csv&gid=${matchingInfo.gid}`;
      const matchingRes = await fetch(matchingUrl);
      const matchingCsv = await matchingRes.text();
      const parsedMatching = parseCSV(matchingCsv);
      const reversedData = parsedMatching.reverse();

      // Detect new entries
      if (matchingData.length > 0 && reversedData.length > matchingData.length) {
        const newIds = new Set();
        const newCount = reversedData.length - matchingData.length;
        for (let i = 0; i < newCount; i++) {
          newIds.add(i);
        }
        setNewEntries(newIds);
        setTimeout(() => setNewEntries(new Set()), 5000);
      }

      setMatchingData(reversedData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Ensure sheet is public and accessible.');
      setLoading(false);
    }
  };

  // Send RFQ functions
  const sendAllRFQ = useCallback(async (vendors) => {
    if (!CONFIG.N8N_WEBHOOK_URL) {
      alert('❌ Configuration Error: Webhook URL not configured!');
      return;
    }

    if (vendors.length === 0) {
      alert('❌ No vendors found!');
      return;
    }

    const firstVendor = vendors[0];
    const confirmMsg = `Send RFQ to ${vendors.length} vendor(s)?\n\nProduct: ${firstVendor.product}\nQuantity: ${firstVendor.quantity}`;
    if (!window.confirm(confirmMsg)) return;

    let successCount = 0, failCount = 0;

    for (const vendor of vendors) {
      if (!vendor.contact || vendor.contact === '—') { failCount++; continue; }

      const rfqKey = `${vendor.matchID}-${vendor.name}`;
      setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sending' }));
      
      try {
        const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchID: vendor.matchID,
            customerName: vendor.customerName,
            customerEmail: vendor.customerEmail,
            customerAddress: vendor.customerAddress,
            customerWhatsapp: vendor.customerWhatsapp,
            productType: vendor.product,
            model: vendor.model,
            quantity: vendor.quantity,
            vendorContact: vendor.contact,
            vendorEmail: vendor.email || '',
            vendorName: vendor.name,
            itemDescription: vendor.itemDescription || '',
            availableQty: vendor.availableQty || vendor.quantity || '',
            price: vendor.price || '0'
          })
        });
        
        if (response.ok) {
          successCount++;
          setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sent' }));
        } else {
          failCount++;
          setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
        }
      } catch (error) {
        console.error('Error sending RFQ:', error);
        failCount++;
        setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    alert(`✅ RFQ Sending Complete!\n\n✓ Success: ${successCount}\n✗ Failed: ${failCount}`);
    setTimeout(() => setRfqStatus({}), 3000);
  }, []);

  const sendSelectedRFQ = useCallback(async (vendors) => {
    if (vendors.length === 0) {
      alert('❌ No vendors selected!');
      return;
    }
    await sendAllRFQ(vendors);
    setSelectedVendors({});
  }, [sendAllRFQ]);

  const generateRFQID = () => {
    const date = new Date();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${month}${day}-${random}`;
  };

  const sendRFQ = useCallback(async (vendor, rfqKey) => {
    if (!CONFIG.N8N_WEBHOOK_URL) {
      alert('❌ Configuration Error: Webhook URL not configured!');
      return;
    }

    if (!vendor.contact || vendor.contact === '—') {
      alert('❌ Vendor contact number not available!');
      return;
    }
    
    setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sending' }));
    
    // Generate RFQ ID
    const rfqId = generateRFQID();
    
    try {
      const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchID: vendor.matchID,
          rfqID: rfqId,
          rfqStatus: 'Sent',
          customerName: vendor.customerName,
          customerEmail: vendor.customerEmail,
          customerAddress: vendor.customerAddress,
          customerWhatsapp: vendor.customerWhatsapp,
          productType: vendor.product,
          model: vendor.model,
          quantity: vendor.quantity,
          vendorContact: vendor.contact,
          vendorEmail: vendor.email || '',
          vendorName: vendor.name,
          itemDescription: vendor.itemDescription || '',
          availableQty: vendor.availableQty || vendor.quantity || '',
          price: vendor.price || '0'
        })
      });
      
      if (response.ok) {
        setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sent' }));
        alert(`✅ RFQ Sent!\n\nRFQ ID: ${rfqId}\nTo: ${vendor.name}\nContact: ${vendor.contact}`);
        // Refresh data to get updated RFQ_ID and status
        setTimeout(fetchSheetData, 2000);
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to send RFQ.');
      setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
    }
  }, []);

  const handleViewVendorResponse = useCallback((vendor) => {
    const customerWhatsapp = vendor.customerWhatsapp || 
                             vendor.whatsappNumber ||
                             cellValue(vendor.originalRow, 'Whatsapp_Number') ||
                             vendor.originalRow?.['Whatsapp_Number'] || 
                             vendor.originalRow?.['Whatsapp Number'] ||
                             '';
    
    // Debug log to check what we're getting
    console.log('🔍 WhatsApp Debug:', {
      fromVendorObject: vendor.customerWhatsapp,
      fromBackup: vendor.whatsappNumber,
      fromOriginalRow: cellValue(vendor.originalRow, 'Whatsapp_Number'),
      finalValue: customerWhatsapp
    });
    
    const vendorResponse = {
      Product_Available: cellValue(vendor.originalRow, 'vendor Product_available'),
      Vendor_Price: cellValue(vendor.originalRow, 'Vendor Price'),
      Available_Qty: cellValue(vendor.originalRow, 'vendor current Available_Qty'),
      Can_Deliver: cellValue(vendor.originalRow, 'vendor Can_Deliver'),
      Photo_Received: cellValue(vendor.originalRow, 'Photo_Received'),
      Final_Status: cellValue(vendor.originalRow, 'Vendor ProductStatus'),
      RFQ_Status: cellValue(vendor.originalRow, 'RFQ Status'),
      Response_Date: cellValue(vendor.originalRow, 'Date_Time'),
      Vendor_Phone: cellValue(vendor.originalRow, 'Vendor_Phone'),
      RFQ_ID: cellValue(vendor.originalRow, 'RFQ_ID'),
      Client_Offering_Price: cellValue(vendor.originalRow, 'client offering Price to customer')
    };
  
    const matchData = {
      vendorName: vendor.name || 'Vendor',
      product: vendor.product,
      model: vendor.model,
      quantity: vendor.quantity,
      vendorContact: vendor.contact || '',
      matchID: vendor.matchID,
      customerName: vendor.customerName,
      customerEmail: vendor.customerEmail,
      customerAddress: vendor.customerAddress,
      // FIX: Clean and validate WhatsApp number
      customerWhatsapp: customerWhatsapp && customerWhatsapp !== '—' && customerWhatsapp.trim() !== '' 
        ? customerWhatsapp.trim() 
        : '',
      // Add backup field
      whatsappNumber: customerWhatsapp
    };
    
    // Debug log final matchData
    console.log('📱 Final matchData WhatsApp:', matchData.customerWhatsapp);
  
    setVendorResponseModal({ isOpen: true, data: vendorResponse, matchData });
  }, []);

  const handleOfferSent = useCallback((matchID, offerPrice) => {
    console.log(`Offer sent for ${matchID}: ₹${offerPrice}`);
    // Refresh data after offer sent
    setTimeout(fetchSheetData, 2000);
  }, []);

  // Group data by customer - FIXED: Proper WhatsApp extraction
  const groupedMatchingData = useMemo(() => {
    const groups = {};
    
    matchingData.forEach(row => {
      const customerName = cellValue(row, 'Customer_Name');
      const product = cellValue(row, 'Product_Needed');
      const quantity = cellValue(row, 'Qty_Needed');
      const groupKey = `${customerName}|${product}|${quantity}`;
      
      // FIX: Multiple fallbacks for WhatsApp number extraction
      const whatsappNumber = row['Whatsapp_Number'] || 
                            row['Whatsapp Number'] || 
                            cellValue(row, 'Whatsapp_Number') || 
                            cellValue(row, 'Customer_WhatsApp') ||
                            cellValue(row, 'WhatsApp_Number') ||
                            '';
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          mainRow: row,
          vendors: [],
          customerName,
          product,
          model: cellValue(row, 'Model_Needed'),
          quantity,
          customerEmail: cellValue(row, 'Customer_Email') || cellValue(row, 'Email_Address'),
          customerAddress: cellValue(row, 'Customer_Address'),
          customerWhatsapp: whatsappNumber
        };
      }
      
      const buyer1Name = cellValue(row, 'Potential_Buyer_1');
      const buyer1Contact = cellValue(row, 'Potential Buyer 1 Contact Details');
      const matchID = cellValue(row, 'Match_ID');
      
      if (buyer1Name && buyer1Name !== '—') {
        const vendorExists = groups[groupKey].vendors.some(
          v => v.name.toLowerCase().trim() === buyer1Name.toLowerCase().trim() && v.matchID === matchID
        );
        
        if (!vendorExists) {
          // CRITICAL FIX: Extract WhatsApp from current row before pushing
          const vendorWhatsApp = row['Whatsapp_Number'] || 
                                row['Whatsapp Number'] || 
                                cellValue(row, 'Whatsapp_Number') || 
                                whatsappNumber || // Use group's whatsappNumber as fallback
                                '';
          
          groups[groupKey].vendors.push({
            name: buyer1Name,
            contact: buyer1Contact,
            email: cellValue(row, 'Potential Buyer 1 email id'),
            itemDescription: cellValue(row, 'Vendor_Item_Found') || 'N/A',
            availableQty: cellValue(row, 'Vendor_Available_Qty') || '0',
            uqc: cellValue(row, 'UQC') || '',
            price: cellValue(row, 'Vendor_Price') || '0',
            matchID,
            originalRow: row,
            customerName,
            product,
            model: cellValue(row, 'Model_Needed'),
            quantity: cellValue(row, 'Qty_Needed'),
            customerEmail: cellValue(row, 'Customer_Email') || cellValue(row, 'Email_Address'),
            customerAddress: cellValue(row, 'Customer_Address'),
            // FIX: Store extracted WhatsApp in vendor object
            customerWhatsapp: vendorWhatsApp,
            whatsappNumber: vendorWhatsApp  // Additional backup field
          });
        }
      }
    });
    
    return Object.values(groups);
  }, [matchingData]);

  const filteredMatching = useMemo(() => 
    groupedMatchingData.filter(item => 
      (item.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendors.some(v => (v.matchID || '').toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [groupedMatchingData, searchTerm]
  );

  const getRFQStatusForGroup = useCallback((vendors) => {
    const totalVendors = vendors.length;
    const respondedVendors = vendors.filter(v => 
      v.originalRow?.['vendor Product_available'] || v.originalRow?.['Vendor Price']
    ).length;
    return { total: totalVendors, responded: respondedVendors };
  }, []);

  // Loading State
  if (loading && matchingData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-indigo-700 text-lg font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg border-2 border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-red-600 text-xl font-bold mb-3">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchSheetData} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-r lg:border-b-0 border-indigo-100 flex-shrink-0 shadow-lg">
        <div className="p-4 border-b border-indigo-100">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Product Matching</h1>
              <p className="text-xs text-gray-500">Vendor Management</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-2">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg font-semibold text-sm">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Matching Sheet</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-bold bg-white text-indigo-600">
              {groupedMatchingData.length}
            </span>
          </button>
        </nav>

        <div className="p-3">
          <button
            onClick={fetchSheetData}
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Refreshing...
              </>
            ) : (
              'Refresh Data'
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="p-3 bg-white border-b border-indigo-100">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer name, product, or Match ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-3">
          <div className="bg-white rounded-xl shadow-xl border border-indigo-100 h-full flex flex-col">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-white rounded-t-xl">
              <h2 className="text-base font-bold">Matching Sheet Data</h2>
              <p className="text-indigo-100 text-xs mt-1">
                {filteredMatching.length} request(s) | View vendors and send RFQ via WhatsApp
              </p>
            </div>

            <MatchingTable
              filteredMatching={filteredMatching}
              matchingPrimaryCols={MATCHING_PRIMARY_COLS}
              getRFQStatusForGroup={getRFQStatusForGroup}
              expandedRow={expandedRow}
              setExpandedRow={setExpandedRow}
              setSelectedBuyer={setSelectedBuyer}
              selectedVendors={selectedVendors}
              setSelectedVendors={setSelectedVendors}
              sendRFQ={sendRFQ}
              sendAllRFQ={sendAllRFQ}
              sendSelectedRFQ={sendSelectedRFQ}
              rfqStatus={rfqStatus}
              handleViewVendorResponse={handleViewVendorResponse}
              newEntries={newEntries}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CustomerDetailsModal
        selectedBuyer={selectedBuyer}
        onClose={() => setSelectedBuyer(null)}
        onSendAllRFQ={sendAllRFQ}
      />

      <VendorResponseModal
        isOpen={vendorResponseModal.isOpen}
        onClose={() => setVendorResponseModal({ isOpen: false, data: null, matchData: null })}
        vendorData={vendorResponseModal.data}
        matchData={vendorResponseModal.matchData}
        onOfferSent={handleOfferSent}
      />
    </div>
  );
};

export default VendorMatchManager;
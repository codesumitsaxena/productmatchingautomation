import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, TrendingUp, X, Mail, Eye, CheckCircle, Clock, AlertCircle, User, ShoppingBag } from 'lucide-react';

// ============================================
// 1. VENDOR RESPONSE MODAL COMPONENT
// ============================================
const VendorResponseModal = ({ isOpen, onClose, vendorData, matchData }) => {
  if (!isOpen) return null;

  const hasResponse = vendorData?.Product_Available || vendorData?.Vendor_Price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold">Vendor Response</h3>
              <p className="text-xs text-indigo-100">{matchData?.vendorName || 'Vendor Information'}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-indigo-200">
            <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              RFQ Request Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-gray-600 block mb-1">Match ID</span>
                <span className="font-semibold text-gray-900">{matchData?.matchID || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-1">Customer</span>
                <span className="font-semibold text-gray-900">{matchData?.customerName || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-1">Product</span>
                <span className="font-semibold text-gray-900">{matchData?.product || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-1">Quantity Needed</span>
                <span className="font-semibold text-gray-900">{matchData?.quantity || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-1">Vendor</span>
                <span className="font-semibold text-gray-900">{matchData?.vendorName || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-1">Vendor Contact</span>
                <span className="font-semibold text-gray-900">{matchData?.vendorContact || '—'}</span>
              </div>
            </div>
          </div>

          {hasResponse ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border-2 ${
                vendorData.Product_Available === 'YES' 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {vendorData.Product_Available === 'YES' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-bold text-sm ${
                      vendorData.Product_Available === 'YES' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Product {vendorData.Product_Available === 'YES' ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">{vendorData.Response_Date || 'Just now'}</span>
                </div>

                {vendorData.Product_Available === 'YES' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Vendor Price</div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{vendorData.Vendor_Price || '—'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Available Qty</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {vendorData.Available_Qty || '—'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Can Deliver</div>
                      <div className={`text-base font-bold ${
                        vendorData.Can_Deliver === 'YES' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {vendorData.Can_Deliver || '—'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Photo</div>
                      <div className={`text-base font-bold ${
                        vendorData.Photo_Received === 'YES' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {vendorData.Photo_Received === 'YES' ? '✓ Received' : 'Not Received'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Response Status</h4>
                <div className="space-y-2 text-sm">
                  {vendorData.RFQ_ID && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">RFQ ID:</span>
                      <span className="font-semibold text-gray-900">{vendorData.RFQ_ID}</span>
                    </div>
                  )}
                  {vendorData.RFQ_Status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">RFQ Status:</span>
                      <span className="font-semibold text-indigo-600">{vendorData.RFQ_Status}</span>
                    </div>
                  )}
                  {vendorData.Final_Status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Status:</span>
                      <span className="font-semibold text-gray-900">{vendorData.Final_Status}</span>
                    </div>
                  )}
                  {vendorData.Vendor_Phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendor Phone:</span>
                      <span className="font-semibold text-gray-900">{vendorData.Vendor_Phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-gray-700 mb-2">Awaiting Vendor Response</h4>
              <p className="text-sm text-gray-600">
                The vendor has been notified via WhatsApp. Response will appear here once received.
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 2. VENDOR ROW COMPONENT
// ============================================
const VendorRow = ({ vendor, onSendRFQ, rfqStatus, onViewResponse, isSelected, onToggleSelect }) => {
  const rfqKey = `${vendor.matchID}-${vendor.name}`;
  const status = rfqStatus[rfqKey];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all gap-3">
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-gray-500 block font-semibold mb-1">Match ID</span>
            <span className="font-bold text-indigo-600 text-[11px]">{vendor.matchID || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block font-semibold mb-1">Vendor</span>
            <span className="font-bold text-gray-800">{vendor.name || '—'}</span>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] text-gray-500 block font-semibold mb-1">Item</span>
            <span className="text-gray-700 line-clamp-2">{vendor.itemDescription || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block font-semibold mb-1">Available Qty</span>
            <span className="text-gray-800 font-medium">{vendor.quantity || '0'} {vendor.uqc || ''}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block font-semibold mb-1">Price</span>
            <span className="text-green-700 font-bold text-sm">₹{vendor.price || '0'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onSendRFQ(vendor, rfqKey)}
          disabled={status === 'sending' || status === 'sent'}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md whitespace-nowrap ${
            status === 'sent' 
              ? 'bg-green-100 text-green-700 border-2 border-green-400' 
              : status === 'sending'
              ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {status === 'sent' ? (
            <>✓ RFQ Sent</>
          ) : status === 'sending' ? (
            <>
              <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-3 h-3" />
              Send RFQ
            </>
          )}
        </button>

        <button
          onClick={() => onViewResponse(vendor)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Eye className="w-3 h-3" />
          Response
        </button>
      </div>
    </div>
  );
};

// ============================================
// 3. MAIN COMPONENT
// ============================================
const VendorMatchManager = () => {
  const MATCHING_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dLhQJWr26bEphJG-sNvvjW3bizNDDmY3jAYkljrsH_Q/edit?gid=1282806052';
  const VENDOR_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dLhQJWr26bEphJG-sNvvjW3bizNDDmY3jAYkljrsH_Q/edit?gid=0';
  const N8N_WEBHOOK_URL = 'https://n8n.avertisystems.com/webhook-test/send-vendor-rfq';
  
  const [matchingData, setMatchingData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [rfqStatus, setRfqStatus] = useState({});
  const [newEntries, setNewEntries] = useState(new Set());
  const [vendorResponseModal, setVendorResponseModal] = useState({ isOpen: false, data: null, matchData: null });
  const [activeTab, setActiveTab] = useState('matching');
  const [selectedVendors, setSelectedVendors] = useState({});

  useEffect(() => {
    fetchSheetData();
  }, []);

  const parseGoogleSheetUrl = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/gid=([0-9]+)/);
    return { sheetId: match ? match[1] : null, gid: gidMatch ? gidMatch[1] : '0' };
  };

  const fetchSheetData = async () => {
    setLoading(true);
    setError('');
    
    const matchingInfo = parseGoogleSheetUrl(MATCHING_SHEET_URL);
    const vendorInfo = parseGoogleSheetUrl(VENDOR_SHEET_URL);

    if (!matchingInfo.sheetId || !vendorInfo.sheetId) {
      setError('Invalid Google Sheets URL');
      setLoading(false);
      return;
    }

    try {
      const parseCSV = (csv) => {
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];
        const parseLine = (line) => {
          const regex = /("([^"]|"")*"|[^,]+)(?=,|$)/g;
          const matches = [...line.matchAll(regex)].map(m => m[0].trim());
          return matches.map(v => {
            if (v.startsWith('"') && v.endsWith('"')) {
              return v.slice(1, -1).replace(/""/g, '"');
            }
            return v;
          });
        };
        const headers = parseLine(lines[0]).map(h => h.replace(/\r/, '').trim());
        return lines.slice(1).map(line => {
          const values = parseLine(line);
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = values[i] ? values[i].replace(/\r/, '').trim() : '';
          });
          return obj;
        }).filter(r => Object.keys(r).length > 0);
      };

      // Fetch matching sheet
      const matchingUrl = `https://docs.google.com/spreadsheets/d/${matchingInfo.sheetId}/gviz/tq?tqx=out:csv&gid=${matchingInfo.gid}`;
      const matchingRes = await fetch(matchingUrl);
      const matchingCsv = await matchingRes.text();
      const parsedMatching = parseCSV(matchingCsv);
      const reversedData = parsedMatching.reverse();

      // Fetch vendor sheet
      const vendorUrl = `https://docs.google.com/spreadsheets/d/${vendorInfo.sheetId}/gviz/tq?tqx=out:csv&gid=${vendorInfo.gid}`;
      const vendorRes = await fetch(vendorUrl);
      const vendorCsv = await vendorRes.text();
      const parsedVendor = parseCSV(vendorCsv);

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
      setVendorData(parsedVendor);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Ensure sheet is public and accessible.');
      setLoading(false);
    }
  };

  const cellValue = (row, key) => {
    return row?.[key] ?? (row?.[key.replace(/ /g, '_')] ?? '—');
  };

  const sendAllRFQ = async (vendors) => {
    if (vendors.length === 0) {
      alert('❌ No vendors found!');
      return;
    }

    const firstVendor = vendors[0];
    const confirmMsg = `Send RFQ to ${vendors.length} vendor(s)?\n\nProduct: ${firstVendor.product}\nModel: ${firstVendor.model}\nQuantity: ${firstVendor.quantity}`;
    if (!window.confirm(confirmMsg)) return;

    let successCount = 0;
    let failCount = 0;

    for (const vendor of vendors) {
      if (!vendor.contact || vendor.contact === '—') {
        failCount++;
        continue;
      }

      const rfqKey = `${vendor.matchID}-${vendor.name}`;
      setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sending' }));
      
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matchID: vendor.matchID,
            customerName: vendor.customerName,
            customerEmail: vendor.customerEmail,
            customerAddress: vendor.customerAddress,
            productType: vendor.product,
            model: vendor.model,
            quantity: vendor.quantity,
            vendorContact: vendor.contact,
            vendorEmail: vendor.email || '',
            vendorName: vendor.name
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
        console.error('Error sending RFQ to:', vendor.name, error);
        failCount++;
        setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    alert(`✅ RFQ Sending Complete!\n\n✓ Success: ${successCount}\n✗ Failed: ${failCount}`);
    setTimeout(() => {
      setRfqStatus({});
    }, 3000);
  };

  const sendSelectedRFQ = async (vendors) => {
    if (vendors.length === 0) {
      alert('❌ No vendors selected!');
      return;
    }

    const firstVendor = vendors[0];
    const confirmMsg = `Send RFQ to ${vendors.length} selected vendor(s)?\n\nProduct: ${firstVendor.product}\nModel: ${firstVendor.model}\nQuantity: ${firstVendor.quantity}`;
    if (!window.confirm(confirmMsg)) return;

    let successCount = 0;
    let failCount = 0;

    for (const vendor of vendors) {
      if (!vendor.contact || vendor.contact === '—') {
        failCount++;
        continue;
      }

      const rfqKey = `${vendor.matchID}-${vendor.name}`;
      setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sending' }));
      
      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matchID: vendor.matchID,
            customerName: vendor.customerName,
            customerEmail: vendor.customerEmail,
            customerAddress: vendor.customerAddress,
            productType: vendor.product,
            model: vendor.model,
            quantity: vendor.quantity,
            vendorContact: vendor.contact,
            vendorEmail: vendor.email || '',
            vendorName: vendor.name
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
        console.error('Error sending RFQ to:', vendor.name, error);
        failCount++;
        setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    alert(`✅ RFQ Sending Complete!\n\n✓ Success: ${successCount}\n✗ Failed: ${failCount}`);
    setSelectedVendors({});
    setTimeout(() => {
      setRfqStatus({});
    }, 3000);
  };

  const sendRFQ = async (vendor, rfqKey) => {
    if (!vendor.contact || vendor.contact === '—') {
      alert('❌ Vendor contact number not available!');
      return;
    }
    
    setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sending' }));
    
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchID: vendor.matchID,
          customerName: vendor.customerName,
          customerEmail: vendor.customerEmail,
          customerAddress: vendor.customerAddress,
          productType: vendor.product,
          model: vendor.model,
          quantity: vendor.quantity,
          vendorContact: vendor.contact,
          vendorEmail: vendor.email || '',
          vendorName: vendor.name
        })
      });
      
      if (response.ok) {
        setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sent' }));
        alert(`✅ RFQ Sent Successfully!\n\nMatch ID: ${vendor.matchID}\nTo: ${vendor.name}\nContact: ${vendor.contact}\n\nProduct: ${vendor.product}\nModel: ${vendor.model}\nQuantity: ${vendor.quantity}`);
        
        setTimeout(() => {
          setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
        }, 3000);
      } else {
        throw new Error('Failed to send RFQ');
      }
    } catch (error) {
      console.error('Error sending RFQ:', error);
      alert('❌ Failed to send RFQ. Please try again.');
      setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
    }
  };

  const handleViewVendorResponse = (vendor) => {
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
      RFQ_ID: cellValue(vendor.originalRow, 'RFQ_ID')
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
      customerAddress: vendor.customerAddress
    };
  
    setVendorResponseModal({
      isOpen: true,
      data: vendorResponse,
      matchData: matchData
    });
  };

  const groupedMatchingData = useMemo(() => {
    const groups = {};
    
    matchingData.forEach(row => {
      const customerName = cellValue(row, 'Customer_Name');
      const product = cellValue(row, 'Product_Needed');
      const quantity = cellValue(row, 'Qty_Needed');
      
      const groupKey = `${customerName}|${product}|${quantity}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          mainRow: row,
          vendors: [],
          customerName,
          product,
          model: cellValue(row, 'Model_Needed'),
          quantity,
          customerEmail: cellValue(row, 'Customer_Email') || cellValue(row, 'Email_Address'),
          customerAddress: cellValue(row, 'Customer_Address')
        };
      }
      
      const buyer1Name = cellValue(row, 'Potential_Buyer_1');
      const buyer1Contact = cellValue(row, 'Potential Buyer 1 Contact Details');
      const matchID = cellValue(row, 'Match_ID');
      
      if (buyer1Name && buyer1Name !== '—') {
        const vendorExists = groups[groupKey].vendors.some(
          v => v.name.toLowerCase().trim() === buyer1Name.toLowerCase().trim() && 
               v.matchID === matchID
        );
        
        if (!vendorExists) {
          groups[groupKey].vendors.push({
            name: buyer1Name,
            contact: buyer1Contact,
            email: cellValue(row, 'Potential Buyer 1 email id'),
            itemDescription: cellValue(row, 'Vendor_Item_Found') || 'N/A',
            quantity: cellValue(row, 'Vendor_Available_Qty') || '0',
            uqc: cellValue(row, 'UQC') || '',
            price: cellValue(row, 'Vendor_Price') || '0',
            matchID: matchID,
            originalRow: row,
            customerName,
            product,
            model: cellValue(row, 'Model_Needed'),
            quantity: cellValue(row, 'Qty_Needed'),
            customerEmail: cellValue(row, 'Customer_Email') || cellValue(row, 'Email_Address'),
            customerAddress: cellValue(row, 'Customer_Address')
          });
        }
      }
    });
    
    return Object.values(groups);
  }, [matchingData]);

  const filteredMatching = groupedMatchingData.filter(item => 
    (item.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vendors.some(v => (v.matchID || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredVendor = vendorData.filter(item =>
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const matchingPrimaryCols = [
    'Match_ID',
    'Customer_Name',
    'Product_Needed',
    'Qty_Needed',
    'RFQ Status'
  ];

  const vendorPrimaryCols = [
    'Potential Buyer 1',
    'Item_Description',
    'Quantity',
    'UQC',
    'Unit_Price',
    'Potential Buyer 1 Contact Details',
    'Potential Buyer 1 email id'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-indigo-700 text-lg font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

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
            <button 
              onClick={fetchSheetData}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
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
              <p className="text-xs text-gray-500">Vendor & Matching</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-2">
          <button
            onClick={() => {
              setActiveTab('matching');
              setSearchTerm('');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-semibold text-sm ${
              activeTab === 'matching'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                : 'hover:bg-indigo-50 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Matching Sheet</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
              activeTab === 'matching' ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {groupedMatchingData.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('vendor');
              setSearchTerm('');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-semibold text-sm ${
              activeTab === 'vendor'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                : 'hover:bg-indigo-50 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Vendor Sheet</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
              activeTab === 'vendor' ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {vendorData.length}
            </span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 bg-white border-b border-indigo-100">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search in ${activeTab === 'matching' ? 'Matching' : 'Vendor'} Sheet...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
        </div>

        {activeTab === 'matching' ? (
          <div className="flex-1 overflow-auto p-3">
            <div className="bg-white rounded-xl shadow-xl border border-indigo-100 h-full flex flex-col">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-white">
                <h2 className="text-base font-bold">Matching Sheet Data</h2>
                <p className="text-indigo-100 text-xs mt-1">View vendors and send RFQ via WhatsApp</p>
              </div>

              <div className="overflow-auto flex-1">
                <table className="w-full">
                  <thead className="bg-indigo-50 border-b-2 border-indigo-200 sticky top-0">
                    <tr>
                      {matchingPrimaryCols.map(col => (
                        <th key={col} className="px-2 py-2 text-left font-bold text-indigo-700 uppercase tracking-wide text-[10px] whitespace-nowrap">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                      <th className="px-2 py-2 text-left font-bold text-indigo-700 uppercase tracking-wide text-[10px] whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMatching.map((group, idx) => {
                      const row = group.mainRow;
                      const matchingVendors = group.vendors;
                      const isExpanded = expandedRow === idx;
                      const rowKey = `row-${idx}`;
                      const selectedVendorsForRow = selectedVendors[rowKey] || [];
                      
                      return (
                        <React.Fragment key={idx}>
                          <tr className={`hover:bg-indigo-50 transition-colors ${
                            newEntries.has(idx) ? 'bg-green-100 animate-pulse' : ''
                          }`}>
                            {matchingPrimaryCols.map(col => (
                              <td key={col} className="px-2 py-2 text-[11px] text-gray-800 whitespace-nowrap">
                                <div className="max-w-[120px] truncate" title={cellValue(row, col)}>
                                  {cellValue(row, col) || '—'}
                                </div>
                              </td>
                            ))}
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-1 flex-wrap">
                                <button
                                  onClick={() => setExpandedRow(isExpanded ? null : idx)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                                    matchingVendors.length > 0 
                                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                  disabled={matchingVendors.length === 0}
                                >
                                  {isExpanded ? 'Hide' : 'Vendors'} ({matchingVendors.length})
                                </button>
                                <button
                                  onClick={() => setSelectedBuyer({
                                    type: 'matching',
                                    fullRow: row,
                                    customerName: group.customerName,
                                    customerEmail: group.customerEmail,
                                    customerAddress: group.customerAddress,
                                    product: group.product,
                                    model: group.model,
                                    qtyNeeded: group.quantity,
                                    accuracy: cellValue(row, 'Match_Accuracy'),
                                    matchReason: cellValue(row, 'Match_Reason'),
                                    dateTime: cellValue(row, 'Date_Time'),
                                    vendorAvailableQty: cellValue(row, 'Vendor_Available_Qty'),
                                    vendorPrice: cellValue(row, 'Vendor_Price'),
                                    matchingVendors: matchingVendors
                                  })}
                                  className="px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-[10px] font-bold flex items-center gap-1 whitespace-nowrap"
                                >
                                  <Eye className="w-3 h-3" />
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                          
                          {isExpanded && matchingVendors.length > 0 && (
                            <tr className="bg-gradient-to-r from-indigo-50 to-blue-50">
                              <td colSpan={matchingPrimaryCols.length + 1} className="px-2 py-3">
                                <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 shadow-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-indigo-800 flex items-center">
                                      <Package className="w-3 h-3 mr-2" />
                                      Matched Vendors ({matchingVendors.length}) - Select & Send RFQ
                                    </h4>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          const selectedList = matchingVendors.filter((_, vIdx) => 
                                            selectedVendorsForRow.includes(vIdx)
                                          );
                                          sendSelectedRFQ(selectedList);
                                        }}
                                        disabled={selectedVendorsForRow.length === 0}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md ${
                                          selectedVendorsForRow.length === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                      >
                                        <Mail className="w-3 h-3" />
                                        Send Selected ({selectedVendorsForRow.length})
                                      </button>
                                      <button
                                        onClick={() => sendAllRFQ(matchingVendors)}
                                        className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-[10px] font-bold flex items-center gap-1 shadow-md"
                                      >
                                        <Mail className="w-3 h-3" />
                                        Send All RFQ
                                      </button>
                                    </div>
                                  </div>
                                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    {matchingVendors.map((vendor, vIdx) => {
                                      const isSelected = selectedVendorsForRow.includes(vIdx);
                                      
                                      return (
                                        <VendorRow
                                          key={`${vendor.matchID}-${vIdx}`}
                                          vendor={vendor}
                                          onSendRFQ={sendRFQ}
                                          rfqStatus={rfqStatus}
                                          onViewResponse={handleViewVendorResponse}
                                          isSelected={isSelected}
                                          onToggleSelect={() => {
                                            setSelectedVendors(prev => {
                                              const current = prev[rowKey] || [];
                                              const updated = isSelected
                                                ? current.filter(i => i !== vIdx)
                                                : [...current, vIdx];
                                              return { ...prev, [rowKey]: updated };
                                            });
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {filteredMatching.length === 0 && (
                  <div className="text-center py-16">
                    <Package className="w-20 h-20 text-indigo-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Data Found</h3>
                    <p className="text-gray-500">Try clearing filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-3">
            <div className="bg-white rounded-xl shadow-xl border border-indigo-100 h-full flex flex-col">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-white">
                <h2 className="text-base font-bold">Vendor Sheet Data</h2>
                <p className="text-green-100 text-xs mt-1">View all vendor information</p>
              </div>

              <div className="overflow-auto flex-1">
                <table className="w-full">
                  <thead className="bg-green-50 border-b-2 border-green-200 sticky top-0">
                    <tr>
                      {vendorPrimaryCols.map(col => (
                        <th key={col} className="px-2 py-2 text-left font-bold text-green-700 uppercase tracking-wide text-[10px] whitespace-nowrap">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVendor.map((row, idx) => (
                      <tr key={idx} className="hover:bg-green-50 transition-colors">
                        {vendorPrimaryCols.map(col => (
                          <td key={col} className="px-2 py-2 text-[11px] text-gray-800">
                            <div className="max-w-[150px] truncate" title={cellValue(row, col)}>
                              {cellValue(row, col) || '—'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredVendor.length === 0 && (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-20 h-20 text-green-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Vendor Data Found</h3>
                    <p className="text-gray-500">Try clearing filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Customer Details Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Customer Request Details</h3>
              </div>
              <button onClick={() => setSelectedBuyer(null)} className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Date & Time</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedBuyer.dateTime || '—'}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Customer Name</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedBuyer.customerName}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Email</div>
                  <div className="text-sm font-semibold text-gray-900 break-all">{selectedBuyer.customerEmail}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Address</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedBuyer.customerAddress || '—'}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Product Needed</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedBuyer.product}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Quantity Needed</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedBuyer.qtyNeeded}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Vendor Available Qty</div>
                  <div className="text-sm font-semibold text-gray-900">{selectedBuyer.vendorAvailableQty || '—'}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-xs text-green-700 font-bold mb-2">Vendor Price</div>
                  <div className="text-lg font-bold text-green-600">₹{selectedBuyer.vendorPrice || '—'}</div>
                </div>
              </div>

              {selectedBuyer.matchingVendors && selectedBuyer.matchingVendors.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-orange-800">Send RFQ to All Vendors</h4>
                      <p className="text-xs text-orange-600 mt-1">
                        {selectedBuyer.matchingVendors.length} vendor(s) available
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sendAllRFQ(selectedBuyer.matchingVendors);
                        setSelectedBuyer(null);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-bold flex items-center gap-2 shadow-lg"
                    >
                      <Mail className="w-4 h-4" />
                      Send All RFQ
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setSelectedBuyer(null)} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Response Modal */}
      <VendorResponseModal
        isOpen={vendorResponseModal.isOpen}
        onClose={() => setVendorResponseModal({ isOpen: false, data: null, matchData: null })}
        vendorData={vendorResponseModal.data}
        matchData={vendorResponseModal.matchData}
      />
    </div>
  );
};

export default VendorMatchManager;
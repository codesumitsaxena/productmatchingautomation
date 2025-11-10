import React, { useState, useEffect } from 'react';
import { Search, Package, TrendingUp, X, Mail, Phone, User, Eye, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// ============================================
// 1. VENDOR RESPONSE MODAL COMPONENT
// ============================================
const VendorResponseModal = ({ isOpen, onClose, vendorData, matchData }) => {
  if (!isOpen) return null;

  const hasResponse = vendorData?.Product_Available || vendorData?.Vendor_Price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* RFQ Details */}
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
                <span className="text-xs text-gray-600 block mb-1">Model</span>
                <span className="font-semibold text-gray-900">{matchData?.model || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-1">Quantity Needed</span>
                <span className="font-semibold text-gray-900">{matchData?.quantity || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-1">Vendor</span>
                <span className="font-semibold text-gray-900">{matchData?.vendorName || '—'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-gray-600 block mb-1">Vendor Contact</span>
                <span className="font-semibold text-gray-900">{matchData?.vendorContact || '—'}</span>
              </div>
            </div>
          </div>

          {/* Vendor Response Status */}
          {hasResponse ? (
            <div className="space-y-4">
              {/* Status Indicator */}
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
                    {/* Vendor Price */}
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Vendor Price</div>
                      <div className="text-xl font-bold text-green-600">
                        ₹{vendorData.Vendor_Price || '—'}
                      </div>
                    </div>

                    {/* Available Quantity */}
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Available Qty</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {vendorData.Available_Qty || '—'}
                      </div>
                    </div>

                    {/* Can Deliver */}
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Can Deliver</div>
                      <div className={`text-base font-bold ${
                        vendorData.Can_Deliver === 'YES' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {vendorData.Can_Deliver || '—'}
                      </div>
                    </div>

                    {/* Photo Received */}
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

              {/* Status Timeline */}
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
            // No Response Yet
            <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-gray-700 mb-2">Awaiting Vendor Response</h4>
              <p className="text-sm text-gray-600">
                The vendor has been notified via WhatsApp. Response will appear here once received.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
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
const VendorRow = ({ vendor, customerRow, rfqKey, onSendRFQ, rfqStatus, onViewResponse }) => {
  const status = rfqStatus[rfqKey];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all gap-3">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-gray-500 block font-semibold mb-1">Vendor</span>
          <span className="font-bold text-gray-800">{vendor['Potential Buyer 1'] || '—'}</span>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <span className="text-[10px] text-gray-500 block font-semibold mb-1">Item</span>
          <span className="text-gray-700 line-clamp-2">{vendor['Item_Description'] || '—'}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block font-semibold mb-1">Available Qty</span>
          <span className="text-gray-800 font-medium">{vendor['Quantity'] || '0'} {vendor['UQC'] || ''}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block font-semibold mb-1">Price</span>
          <span className="text-green-700 font-bold text-sm">₹{vendor['Unit_Price'] || '0'}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onSendRFQ(customerRow, vendor, rfqKey)}
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
          onClick={() => onViewResponse(rfqKey, customerRow, vendor)}
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
  const [activeMenu, setActiveMenu] = useState('matching');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [rfqStatus, setRfqStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newEntries, setNewEntries] = useState(new Set());
  const [vendorResponseModal, setVendorResponseModal] = useState({ isOpen: false, data: null, matchData: null });

  useEffect(() => {
    fetchSheetData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSheetData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeMenu, searchTerm]);

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
      const matchingUrl = `https://docs.google.com/spreadsheets/d/${matchingInfo.sheetId}/gviz/tq?tqx=out:csv&gid=${matchingInfo.gid}`;
      const matchingRes = await fetch(matchingUrl);
      const matchingCsv = await matchingRes.text();
      
      const vendorUrl = `https://docs.google.com/spreadsheets/d/${vendorInfo.sheetId}/gviz/tq?tqx=out:csv&gid=${vendorInfo.gid}`;
      const vendorRes = await fetch(vendorUrl);
      const vendorCsv = await vendorRes.text();
      
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
      
      const parsedMatching = parseCSV(matchingCsv);
      const reversedData = parsedMatching.reverse();

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
      setVendorData(parseCSV(vendorCsv));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Ensure sheet is public and accessible.');
      setLoading(false);
    }
  };

  const sendRFQ = async (customerRow, vendor, rfqKey) => {
    const customerName = cellValue(customerRow, 'Customer_Name');
    const customerEmail = cellValue(customerRow, 'Customer_Email') || cellValue(customerRow, 'Email_Address');
    const customerAddress = cellValue(customerRow, 'Customer_Address');
    const product = cellValue(customerRow, 'Product_Needed');
    const model = cellValue(customerRow, 'Model_Needed');
    const qty = cellValue(customerRow, 'Qty_Needed');
    const matchID = cellValue(customerRow, 'Match_ID');
    const vendorContact = vendor['Potential Buyer 1 Contact Details'] || '';
    const vendorEmail = vendor['Potential Buyer 1 email id'] || '';
    const vendorName = vendor['Potential Buyer 1'] || 'Vendor';
    
    if (!vendorContact || vendorContact === '—') {
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
          matchID,
          customerName,
          customerEmail,
          customerAddress,
          productType: product,
          model,
          quantity: qty,
          vendorContact,
          vendorEmail,
          vendorName
        })
      });
      
      if (response.ok) {
        setRfqStatus(prev => ({ ...prev, [rfqKey]: 'sent' }));
        alert(`✅ RFQ Sent Successfully!\n\nTo: ${vendorName}\nContact: ${vendorContact}\n\nProduct: ${product}\nModel: ${model}\nQuantity: ${qty}`);
        
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

  const handleViewVendorResponse = (rfqKey, customerRow, vendor) => {
    // Extract vendor response data from matching sheet columns
    const vendorResponse = {
      Product_Available: cellValue(customerRow, 'vendor Product_available'),
      Vendor_Price: cellValue(customerRow, 'Vendor Price'),
      Available_Qty: cellValue(customerRow, 'vendor current Available_Qty'),
      Can_Deliver: cellValue(customerRow, 'vendor Can_Deliver'),
      Photo_Received: cellValue(customerRow, 'Photo_Received'),
      Final_Status: cellValue(customerRow, 'Vendor ProductStatus'),
      RFQ_Status: cellValue(customerRow, 'RFQ Status'),
      Response_Date: cellValue(customerRow, 'Date_Time'),
      Vendor_Phone: cellValue(customerRow, 'Vendor_Phone'),
      RFQ_ID: cellValue(customerRow, 'RFQ_ID')
    };

    const matchData = {
      vendorName: vendor['Potential Buyer 1'] || 'Vendor',
      product: cellValue(customerRow, 'Product_Needed'),
      model: cellValue(customerRow, 'Model_Needed'),
      quantity: cellValue(customerRow, 'Qty_Needed'),
      vendorContact: vendor['Potential Buyer 1 Contact Details'] || '',
      matchID: cellValue(customerRow, 'Match_ID'),
      customerName: cellValue(customerRow, 'Customer_Name'),
      customerEmail: cellValue(customerRow, 'Customer_Email'),
      customerAddress: cellValue(customerRow, 'Customer_Address')
    };

    setVendorResponseModal({
      isOpen: true,
      data: vendorResponse,
      matchData: matchData
    });
  };

  const filteredMatching = matchingData.filter(item => 
    (item.Customer_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.Product_Needed || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.Potential_Buyer_1 || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendor = vendorData.filter(item =>
    (item['Potential Buyer 1'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item['Item_Description'] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredData = activeMenu === 'matching' ? filteredMatching : filteredVendor;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedRow(null);
  };

  const matchingPrimaryCols = [
    'Match_ID',
    'Customer_Name',
    'Product_Needed',
    'Model_Needed',
    'Qty_Needed',
    'Match_Accuracy',
    'RFQ Status'
  ];

  const cellValue = (row, key) => {
    return row?.[key] ?? (row?.[key.replace(/ /g, '_')] ?? '—');
  };

  const getMatchingVendors = (customerRow) => {
    const productNeeded = (cellValue(customerRow, 'Product_Needed') || '').toLowerCase().trim();
    const modelNeeded = (cellValue(customerRow, 'Model_Needed') || '').toLowerCase().trim();
    
    if (!productNeeded && !modelNeeded) return [];
    
    return vendorData.filter(vendor => {
      const itemDesc = (vendor['Item_Description'] || '').toLowerCase().trim();
      const model = (vendor['Model'] || '').toLowerCase().trim();
      const vendorProduct = (vendor['Product'] || '').toLowerCase().trim();
      
      // Multiple matching conditions
      const matchesProduct = productNeeded && (
        itemDesc.includes(productNeeded) || 
        vendorProduct.includes(productNeeded) ||
        productNeeded.split(' ').some(word => word.length > 3 && itemDesc.includes(word))
      );
      
      const matchesModel = modelNeeded && (
        model.includes(modelNeeded) || 
        itemDesc.includes(modelNeeded) ||
        modelNeeded.split(' ').some(word => word.length > 2 && (model.includes(word) || itemDesc.includes(word)))
      );
      
      return matchesProduct || matchesModel;
    }).slice(0, 10); // Limit to 10 vendors
  };

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
            onClick={() => { setActiveMenu('matching'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-semibold text-sm ${
              activeMenu === 'matching' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg' 
                : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Matching Sheet</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
              activeMenu === 'matching' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
            }`}>
              {matchingData.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveMenu('vendor'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-semibold text-sm ${
              activeMenu === 'vendor' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg' 
                : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              <span>Vendor Sheet</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
              activeMenu === 'vendor' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
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
              placeholder={`Search in ${activeMenu === 'matching' ? 'Matching' : 'Vendor'} Sheet...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3">
          <div className="bg-white rounded-xl shadow-xl border border-indigo-100 overflow-hidden h-full flex flex-col">
            {activeMenu === 'matching' ? (
              <>
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-white">
                  <h2 className="text-base font-bold">Matching Sheet Data</h2>
                  <p className="text-indigo-100 text-xs mt-1">View vendors and send RFQ via WhatsApp</p>
                </div>

                <div className="overflow-x-auto flex-1">
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
                      {currentItems.map((row, idx) => {
                        const actualIdx = indexOfFirstItem + idx;
                        const matchingVendors = getMatchingVendors(row);
                        const isExpanded = expandedRow === actualIdx;
                        
                        return (
                          <React.Fragment key={actualIdx}>
                            <tr className={`hover:bg-indigo-50 transition-colors ${
                              newEntries.has(actualIdx) ? 'bg-green-100 animate-pulse' : ''
                            }`}>
                              {matchingPrimaryCols.map(col => (
                                <td key={col} className="px-2 py-2 text-[11px] text-gray-800 whitespace-nowrap">
                                  <div className="max-w-[120px] truncate" title={cellValue(row, col)}>
                                    {cellValue(row, col) || '—'}
                                  </div>
                                </td>
                              ))}
                              <td className="px-2 py-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setExpandedRow(isExpanded ? null : actualIdx)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                                      matchingVendors.length > 0 
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={matchingVendors.length === 0}
                                  >
                                    {isExpanded ? 'Hide' : 'Vendor'} ({matchingVendors.length})
                                  </button>
                                  <button
                                    onClick={() => setSelectedBuyer({
                                      type: 'matching',
                                      fullRow: row,
                                      customerName: cellValue(row, 'Customer_Name'),
                                      customerEmail: cellValue(row, 'Customer_Email'),
                                      product: cellValue(row, 'Product_Needed'),
                                      model: cellValue(row, 'Model_Needed'),
                                      qtyNeeded: cellValue(row, 'Qty_Needed'),
                                      accuracy: cellValue(row, 'Match_Accuracy'),
                                      matchReason: cellValue(row, 'Match_Reason'),
                                      buyer1: cellValue(row, 'Potential_Buyer_1'),
                                      buyer1Contact: cellValue(row, 'Potential Buyer 1 Contact Details'),
                                      buyer1Email: cellValue(row, 'Potential Buyer 1 email id')
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
                                <td colSpan={matchingPrimaryCols.length + 1} className="px-4 py-6">
                                  <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 shadow-lg">
                                    <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
                                      <Package className="w-4 h-4 mr-2" />
                                      Matched Vendors - Send RFQ & View Response
                                    </h4>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                      {matchingVendors.map((vendor, vIdx) => {
                                        const rfqKey = `${actualIdx}-${vIdx}`;
                                        return (
                                          <VendorRow
                                            key={vIdx}
                                            vendor={vendor}
                                            customerRow={row}
                                            rfqKey={rfqKey}
                                            onSendRFQ={sendRFQ}
                                            rfqStatus={rfqStatus}
                                            onViewResponse={handleViewVendorResponse}
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
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-white">
                  <h2 className="text-base font-bold">Vendor Sheet Data</h2>
                  <p className="text-indigo-100 text-xs mt-1">Complete vendor information</p>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead className="bg-indigo-50 border-b-2 border-indigo-200">
                      <tr>
                        <th className="px-2 py-2 text-left font-bold text-indigo-700 uppercase text-[10px]">Vendor</th>
                        <th className="px-2 py-2 text-left font-bold text-indigo-700 uppercase text-[10px]">Item</th>
                        <th className="px-2 py-2 text-left font-bold text-indigo-700 uppercase text-[10px]">Qty</th>
                        <th className="px-2 py-2 text-left font-bold text-indigo-700 uppercase text-[10px]">Price</th>
                        <th className="px-2 py-2 text-left font-bold text-indigo-700 uppercase text-[10px]">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentItems.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-2 py-2 text-[11px] text-gray-800 font-semibold">
                            {row['Potential Buyer 1'] || '—'}
                          </td>
                          <td className="px-2 py-2 text-[11px] text-gray-800">
                            <div className="max-w-[200px] line-clamp-2">
                              {row['Item_Description'] || '—'}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-[11px] text-gray-800">
                            {row['Quantity'] || '0'} {row['UQC'] || ''}
                          </td>
                          <td className="px-2 py-2 text-[11px] font-bold text-green-700">
                            ₹{row['Unit_Price'] || '0'}
                          </td>
                          <td className="px-2 py-2 text-[11px] text-gray-700">
                            {row['Potential Buyer 1 Contact Details'] || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-20 h-20 text-indigo-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No Data Found</h3>
                <p className="text-gray-500">Try clearing filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="p-3 bg-white border-t border-indigo-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-600 font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-1 rounded-lg transition-all ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-lg transition-all ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                <h3 className="text-lg md:text-xl font-bold">Customer Details</h3>
              </div>
              <button onClick={() => setSelectedBuyer(null)} className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Customer Name</div>
                  <div className="text-base font-semibold text-gray-900">{selectedBuyer.customerName}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Email</div>
                  <div className="text-base font-semibold text-gray-900">{selectedBuyer.customerEmail}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Product</div>
                  <div className="text-base font-semibold text-gray-900">{selectedBuyer.product}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Model</div>
                  <div className="text-base font-semibold text-gray-900">{selectedBuyer.model}</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-xs text-indigo-700 font-bold mb-2">Quantity</div>
                  <div className="text-base font-semibold text-gray-900">{selectedBuyer.qtyNeeded}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-xs text-green-700 font-bold mb-2">Match Accuracy</div>
                  <div className="text-2xl font-bold text-green-600">{selectedBuyer.accuracy}</div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 p-4 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setSelectedBuyer(null)} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold">
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
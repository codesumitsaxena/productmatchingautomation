import React, { useState, useEffect } from 'react';
import { Search, Package, TrendingUp, X, Mail, Phone, User, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const VendorMatchManager = () => {
  const MATCHING_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dLhQJWr26bEphJG-sNvvjW3bizNDDmY3jAYkljrsH_Q/edit?gid=1282806052';
  const VENDOR_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dLhQJWr26bEphJG-sNvvjW3bizNDDmY3jAYkljrsH_Q/edit?gid=0';
  
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

  useEffect(() => {
    fetchSheetData();
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
    'Customer_Name',
    'Product_Needed',
    'Model_Needed',
    'Qty_Needed',
    'Vendor_Item_Found',
    'Match_Accuracy',
    'Match_Reason'
  ];

  const cellValue = (row, key) => {
    return row?.[key] ?? (row?.[key.replace(/ /g, '_')] ?? '—');
  };

  const getMatchingVendors = (customerRow) => {
    const productNeeded = cellValue(customerRow, 'Product_Needed').toLowerCase();
    const modelNeeded = cellValue(customerRow, 'Model_Needed').toLowerCase();
    
    return vendorData.filter(vendor => {
      const itemDesc = (vendor['Item_Description'] || '').toLowerCase();
      const model = (vendor['Model'] || '').toLowerCase();
      
      return itemDesc.includes(productNeeded) || 
             model.includes(modelNeeded) ||
             productNeeded.includes(itemDesc.split(' ')[0]);
    });
  };

  const sendRFQ = (customerRow, vendor, idx) => {
    const customerName = cellValue(customerRow, 'Customer_Name');
    const product = cellValue(customerRow, 'Product_Needed');
    const qty = cellValue(customerRow, 'Qty_Needed');
    const vendorName = vendor['Potential Buyer 1'] || 'Vendor';
    const vendorEmail = vendor['Potential Buyer 1 email id'] || '';
    
    setRfqStatus(prev => ({ ...prev, [idx]: 'sending' }));
    
    setTimeout(() => {
      setRfqStatus(prev => ({ ...prev, [idx]: 'sent' }));
      alert(`RFQ Sent Successfully!\n\nTo: ${vendorName} (${vendorEmail})\nFor: ${product}\nQty: ${qty}\nCustomer: ${customerName}`);
      
      setTimeout(() => {
        setRfqStatus(prev => ({ ...prev, [idx]: null }));
      }, 2000);
    }, 1000);
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <aside className="w-full lg:w-72 bg-white border-b lg:border-r lg:border-b-0 border-indigo-100 flex-shrink-0 shadow-lg">
        <div className="p-6 border-b border-indigo-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Product Matching</h1>
              <p className="text-sm text-gray-500">Vendor & Matching</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-3">
          <button
            onClick={() => { setActiveMenu('matching'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
              activeMenu === 'matching' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-3" />
              <span>Matching Sheet</span>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              activeMenu === 'matching' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
            }`}>
              {matchingData.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveMenu('vendor'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
              activeMenu === 'vendor' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-3" />
              <span>Vendor Sheet</span>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              activeMenu === 'vendor' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
            }`}>
              {vendorData.length}
            </span>
          </button>
        </nav>

        <div className="p-6 border-t border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Records</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              {activeMenu === 'matching' ? matchingData.length : vendorData.length}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 lg:p-6 bg-white border-b border-indigo-100 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search in ${activeMenu === 'matching' ? 'Matching' : 'Vendor'} Sheet...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-indigo-100 rounded-xl text-base focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
            {activeMenu === 'matching' ? (
              <>
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 text-white">
                  <h2 className="text-xl font-bold">Matching Sheet Data</h2>
                  <p className="text-indigo-100 text-sm mt-1">Click "Show Vendors" to view matched vendors and send RFQ.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-indigo-50 border-b-2 border-indigo-200">
                      <tr>
                        {matchingPrimaryCols.map(col => (
                          <th key={col} className="px-4 py-4 text-left font-bold text-indigo-700 uppercase tracking-wide text-xs whitespace-nowrap">
                            {col.replace(/_/g, ' ')}
                          </th>
                        ))}
                        <th className="px-4 py-4 text-left font-bold text-indigo-700 uppercase tracking-wide text-xs whitespace-nowrap">Actions</th>
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
                                <td key={col} className="px-4 py-4 text-sm text-gray-800 whitespace-nowrap">
                                  <div className="max-w-xs truncate" title={cellValue(row, col)}>
                                    {cellValue(row, col) || '—'}
                                  </div>
                                </td>
                              ))}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2 flex-nowrap">
                                  <button
                                    onClick={() => setExpandedRow(isExpanded ? null : actualIdx)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                      matchingVendors.length > 0 
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={matchingVendors.length === 0}
                                  >
                                    {isExpanded ? 'Hide' : 'Show'} Vendors ({matchingVendors.length})
                                  </button>
                                  <button
                                    onClick={() => setSelectedBuyer({
                                      type: 'matching',
                                      fullRow: row,
                                      customerName: cellValue(row, 'Customer_Name'),
                                      customerEmail: cellValue(row, 'Customer_Email') || cellValue(row, 'Email_Address'),
                                      product: cellValue(row, 'Product_Needed'),
                                      model: cellValue(row, 'Model_Needed'),
                                      qtyNeeded: cellValue(row, 'Qty_Needed'),
                                      vendorItem: cellValue(row, 'Vendor_Item_Found'),
                                      vendorQty: cellValue(row, 'Vendor_Available_Qty'),
                                      vendorPrice: cellValue(row, 'Vendor_Price'),
                                      accuracy: cellValue(row, 'Match_Accuracy'),
                                      matchReason: cellValue(row, 'Match_Reason'),
                                      buyer1: cellValue(row, 'Potential_Buyer_1'),
                                      buyer1Contact: cellValue(row, 'Potential Buyer 1 Contact Details'),
                                      buyer1Email: cellValue(row, 'Potential Buyer 1 email id'),
                                      buyer2: cellValue(row, 'Potential_Buyer_2')
                                    })}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {isExpanded && matchingVendors.length > 0 && (
                              <tr className="bg-gradient-to-r from-indigo-50 to-blue-50">
                                <td colSpan={matchingPrimaryCols.length + 1} className="px-4 py-6">
                                  <div className="bg-white rounded-xl border-2 border-indigo-200 p-6 shadow-lg">
                                    <h4 className="text-base font-bold text-indigo-800 mb-4 flex items-center">
                                      <Package className="w-5 h-5 mr-2" />
                                      Matched Vendors for "{cellValue(row, 'Product_Needed')}"
                                    </h4>
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                      {matchingVendors.map((vendor, vIdx) => {
                                        const rfqKey = `${actualIdx}-${vIdx}`;
                                        const status = rfqStatus[rfqKey];
                                        
                                        return (
                                          <div key={vIdx} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all gap-4">
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                                              <div>
                                                <span className="text-xs text-gray-500 block font-semibold mb-1">Vendor</span>
                                                <span className="font-bold text-gray-800">{vendor['Potential Buyer 1'] || '—'}</span>
                                              </div>
                                              <div className="sm:col-span-2 lg:col-span-2">
                                                <span className="text-xs text-gray-500 block font-semibold mb-1">Item</span>
                                                <span className="text-gray-700 line-clamp-2">{vendor['Item_Description'] || '—'}</span>
                                              </div>
                                              <div>
                                                <span className="text-xs text-gray-500 block font-semibold mb-1">Available Qty</span>
                                                <span className="text-gray-800 font-medium">{vendor['Quantity'] || '0'} {vendor['UQC'] || ''}</span>
                                              </div>
                                              <div>
                                                <span className="text-xs text-gray-500 block font-semibold mb-1">Price</span>
                                                <span className="text-green-700 font-bold text-base">₹{vendor['Unit_Price'] || '0'}</span>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => sendRFQ(row, vendor, rfqKey)}
                                              disabled={status === 'sending' || status === 'sent'}
                                              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md whitespace-nowrap ${
                                                status === 'sent' 
                                                  ? 'bg-green-100 text-green-700 border-2 border-green-400' 
                                                  : status === 'sending'
                                                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:scale-105'
                                              }`}
                                            >
                                              {status === 'sent' ? (
                                                <>✓ Sent</>
                                              ) : status === 'sending' ? (
                                                <>
                                                  <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                                                  Sending...
                                                </>
                                              ) : (
                                                <>
                                                  <Mail className="w-4 h-4" />
                                                  Send RFQ
                                                </>
                                              )}
                                            </button>
                                          </div>
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
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4 text-white">
                  <h2 className="text-xl font-bold">Vendor Sheet Data</h2>
                  <p className="text-indigo-100 text-sm mt-1">Complete vendor information and inventory details.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-indigo-50 border-b-2 border-indigo-200">
                      <tr>
                        <th className="px-4 py-4 text-left font-bold text-indigo-700 uppercase tracking-wide text-xs whitespace-nowrap">Potential Buyer 1</th>
                        <th className="px-4 py-4 text-left font-bold text-indigo-700 uppercase tracking-wide text-xs whitespace-nowrap">Item Description</th>
                        <th className="px-4 py-4 text-left font-bold text-indigo-700 uppercase tracking-wide text-xs whitespace-nowrap">Quantity</th>
                        <th className="px-4 py-4 text-left font-bold text-indigo-700 uppercase tracking-wide text-xs whitespace-nowrap">UQC</th>
                        <th className="px-4 py-4 text-left font-bold text-indigo-700 uppercase tracking-wide text-xs whitespace-nowrap">Unit Price</th>
                        <th className="px-4 py-4 text-left font-bold text-indigo-700 uppercase tracking-wide text-xs whitespace-nowrap">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentItems.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-4 py-4 text-sm text-gray-800 font-semibold whitespace-nowrap">
                            {row['Potential Buyer 1'] || '—'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-800">
                            <div className="max-w-md line-clamp-2" title={row['Item_Description']}>
                              {row['Item_Description'] || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-800 font-medium whitespace-nowrap">
                            {row['Quantity'] || '0'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-800 whitespace-nowrap">
                            {row['UQC'] || '—'}
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-green-700 whitespace-nowrap">
                            ₹{row['Unit_Price'] || '0'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            <div className="max-w-xs truncate" title={row['Potential Buyer 1 Contact Details']}>
                              {row['Potential Buyer 1 Contact Details'] || '—'}
                            </div>
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
                <p className="text-gray-500">Try clearing filters or check sheet visibility.</p>
              </div>
            )}
          </div>
        </div>

        {filteredData.length > 0 && (
          <div className="p-4 lg:p-6 bg-white border-t border-indigo-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white shadow-lg scale-110'
                              : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative max-w-5xl w-full bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 overflow-hidden" style={{ maxHeight: '90vh' }}>
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-b-2 border-indigo-300">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">
                  {selectedBuyer.type === 'matching' ? 'Matching Details' : 'Vendor Details'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedBuyer(null)} 
                className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBuyer.type === 'matching' ? (
                  <>
                    <div className="col-span-1 md:col-span-2 space-y-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border-2 border-indigo-200 shadow-md">
                        <div className="flex items-center mb-3">
                          <User className="w-5 h-5 text-indigo-600 mr-2" />
                          <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide">Customer Information</div>
                        </div>
                        <div className="text-xl font-bold text-gray-900 mb-2">{selectedBuyer.customerName || '—'}</div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                          {selectedBuyer.customerEmail || '—'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">Product Needed</div>
                          <div className="text-base font-semibold text-gray-800">{selectedBuyer.product || '—'}</div>
                        </div>
                        <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">Model Needed</div>
                          <div className="text-base font-semibold text-gray-800">{selectedBuyer.model || '—'}</div>
                        </div>
                        <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">Qty Needed</div>
                          <div className="text-base font-semibold text-gray-800">{selectedBuyer.qtyNeeded || '—'}</div>
                        </div>
                        <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">Vendor Found</div>
                          <div className="text-base font-semibold text-gray-800">{selectedBuyer.vendorItem || '—'}</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">Match Reason</div>
                        <div className="text-base text-gray-800 leading-relaxed">{selectedBuyer.matchReason || '—'}</div>
                      </div>
                    </div>

                    <div className="col-span-1 space-y-4">
                      <div className="p-5 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md">
                        <div className="text-xs text-green-700 font-bold uppercase tracking-wide mb-2">Match Accuracy</div>
                        <div className="text-3xl font-bold text-green-700">{selectedBuyer.accuracy || '—'}</div>
                      </div>

                      <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-3">
                          <Package className="w-4 h-4 text-indigo-600 mr-2" />
                          <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide">Potential Buyer 1</div>
                        </div>
                        <div className="text-base font-bold text-gray-900 mb-2">{selectedBuyer.buyer1 || '—'}</div>
                        <div className="space-y-1">
                          {selectedBuyer.buyer1Contact && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-2 text-indigo-500" />
                              {selectedBuyer.buyer1Contact}
                            </div>
                          )}
                          {selectedBuyer.buyer1Email && (
                            <div className="flex items-center text-sm text-gray-600 break-all">
                              <Mail className="w-3 h-3 mr-2 text-indigo-500 flex-shrink-0" />
                              {selectedBuyer.buyer1Email}
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedBuyer.buyer2 && (
                        <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">Potential Buyer 2</div>
                          <div className="text-base font-bold text-gray-900">{selectedBuyer.buyer2}</div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-5 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-md">
                      <div className="flex items-center mb-3">
                        <Package className="w-5 h-5 text-indigo-600 mr-2" />
                        <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide">Vendor</div>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-3">{selectedBuyer.name || '—'}</div>
                      <div className="space-y-2">
                        {selectedBuyer.email && (
                          <div className="flex items-center text-sm text-gray-600 break-all">
                            <Mail className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                            {selectedBuyer.email}
                          </div>
                        )}
                        {selectedBuyer.contact && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-indigo-500" />
                            {selectedBuyer.contact}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">Item Description</div>
                      <div className="text-base text-gray-800 leading-relaxed">{selectedBuyer.itemDesc || '—'}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-3">
                      <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">Quantity</div>
                        <div className="text-2xl font-bold text-gray-900">{selectedBuyer.quantity || '0'}</div>
                      </div>
                      <div className="p-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-green-700 font-bold uppercase tracking-wide mb-2">Unit Price</div>
                        <div className="text-2xl font-bold text-green-700">₹{selectedBuyer.unitPrice || '0'}</div>
                      </div>
                      <div className="p-4 rounded-xl border-2 border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow col-span-2">
                        <div className="text-xs text-indigo-700 font-bold uppercase tracking-wide mb-2">UQC</div>
                        <div className="text-base font-semibold text-gray-800">{selectedBuyer.uqc || '—'}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 p-6 bg-gray-50 border-t-2 border-indigo-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedBuyer(null)} 
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMatchManager;
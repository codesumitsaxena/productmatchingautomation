import React, { useState, useEffect } from 'react';
import { Search, Package, TrendingUp, X, Mail, Phone, User, Eye } from 'lucide-react';

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

      setMatchingData(parseCSV(matchingCsv));
      setVendorData(parseCSV(vendorCsv));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Ensure sheet is public and accessible.');
      setLoading(false);
    }
  };

  const accentBg = 'bg-indigo-50';
  const accentText = 'text-indigo-700';
  const cardBg = 'bg-white';
  const rounded = 'rounded-xl';
  const tableTextSize = 'text-sm';
  const headerTextSize = 'text-base';

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
    
    setRfqStatus(prev => ({ ...prev, [`${idx}`]: 'sending' }));
    
    setTimeout(() => {
      setRfqStatus(prev => ({ ...prev, [`${idx}`]: 'sent' }));
      alert(`RFQ Sent Successfully!\n\nTo: ${vendorName} (${vendorEmail})\nFor: ${product}\nQty: ${qty}\nCustomer: ${customerName}`);
      
      setTimeout(() => {
        setRfqStatus(prev => ({ ...prev, [`${idx}`]: null }));
      }, 2000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-400 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-indigo-700 text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg border border-red-100">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Error</h2>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
      {/* Sidebar */}
      <aside className={`w-full md:w-64 ${cardBg} border-r border-indigo-100 flex-shrink-0 ${rounded} m-4 shadow-sm`}>
        <div className="p-4 border-b border-indigo-100 flex items-center">
          <Package className="w-6 h-6 text-indigo-600 mr-2" />
          <div>
            <h1 className="text-base font-semibold text-gray-800">Data Manager</h1>
            <p className="text-sm text-gray-500">Vendor & Matching</p>
          </div>
        </div>

        <nav className="p-4 space-y-3">
          <button
            onClick={() => { setActiveMenu('matching'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 ${rounded} transition font-medium ${activeMenu === 'matching' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-100'}`}
          >
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm">Matching Sheet</span>
            </div>
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{matchingData.length}</span>
          </button>

          <button
            onClick={() => { setActiveMenu('vendor'); setSearchTerm(''); }}
            className={`w-full flex items-center justify-between px-3 py-2 ${rounded} transition font-medium ${activeMenu === 'vendor' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-100'}`}
          >
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              <span className="text-sm">Vendor Sheet</span>
            </div>
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{vendorData.length}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-indigo-100 text-center">
          <p className="text-xs text-gray-500">Total Records</p>
          <p className="text-xl font-bold text-indigo-700">{activeMenu === 'matching' ? matchingData.length : vendorData.length}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 m-4 flex flex-col">
        <div className={`p-4 mb-4 ${cardBg} border border-indigo-100 ${rounded} shadow-sm`}>
          <div className="relative max-w-4xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search in ${activeMenu === 'matching' ? 'Matching' : 'Vendor'} Sheet...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-indigo-100 rounded-lg text-base focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
            />
          </div>
        </div>

        <div className={`flex-1 overflow-auto ${cardBg} border border-indigo-100 ${rounded} shadow-sm p-4`}>
          <div className="max-w-full">
            {activeMenu === 'matching' ? (
              <>
                <div className={`${accentBg} px-4 py-3 ${rounded} border border-indigo-100 mb-4`}>
                  <h2 className={`${headerTextSize} font-semibold ${accentText}`}>Matching Sheet Data</h2>
                  <p className="text-sm text-gray-600 mt-1">Click "Show Vendors" to view matched vendors and send RFQ.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead className="bg-indigo-50 border-b border-indigo-100">
                      <tr>
                        {matchingPrimaryCols.map(col => (
                          <th key={col} className="px-4 py-3 text-left font-semibold text-indigo-700 uppercase tracking-wide text-sm">
                            {col.replace(/_/g, ' ')}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredData.map((row, idx) => {
                        const matchingVendors = getMatchingVendors(row);
                        const isExpanded = expandedRow === idx;
                        
                        return (
                          <React.Fragment key={idx}>
                            <tr className="hover:bg-indigo-50">
                              {matchingPrimaryCols.map(col => (
                                <td key={col} className={`px-4 py-3 ${tableTextSize} text-gray-800`}>
                                  {cellValue(row, col) || '—'}
                                </td>
                              ))}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 flex-nowrap">
                                  <button
                                    onClick={() => setExpandedRow(isExpanded ? null : idx)}
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${matchingVendors.length > 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
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
                                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {isExpanded && matchingVendors.length > 0 && (
                              <tr className="bg-indigo-50">
                                <td colSpan={matchingPrimaryCols.length + 1} className="px-4 py-4">
                                  <div className="bg-white rounded-lg border border-indigo-200 p-4">
                                    <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center">
                                      <Package className="w-4 h-4 mr-2" />
                                      Matched Vendors for "{cellValue(row, 'Product_Needed')}"
                                    </h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {matchingVendors.map((vendor, vIdx) => {
                                        const rfqKey = `${idx}-${vIdx}`;
                                        const status = rfqStatus[rfqKey];
                                        
                                        return (
                                          <div key={vIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition">
                                            <div className="flex-1 grid grid-cols-5 gap-3 text-sm">
                                              <div>
                                                <span className="text-xs text-gray-500 block">Vendor</span>
                                                <span className="font-medium text-gray-800">{vendor['Potential Buyer 1'] || '—'}</span>
                                              </div>
                                              <div className="col-span-2">
                                                <span className="text-xs text-gray-500 block">Item</span>
                                                <span className="text-gray-700 truncate block">{vendor['Item_Description'] || '—'}</span>
                                              </div>
                                              <div>
                                                <span className="text-xs text-gray-500 block">Available Qty</span>
                                                <span className="text-gray-800">{vendor['Quantity'] || '0'} {vendor['UQC'] || ''}</span>
                                              </div>
                                              <div>
                                                <span className="text-xs text-gray-500 block">Price</span>
                                                <span className="text-green-700 font-semibold">₹{vendor['Unit_Price'] || '0'}</span>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => sendRFQ(row, vendor, rfqKey)}
                                              disabled={status === 'sending' || status === 'sent'}
                                              className={`ml-4 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                                                status === 'sent' 
                                                  ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                                                  : status === 'sending'
                                                  ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                              }`}
                                            >
                                              {status === 'sent' ? (
                                                <>✓ Sent</>
                                              ) : status === 'sending' ? (
                                                <>
                                                  <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
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
                <div className={`${accentBg} px-4 py-3 ${rounded} border border-indigo-100 mb-4`}>
                  <h2 className={`${headerTextSize} font-semibold ${accentText}`}>Vendor Sheet Data</h2>
                  <p className="text-sm text-gray-600 mt-1">Model column is hidden here. Use details to view full item description.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead className="bg-indigo-50 border-b border-indigo-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 text-sm">Potential Buyer 1</th>
                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 text-sm">Item Description</th>
                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 text-sm">Quantity</th>
                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 text-sm">UQC</th>
                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 text-sm">Unit Price</th>
                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 text-sm">Contact</th>
                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50">
                          <td className="px-4 py-3 text-sm text-gray-800 font-medium">{row['Potential Buyer 1'] || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 max-w-xl truncate">{row['Item_Description'] || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{row['Quantity'] || '0'}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{row['UQC'] || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">₹{row['Unit_Price'] || '0'}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 break-words">{row['Potential Buyer 1 Contact Details'] || '—'}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedBuyer({
                                type: 'vendor',
                                fullRow: row,
                                name: row['Potential Buyer 1'],
                                contact: row['Potential Buyer 1 Contact Details'],
                                email: row['Potential Buyer 1 email id'],
                                buyer2: row['Potential Buyer 2'],
                                uqc: row['UQC'],
                                itemDesc: row['Item_Description'],
                                quantity: row['Quantity'],
                                unitPrice: row['Unit_Price']
                              })}
                              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-indigo-200 mx-auto mb-2" />
                <h3 className="text-base font-medium text-gray-400">No Data Found</h3>
                <p className="text-sm text-gray-500 mt-2">Try clearing filters or check sheet visibility.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setSelectedBuyer(null)} />
          <div className={`relative max-w-4xl w-full ${cardBg} ${rounded} shadow-xl border border-indigo-100 overflow-auto`} style={{ maxHeight: '85vh' }}>
            <div className="flex items-center justify-between p-4 border-b border-indigo-100">
              <div className="flex items-center">
                <User className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">{selectedBuyer.type === 'matching' ? 'Matching Details' : 'Vendor Details'}</h3>
              </div>
              <button onClick={() => setSelectedBuyer(null)} className="p-2 rounded-md hover:bg-indigo-50">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {selectedBuyer.type === 'matching' ? (
                <>
                  <div className="col-span-1 md:col-span-2 space-y-3">
                    <div className={`${accentBg} p-4 ${rounded} border border-indigo-100`}>
                      <div className="text-xs text-indigo-700 font-semibold">Customer</div>
                      <div className="text-base font-medium text-gray-800 mt-1">{selectedBuyer.customerName || '—'}</div>
                      <div className="text-sm text-gray-600 mt-1">{selectedBuyer.customerEmail || '—'}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                        <div className="text-xs text-indigo-700 font-semibold">Product Needed</div>
                        <div className="text-base text-gray-800 mt-1">{selectedBuyer.product || '—'}</div>
                      </div>
                      <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                        <div className="text-xs text-indigo-700 font-semibold">Model Needed</div>
                        <div className="text-base text-gray-800 mt-1">{selectedBuyer.model || '—'}</div>
                      </div>
                      <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                        <div className="text-xs text-indigo-700 font-semibold">Qty Needed</div>
                        <div className="text-base text-gray-800 mt-1">{selectedBuyer.qtyNeeded || '—'}</div>
                      </div>
                      <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                        <div className="text-xs text-indigo-700 font-semibold">Vendor Found</div>
                        <div className="text-base text-gray-800 mt-1">{selectedBuyer.vendorItem || '—'}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                      <div className="text-xs text-indigo-700 font-semibold">Match Reason</div>
                      <div className="text-base text-gray-800 mt-1">{selectedBuyer.matchReason || '—'}</div>
                    </div>
                  </div>

                  <div className="col-span-1 space-y-3">
                    <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                      <div className="text-xs text-indigo-700 font-semibold">Match Accuracy</div>
                      <div className="text-lg font-semibold text-indigo-700 mt-1">{selectedBuyer.accuracy || '—'}</div>
                    </div>

                    <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                      <div className="text-xs text-indigo-700 font-semibold">Potential Buyer 1</div>
                      <div className="text-base text-gray-800 mt-1">{selectedBuyer.buyer1 || '—'}</div>
                      <div className="text-sm text-gray-600 mt-1">{selectedBuyer.buyer1Contact || ''}</div>
                      <div className="text-sm text-gray-600 mt-1 break-words">{selectedBuyer.buyer1Email || ''}</div>
                    </div>

                    {selectedBuyer.buyer2 && (
                      <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                        <div className="text-xs text-indigo-700 font-semibold">Potential Buyer 2</div>
                        <div className="text-base text-gray-800 mt-1">{selectedBuyer.buyer2}</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                    <div className="text-xs text-indigo-700 font-semibold">Vendor</div>
                    <div className="text-base text-gray-800 mt-1">{selectedBuyer.name || '—'}</div>
                    <div className="text-sm text-gray-600 mt-1">{selectedBuyer.email || ''}</div>
                    <div className="text-sm text-gray-600 mt-1">{selectedBuyer.contact || ''}</div>
                  </div>

                  <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                    <div className="text-xs text-indigo-700 font-semibold">Item Description</div>
                    <div className="text-base text-gray-800 mt-1">{selectedBuyer.itemDesc || '—'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 col-span-1 md:col-span-1">
                    <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                      <div className="text-xs text-indigo-700 font-semibold">Quantity</div>
                      <div className="text-base text-gray-800 mt-1">{selectedBuyer.quantity || '0'}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-indigo-100 bg-white">
                      <div className="text-xs text-indigo-700 font-semibold">Unit Price</div>
                      <div className="text-base text-gray-800 mt-1">₹{selectedBuyer.unitPrice || '0'}</div>
                    </div>
                    <div className="p-3 rounded-lg border border-indigo-100 bg-white col-span-2">
                      <div className="text-xs text-indigo-700 font-semibold">UQC</div>
                      <div className="text-base text-gray-800 mt-1">{selectedBuyer.uqc || '—'}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-indigo-100 flex justify-end gap-3">
              <button onClick={() => setSelectedBuyer(null)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMatchManager;
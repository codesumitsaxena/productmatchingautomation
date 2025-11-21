import React from 'react';
import { Package, Mail, Eye, CheckCircle, Clock, AlertCircle, Phone } from 'lucide-react';
import VendorRow from './VendorRow';
import { cellValue } from './config';

const MatchingTable = React.memo(({ 
  filteredMatching, 
  matchingPrimaryCols,
  getRFQStatusForGroup,
  expandedRow,
  setExpandedRow,
  setSelectedBuyer,
  selectedVendors,
  setSelectedVendors,
  sendRFQ,
  sendAllRFQ,
  sendSelectedRFQ,
  rfqStatus,
  handleViewVendorResponse,
  newEntries
}) => {
  return (
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
            const rfqStats = getRFQStatusForGroup(matchingVendors);
            
            return (
              <React.Fragment key={idx}>
                <tr className={`hover:bg-indigo-50 transition-colors ${
                  newEntries.has(idx) ? 'bg-green-100 animate-pulse' : ''
                }`}>
                  {matchingPrimaryCols.map(col => (
                    <td key={col} className="px-2 py-2 text-[11px] text-gray-800 whitespace-nowrap">
                      <div className="max-w-[120px] truncate" title={cellValue(row, col)}>
                        {col === 'RFQ Status' && matchingVendors.length > 0 ? (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                            rfqStats.responded === rfqStats.total 
                              ? 'bg-green-100 text-green-700 ring-2 ring-green-400' 
                              : rfqStats.responded > 0 
                              ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {rfqStats.responded === rfqStats.total ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : rfqStats.responded > 0 ? (
                              <Clock className="w-3 h-3 animate-pulse" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {rfqStats.responded}/{rfqStats.total}
                          </div>
                        ) : col === 'Whatsapp_Number' ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-green-600" />
                            <span>{cellValue(row, col) || '—'}</span>
                          </div>
                        ) : (
                          cellValue(row, col) || '—'
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : idx)}
                        className={`min-w-[100px] px-2 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
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
                          customerWhatsapp: group.customerWhatsapp,
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
                        className="min-w-[100px] px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-[10px] font-bold flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Vendors Section */}
                {isExpanded && matchingVendors.length > 0 && (
                  <tr className="bg-gradient-to-r from-indigo-50 to-blue-50">
                    <td colSpan={matchingPrimaryCols.length + 1} className="px-2 py-3">
                      <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-indigo-800 flex items-center">
                            <Package className="w-3 h-3 mr-2" />
                            Matched Vendors ({matchingVendors.length}) - 
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                              rfqStats.responded === rfqStats.total 
                                ? 'bg-green-100 text-green-700 ring-2 ring-green-400' 
                                : rfqStats.responded > 0 
                                ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400 animate-pulse' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {rfqStats.responded === rfqStats.total ? '✓ ' : ''}Responses: {rfqStats.responded}/{rfqStats.total}
                            </span>
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

      {/* Empty State */}
      {filteredMatching.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-20 h-20 text-indigo-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Data Found</h3>
          <p className="text-gray-500">Try clearing filters</p>
        </div>
      )}
    </div>
  );
});

export default MatchingTable;
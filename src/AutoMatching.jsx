import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Package, TrendingUp, X, Mail, Eye, CheckCircle, Clock, AlertCircle, User, ChevronLeft, ChevronRight, Phone, Send, DollarSign, ShoppingBag } from 'lucide-react';

// ============================================
// ENVIRONMENT CONFIG
// ============================================
const CONFIG = {
  MATCHING_SHEET_URL: window.ENV?.VITE_MATCHING_SHEET_URL || 'https://docs.google.com/spreadsheets/d/1dLhQJWr26bEphJG-sNvvjW3bizNDDmY3jAYkljrsH_Q/edit?gid=1282806052',
  N8N_WEBHOOK_URL: window.ENV?.VITE_N8N_WEBHOOK_URL || 'https://n8n.avertisystems.com/webhook-test/send-vendor-rfq',
  N8N_CUSTOMER_OFFER_URL: window.ENV?.VITE_N8N_CUSTOMER_OFFER_URL || 'https://n8n.avertisystems.com/webhook-test/send-customer-offer',
  ITEMS_PER_PAGE: 50
};

// ============================================
// VENDOR RESPONSE MODAL COMPONENT
// ============================================
const VendorResponseModal = React.memo(({ isOpen, onClose, vendorData, matchData }) => {
  const [offerPrice, setOfferPrice] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);

  if (!isOpen) return null;

  const hasResponse = vendorData?.Product_Available || vendorData?.Vendor_Price;

  const handleSendOffer = async () => {
    if (!offerPrice || offerPrice <= 0) {
      alert('❌ Please enter a valid price!');
      return;
    }

    if (!matchData?.customerWhatsapp) {
      alert('❌ Customer WhatsApp number not available!');
      return;
    }

    const confirmMsg = `Send offer to customer?\n\nCustomer: ${matchData.customerName}\nProduct: ${matchData.product}\nOffer Price: ₹${offerPrice}\nVendor Price: ₹${vendorData.Vendor_Price}`;
    
    if (!window.confirm(confirmMsg)) return;

    setSendingOffer(true);

    try {
      const response = await fetch(CONFIG.N8N_CUSTOMER_OFFER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchID: matchData.matchID,
          customerName: matchData.customerName,
          customerWhatsapp: matchData.customerWhatsapp,
          customerEmail: matchData.customerEmail,
          product: matchData.product,
          quantity: matchData.quantity,
          vendorName: matchData.vendorName,
          vendorPrice: vendorData.Vendor_Price,
          offerPrice: offerPrice,
          availableQty: vendorData.Available_Qty,
          canDeliver: vendorData.Can_Deliver
        })
      });

      if (response.ok) {
        alert(`✅ Offer Sent Successfully!\n\nCustomer: ${matchData.customerName}\nOffer Price: ₹${offerPrice}\nSent to: ${matchData.customerWhatsapp}`);
        setOfferPrice('');
        onClose();
      } else {
        throw new Error('Failed to send offer');
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      alert('❌ Failed to send offer. Please try again.');
    } finally {
      setSendingOffer(false);
    }
  };

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

              {vendorData.Product_Available === 'YES' && vendorData.Vendor_Price && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-indigo-200">
                  <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Send Offer to Customer
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-orange-200 mb-3">
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-gray-600">Vendor Price:</span>
                        <span className="ml-2 font-bold text-green-600">₹{vendorData.Vendor_Price}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <span className="ml-2 font-bold text-gray-900">{matchData?.customerName}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">
                        Enter Your Offer Price (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                        <input
                          type="number"
                          value={offerPrice}
                          onChange={(e) => setOfferPrice(e.target.value)}
                          placeholder="Enter price..."
                          className="w-full pl-8 pr-4 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring--400 focus:border-indigo-400 outline-none text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendOffer}
                    disabled={sendingOffer || !offerPrice}
                    className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      sendingOffer || !offerPrice
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {sendingOffer ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Offer...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Offer to Customer via WhatsApp
                      </>
                    )}
                  </button>
                  <p className="text-xs text-indigo-800 mt-2 text-center">
                    Offer will be sent to: {matchData?.customerWhatsapp || 'N/A'}
                  </p>
                </div>
              )}
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
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

// ============================================
// VENDOR ROW COMPONENT
// ============================================
const VendorRow = React.memo(({ vendor, onSendRFQ, rfqStatus, onViewResponse, isSelected, onToggleSelect }) => {
  const rfqKey = `${vendor.matchID}-${vendor.name}`;
  const status = rfqStatus[rfqKey];
  const hasResponse = vendor.originalRow?.['vendor Product_available'] || vendor.originalRow?.['Vendor Price'];

  return (
    <div className={`flex flex-col lg:flex-row lg:items-center justify-between p-3 rounded-xl border-2 transition-all gap-3 ${
      hasResponse 
        ? 'bg-green-50 border-green-400 hover:border-green-500 hover:shadow-xl' 
        : 'bg-gray-50 border-gray-200 hover:border-indigo-300 hover:shadow-md'
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
        />
        {hasResponse && (
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600 animate-pulse" />
          </div>
        )}
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
            <span className="text-gray-800 font-medium">{vendor.availableQty || '0'} {vendor.uqc || ''}</span>
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
          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap ${
            hasResponse 
              ? 'bg-green-600 text-white hover:bg-green-700 ring-2 ring-green-400' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {hasResponse ? (
            <>
              <CheckCircle className="w-4 h-4 animate-pulse" />
              ✓ Response
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Response
            </>
          )}
        </button>
      </div>
    </div>
  );
});

// ============================================
// CUSTOMER DETAILS MODAL
// ============================================
const CustomerDetailsModal = React.memo(({ selectedBuyer, onClose, onSendAllRFQ }) => {
  if (!selectedBuyer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold">Customer Request Details</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20">
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
            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-300">
              <div className="text-xs text-green-700 font-bold mb-2 flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                WhatsApp Number
              </div>
              <div className="text-sm font-semibold text-gray-900">{selectedBuyer.customerWhatsapp || '—'}</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="text-xs text-indigo-700 font-bold mb-2">Email</div>
              <div className="text-sm font-semibold text-gray-900 break-all">{selectedBuyer.customerEmail}</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 md:col-span-2">
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
                    onSendAllRFQ(selectedBuyer.matchingVendors);
                    onClose();
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
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

// ============================================
// MATCHING TABLE COMPONENT
// ============================================
const MatchingTable = React.memo(({ 
  filteredMatching, 
  matchingPrimaryCols, 
  cellValue, 
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

// ============================================
// MAIN COMPONENT
// ============================================
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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSheetData();
    const interval = setInterval(fetchSheetData, 3880000);
    return () => clearInterval(interval);
  }, []);

  const parseGoogleSheetUrl = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/gid=([0-9]+)/);
    return { sheetId: match ? match[1] : null, gid: gidMatch ? gidMatch[1] : '0' };
  };

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

      const matchingUrl = `https://docs.google.com/spreadsheets/d/${matchingInfo.sheetId}/gviz/tq?tqx=out:csv&gid=${matchingInfo.gid}`;
      const matchingRes = await fetch(matchingUrl);
      const matchingCsv = await matchingRes.text();
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
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Ensure sheet is public and accessible.');
      setLoading(false);
    }
  };

  const cellValue = useCallback((row, key) => {
    return row?.[key] ?? (row?.[key.replace(/ /g, '_')] ?? '—');
  }, []);

  const sendAllRFQ = async (vendors) => {
    if (!CONFIG.N8N_WEBHOOK_URL) {
      alert('❌ Configuration Error: Webhook URL not configured!');
      return;
    }

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
        console.error('Error sending RFQ to:', vendor.name, error);
        failCount++;
        setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    alert(`✅ RFQ Sending Complete!\n\n✓ Success: ${successCount}\n✗ Failed: ${failCount}`);
    setTimeout(() => setRfqStatus({}), 3000);
  };

  const sendSelectedRFQ = async (vendors) => {
    if (!CONFIG.N8N_WEBHOOK_URL) {
      alert('❌ Configuration Error: Webhook URL not configured!');
      return;
    }

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
        console.error('Error sending RFQ to:', vendor.name, error);
        failCount++;
        setRfqStatus(prev => ({ ...prev, [rfqKey]: null }));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    alert(`✅ RFQ Sending Complete!\n\n✓ Success: ${successCount}\n✗ Failed: ${failCount}`);
    setSelectedVendors({});
    setTimeout(() => setRfqStatus({}), 3000);
  };

  const sendRFQ = async (vendor, rfqKey) => {
    if (!CONFIG.N8N_WEBHOOK_URL) {
      alert('❌ Configuration Error: Webhook URL not configured!');
      return;
    }

    if (!vendor.contact || vendor.contact === '—') {
      alert('❌ Vendor contact number not available!');
      return;
    }
    
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

  const handleViewVendorResponse = useCallback((vendor) => {
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
      customerAddress: vendor.customerAddress,
      customerWhatsapp: vendor.customerWhatsapp
    };
  
    setVendorResponseModal({
      isOpen: true,
      data: vendorResponse,
      matchData: matchData
    });
  }, [cellValue]);

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
          customerAddress: cellValue(row, 'Customer_Address'),
          customerWhatsapp: cellValue(row, 'Whatsapp_Number')
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
            availableQty: cellValue(row, 'Vendor_Available_Qty') || '0',
            uqc: cellValue(row, 'UQC') || '',
            price: cellValue(row, 'Vendor_Price') || '0',
            matchID: matchID,
            originalRow: row,
            customerName,
            product,
            model: cellValue(row, 'Model_Needed'),
            quantity: cellValue(row, 'Qty_Needed'),
            customerEmail: cellValue(row, 'Customer_Email') || cellValue(row, 'Email_Address'),
            customerAddress: cellValue(row, 'Customer_Address'),
            customerWhatsapp: cellValue(row, 'Whatsapp_Number')
          });
        }
      }
    });
    
    return Object.values(groups);
  }, [matchingData, cellValue]);

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

  const matchingPrimaryCols = [
    'Match_ID',
    'Customer_Name',
    'Whatsapp_Number',
    'Product_Needed',
    'Qty_Needed',
    'RFQ Status'
  ];

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
      <aside className="w-full lg:w-72 bg-white border-b lg:border-r lg:border-b-0 border-indigo-100 flex-shrink-0 shadow-lg">
        <div className="p-4 border-b border-indigo-100">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">OPT2Deal</h1>
              <p className="text-xs text-gray-500">Vendor Management</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-2">
          <button
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg font-semibold text-sm"
          >
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

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 bg-white border-b border-indigo-100">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer name, product, or Match ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border-2 border-indigo-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
        </div>

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
              matchingPrimaryCols={matchingPrimaryCols}
              cellValue={cellValue}
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
      />
    </div>
  );
};

export default VendorMatchManager;
import React, { useState, useEffect } from 'react';
import { Package, X, Mail, CheckCircle, Clock, AlertCircle, DollarSign, Send, Edit3 } from 'lucide-react';
import { CONFIG } from './config';

const VendorResponseModal = React.memo(({ isOpen, onClose, vendorData, matchData, onOfferSent }) => {
  const [offerPrice, setOfferPrice] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerSent, setOfferSent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sentOfferPrice, setSentOfferPrice] = useState('');

  // Check if offer already sent from sheet data
  useEffect(() => {
    if (vendorData?.Client_Offering_Price && vendorData.Client_Offering_Price !== '—' && vendorData.Client_Offering_Price !== '') {
      setOfferSent(true);
      setSentOfferPrice(vendorData.Client_Offering_Price);
      setOfferPrice(vendorData.Client_Offering_Price);
    } else {
      setOfferSent(false);
      setSentOfferPrice('');
    }
  }, [vendorData]);

  if (!isOpen) return null;

  const hasResponse = vendorData?.Product_Available || vendorData?.Vendor_Price;
  
  const handleSendOffer = async () => {
    if (!offerPrice || offerPrice <= 0) {
      alert('❌ Please enter a valid price!');
      return;
    }

    // FIXED: Better validation with multiple fallback checks
    const whatsappNumber = matchData?.customerWhatsapp || 
                          matchData?.whatsappNumber || 
                          '';
    
    // Debug log
    console.log('💬 Sending offer with WhatsApp:', whatsappNumber);
    console.log('📋 Full matchData:', matchData);
    
    if (!whatsappNumber || whatsappNumber === '—' || whatsappNumber.trim() === '') {
      alert('❌ Customer WhatsApp number not available!\n\nPlease ensure the WhatsApp number is present in the sheet.');
      return;
    }

    const confirmMsg = `Send offer to customer?\n\nCustomer: ${matchData.customerName}\nWhatsApp: ${whatsappNumber}\nProduct: ${matchData.product}\nOffer Price: ₹${offerPrice}\nVendor Price: ₹${vendorData.Vendor_Price}`;
    
    if (!window.confirm(confirmMsg)) return;

    setSendingOffer(true);

    try {
      const payload = {
        matchID: matchData.matchID,
        customerName: matchData.customerName,
        customerWhatsapp: matchData.whatsappNumber,
        customerEmail: matchData.customerEmail,
        product: matchData.product,
        model: matchData.model || '',
        quantity: matchData.quantity,
        vendorName: matchData.vendorName,
        vendorContact: matchData.vendorContact,
        vendorPrice: vendorData.Vendor_Price,
        offerPrice: offerPrice,
        availableQty: vendorData.Available_Qty,
        canDeliver: vendorData.Can_Deliver,
        clientOfferingPrice: offerPrice,
        isEdit: isEditing
      };

      console.log('Sending offer payload:', payload);

      const response = await fetch(CONFIG.N8N_CUSTOMER_OFFER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setOfferSent(true);
        setSentOfferPrice(offerPrice);
        setIsEditing(false);
        
        if (onOfferSent) {
          onOfferSent(matchData.matchID, offerPrice);
        }

        alert(`✅ Offer ${isEditing ? 'Updated &' : ''} Sent Successfully!\n\nCustomer: ${matchData.customerName}\nOffer Price: ₹${offerPrice}\nSent to: ${whatsappNumber}`);
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

  const handleEdit = () => {
    setIsEditing(true);
    setOfferSent(false);
  };

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
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all">
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
                <span className="text-xs text-gray-600 block mb-1">Customer WhatsApp</span>
                <span className="font-semibold text-green-600">
                  {matchData?.customerWhatsapp || matchData?.whatsappNumber || '—'}
                </span>
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
            </div>
          </div>

          {hasResponse ? (
            <div className="space-y-4">
              {/* Response Status */}
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
                      <div className="text-xl font-bold text-green-600">₹{vendorData.Vendor_Price || '—'}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Available Qty</div>
                      <div className="text-xl font-bold text-indigo-600">{vendorData.Available_Qty || '—'}</div>
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

              {/* Send Offer Section */}
              {vendorData.Product_Available === 'YES' && vendorData.Vendor_Price && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-indigo-200">
                  <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Send Offer to Customer
                    {offerSent && !isEditing && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ Offer Sent
                      </span>
                    )}
                  </h4>
                  
                  <div className="bg-white p-4 rounded-lg border border-indigo-200 mb-3">
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-gray-600">Vendor Price:</span>
                        <span className="ml-2 font-bold text-green-600">₹{vendorData.Vendor_Price}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <span className="ml-2 font-bold text-gray-900">{matchData?.customerName}</span>
                      </div>
                      {sentOfferPrice && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Last Sent Offer:</span>
                          <span className="ml-2 font-bold text-indigo-600">₹{sentOfferPrice}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700">
                        {offerSent && !isEditing ? 'Sent Offer Price (₹)' : 'Enter Your Offer Price (₹)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                        <input
                          type="number"
                          value={offerPrice}
                          onChange={(e) => setOfferPrice(e.target.value)}
                          placeholder="Enter price..."
                          disabled={offerSent && !isEditing}
                          className={`w-full pl-8 pr-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none text-sm font-semibold ${
                            offerSent && !isEditing 
                              ? 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed' 
                              : 'border-indigo-300 bg-white'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    {offerSent && !isEditing ? (
                      <>
                        <button
                          onClick={handleEdit}
                          className="flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-orange-500 text-white hover:bg-orange-600 shadow-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Offer
                        </button>
                        <button
                          onClick={handleSendOffer}
                          disabled={sendingOffer}
                          className="flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 shadow-lg transition-all"
                        >
                          <Send className="w-4 h-4" />
                          Resend Offer
                        </button>
                      </>
                    ) : (
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
                            {isEditing ? 'Update & Send Offer' : 'Send Offer to Customer via WhatsApp'}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-indigo-800 mt-2 text-center">
                    Offer will be sent to: <span className="font-bold">
                      {matchData?.customerWhatsapp || matchData?.whatsappNumber || 'N/A'}
                    </span>
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

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-sm transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

export default VendorResponseModal;
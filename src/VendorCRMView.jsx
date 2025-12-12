import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, X, Mail, User, Phone, Users, Filter, Upload, RefreshCw } from 'lucide-react';
import CONFIG from './AppConfig';
import { safeValue, getFieldValue } from './sharedUtils';


const VendorCRMDetailsModal = React.memo(({ selectedVendor, onClose }) => {
  if (!selectedVendor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* 🎯 MODAL HEIGHT & SIZE ADJUSTED: max-h-fit and smaller max-w-xl */}
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-indigo-600 text-white px-4 sm:px-6 py-2 flex items-center justify-between">
          <h2 className="text-sm sm:text-lg font-bold">Vendor Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-700 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 🎯 Compact Layout */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4">
            
            {/* Product Description (Top Section) */}
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Product Description</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5">
                {getFieldValue(selectedVendor, 'Item_Description', 'itemDescription', 'item_description')}
              </p>
            </div>

            {/* Quantity, UQC, Unit Price (Middle Section) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-2 text-center border">
                <p className="text-[10px] text-gray-600 mb-0.5">Quantity</p>
                <p className="text-sm sm:text-base font-bold text-blue-600">
                  {getFieldValue(selectedVendor, 'Quantity', 'quantity')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center border">
                <p className="text-[10px] text-gray-600 mb-0.5">UQC</p>
                <p className="text-sm sm:text-base font-bold text-green-600">
                  {getFieldValue(selectedVendor, 'UQC', 'uqc')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center border">
                <p className="text-[10px] text-gray-600 mb-0.5">Unit Price</p>
                <p className="text-sm sm:text-base font-bold text-purple-600">
                  {getFieldValue(selectedVendor, 'Unit_Price', 'unitPrice', 'unit_price')}
                </p>
              </div>
            </div>

            {/* Contact & Buyers (Bottom Section) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Contact Information */}
              <div className="bg-white rounded-lg p-3 border shadow-sm space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-indigo-600">Contact Details</h4>
                {/* WhatsApp Number */}
                <div> 
                  <p className="text-[10px] text-gray-600 mb-0">WhatsApp Number</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {getFieldValue(selectedVendor, 'Potential_Buyer_1_Contact_Detail', 'contactDetails', 'contact_details', 'contact')}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <p className="text-[10px] text-gray-600 mb-0">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                    <p className="text-xs font-semibold text-gray-900 break-all truncate">
                      {getFieldValue(selectedVendor, 'Potential_Buyer_1_Email', 'emailId', 'email_id', 'email')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Buyer Information */}
              <div className="bg-white rounded-lg p-3 border shadow-sm space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-orange-600">Potential Buyers</h4>
                {/* Potential Buyer 1 */}
                <div>
                  <p className="text-[10px] text-gray-600 mb-0">Buyer 1</p>
                  <p className="text-xs font-bold text-orange-900 truncate">
                    {getFieldValue(selectedVendor, 'Potential_Buyer_1', 'potentialBuyer1', 'potential_buyer_1')}
                  </p>
                </div>

                {/* Potential Buyer 2 */}
                <div>
                  <p className="text-[10px] text-gray-600 mb-0">Buyer 2</p>
                  <p className="text-xs font-bold text-orange-900 truncate">
                    {getFieldValue(selectedVendor, 'Potential_Buyer_2', 'potentialBuyer2', 'potential_buyer_2')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - (No Change) */}
        <div className="border-t border-gray-200 p-3 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              const phone = getFieldValue(selectedVendor, 'Potential_Buyer_1_Contact_Detail', 'contactDetails', 'contact_details', 'contact');
              if (phone !== 'N/A') {
                window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
              } else {
                alert('WhatsApp number not available');
              }
            }}
            className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Phone className="w-4 h-4" />
            Send RFQ via WhatsApp
          </button>
          <button
            onClick={() => {
              const email = getFieldValue(selectedVendor, 'Potential_Buyer_1_Email', 'emailId', 'email_id', 'email');
              if (email !== 'N/A') {
                window.location.href = `mailto:${email}`;
              } else {
                alert('Email address not available');
              }
            }}
            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 font-semibold transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
});


// --- Main Component ---

export const VendorCRMView = ({ baseApiUrl }) => {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const GET_ALL_API = `${baseApiUrl}/api/products`;
  const UPLOAD_API = `${baseApiUrl}/api/products/upload-csv`;
  const SEARCH_API = CONFIG.VENDOR_SEARCH_API_URL;
  
  const fetchData = useCallback(async (search = '') => {
    setLoading(true);
    setError('');
    let apiUrl;

    if (search.trim() !== '') {
      apiUrl = `${SEARCH_API}${encodeURIComponent(search.trim())}`;
    } else {
      apiUrl = GET_ALL_API;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let vendorData = [];
      
      // 💥 CRITICAL FIX: Handle various API response structures
      if (Array.isArray(data)) {
        vendorData = data;
      } else if (data.matches && Array.isArray(data.matches)) {
        vendorData = data.matches;
      } else if (data.vendors && Array.isArray(data.vendors)) {
        vendorData = data.vendors;
      } else if (data.data && Array.isArray(data.data)) {
        vendorData = data.data; // Added this case (common structure)
      } else if (data.products && Array.isArray(data.products)) {
        vendorData = data.products;
      } else if (data.results && Array.isArray(data.results)) {
        vendorData = data.results;
      } else if (data.count === 0 || data.success === false) {
        vendorData = [];
      } else if (data) {
        // Fallback for unexpected direct object payload, often nested
        vendorData = (data.data || data.products || data.items || data.results) || [];
      }
      
      // Final check and error reporting
      if (vendorData.length === 0 && search.trim() === '') {
        setError('No data found in API response. Please check if your API has data or upload a CSV file.');
      } else if (vendorData.length === 0 && search.trim() !== '') {
        setError(`No results found for "${search}"`);
      } else {
        setError('');
      }

      setVendors(vendorData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('❌ Error fetching data: ' + err.message + '. Make sure your ngrok tunnel is running and the API URL is correct.');
    } finally {
      setLoading(false);
    }
  }, [GET_ALL_API, SEARCH_API]);

  // Debounce the search term for API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() !== '') {
          fetchData(searchTerm);
      } else {
          fetchData('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchData]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchData('');
  }, []);


  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(UPLOAD_API, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData?.message || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      alert('✅ CSV uploaded successfully! ' + (result.message || ''));
      setTimeout(() => fetchData(searchTerm), 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError('❌ Error uploading CSV: ' + err.message);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const openDetailsModal = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedVendor(null);
  };

  const totalProducts = vendors.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3">
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Vendor CRM Data</h1>
                  <p className="text-[10px] sm:text-xs text-gray-600">manage your vendor product data</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Item Description, Buyer, or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg w-full sm:w-64 md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchData('')}
                  disabled={loading}
                  className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                   <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                   <span>Refresh Data</span>
                </button>
                <label className="flex-1 sm:flex-initial bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 sm:mb-4">
          <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-indigo-500 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-[10px] sm:text-xs mb-1 font-medium">Total Products</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <div className="bg-indigo-100 p-2 rounded-full">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-[10px] sm:text-xs mb-1 font-medium">Filtered Results</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{vendors.length}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Filter className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-[10px] sm:text-xs mb-1 font-medium">Unique Products</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs sm:text-sm shadow-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-6 bg-white rounded-xl shadow-md">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
            <p className="mt-2 text-gray-600 text-xs sm:text-sm font-medium">Loading vendor data...</p>
          </div>
        )}

        {/* Table/Card View */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-600">
                  <tr>
                    {/* Item Description की चौड़ाई बढ़ाई गई है */}
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide" style={{minWidth: '250px'}}>Item Description</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">Potential Buyer 1</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">Quantity</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">UQC</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">Unit Price</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">Potential Buyer 2</th>
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">Contact Details</th>
                    {/* 🎯 Email ID COLUMN REMOVED */}
                    <th className="px-2 py-2 text-left text-[10px] font-bold text-white uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.length === 0 ? (
                    <tr>
                      {/* colSpan 9 से 8 हो जाएगा, क्योंकि एक कॉलम हटा दिया गया है */}
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">No vendor data available</p>
                        <p className="text-xs mt-1">{searchTerm ? `No results for "${searchTerm}". Try clearing the search term or` : ''} Upload a CSV file to get started</p>
                      </td>
                    </tr>
                  ) : (
                    vendors.map((vendor, index) => (
                      <tr key={index} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-2 py-2 text-[11px] text-gray-900 font-medium">
                          <div className="line-clamp-2">
                            {getFieldValue(vendor, 'Item_Description', 'itemDescription', 'item_description')}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-[11px] text-gray-700">
                          {getFieldValue(vendor, 'Potential_Buyer_1', 'potentialBuyer1', 'potential_buyer_1')}
                        </td>
                        <td className="px-2 py-2 text-[11px] text-gray-700 font-semibold">
                          {getFieldValue(vendor, 'Quantity', 'quantity')}
                        </td>
                        <td className="px-2 py-2 text-[11px] text-gray-700">
                          {getFieldValue(vendor, 'UQC', 'uqc')}
                        </td>
                        <td className="px-2 py-2 text-[11px] text-indigo-600 font-bold">
                          {getFieldValue(vendor, 'Unit_Price', 'unitPrice', 'unit_price')}
                        </td>
                        <td className="px-2 py-2 text-[11px] text-gray-700">
                          {getFieldValue(vendor, 'Potential_Buyer_2', 'potentialBuyer2', 'potential_buyer_2')}
                        </td>
                        <td className="px-2 py-2 text-[11px]">
                          <div className="flex items-center gap-1 text-green-600">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>{getFieldValue(vendor, 'Potential_Buyer_1_Contact_Detail', 'contactDetails', 'contact_details', 'contact')}</span>
                          </div>
                        </td>
                        
                        {/* 🎯 Email ID CELL REMOVED */}
                        
                        <td className="px-2 py-2 text-[11px]">
                          <button
                            onClick={() => openDetailsModal(vendor)}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm text-[10px]"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
              {vendors.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No vendor data available</p>
                  <p className="text-xs mt-1">{searchTerm ? `No results for "${searchTerm}". Try clearing the search term or` : ''} Upload a CSV file to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {vendors.map((vendor, index) => (
                    <div key={index} className="p-3 hover:bg-indigo-50 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-[10px] text-gray-500 mb-1 font-medium uppercase">Item Description</p>
                            <p className="text-xs font-bold text-gray-900">
                              {getFieldValue(vendor, 'Item_Description', 'itemDescription', 'item_description')}
                            </p>
                          </div>
                          <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <p className="text-[10px] text-gray-500 mb-1 font-medium">Potential Buyer 1</p>
                            <p className="text-xs text-gray-900 font-medium">
                              {getFieldValue(vendor, 'Potential_Buyer_1', 'potentialBuyer1', 'potential_buyer_1')}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <p className="text-[10px] text-gray-500 mb-1 font-medium">Potential Buyer 2</p>
                            <p className="text-xs text-gray-900 font-medium">
                              {getFieldValue(vendor, 'Potential_Buyer_2', 'potentialBuyer2', 'potential_buyer_2')}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-blue-50 p-2 rounded-lg text-center">
                            <p className="text-[10px] text-gray-500 mb-1 font-medium">Quantity</p>
                            <p className="text-xs font-bold text-gray-900">
                              {getFieldValue(vendor, 'Quantity', 'quantity')}
                            </p>
                          </div>
                          <div className="bg-green-50 p-2 rounded-lg text-center">
                            <p className="text-[10px] text-gray-500 mb-1 font-medium">UQC</p>
                            <p className="text-xs font-bold text-gray-900">
                              {getFieldValue(vendor, 'UQC', 'uqc')}
                            </p>
                          </div>
                          <div className="bg-indigo-50 p-2 rounded-lg text-center">
                            <p className="text-[10px] text-gray-500 mb-1 font-medium">Price</p>
                            <p className="text-xs font-bold text-indigo-600">
                              {getFieldValue(vendor, 'Unit_Price', 'unitPrice', 'unit_price')}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-green-600">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <p className="text-[11px] font-medium truncate">
                              {getFieldValue(vendor, 'Potential_Buyer_1_Contact_Detail', 'contactDetails', 'contact_details', 'contact')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <p className="text-[11px] truncate">
                              {getFieldValue(vendor, 'Potential_Buyer_1_Email', 'emailId', 'email_id', 'email')}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => openDetailsModal(vendor)}
                          className="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md text-xs"
                        >
                          View Details
                        </button>
                    </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <VendorCRMDetailsModal
        selectedVendor={selectedVendor}
        onClose={closeDetailsModal}
      />
    </div>
  );
};

export default VendorCRMView;
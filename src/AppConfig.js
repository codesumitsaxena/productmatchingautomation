
const CONFIG = {
    // New API URL for matching data
    MATCHING_API_URL: window.ENV?.VITE_MATCHING_API_URL || 'https://opt2dealapi.opt2deal.com/api/matching/customer-requests/all',
  
    // N8N Webhook URLs for automation (sending RFQ and customer offer)
    N8N_WEBHOOK_URL: window.ENV?.VITE_N8N_WEBHOOK_URL || 'https://n8n.avertisystems.com/webhook-test/send-vendor-rfq',
    N8N_CUSTOMER_OFFER_URL: window.ENV?.VITE_N8N_CUSTOMER_OFFER_URL || 'https://n8n.avertisystems.com/webhook-test/send-customer-offer',
  
    // Hardcoded for Vender Sheet component logic
    VENDOR_API_BASE_URL: 'https://opt2dealapi.opt2deal.com',
    // Dedicated API for searching Vendor Items
    VENDOR_SEARCH_API_URL: 'https://opt2dealapi.opt2deal.com/api/matching/search?itemDescription=',
    
    ITEMS_PER_PAGE: 50,
  };
  
  export default CONFIG;
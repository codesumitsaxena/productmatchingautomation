// ============================================
// CONFIGURATION FILE
// ============================================

export const CONFIG = {
    MATCHING_SHEET_URL: window.ENV?.VITE_MATCHING_SHEET_URL || 'https://docs.google.com/spreadsheets/d/1dLhQJWr26bEphJG-sNvvjW3bizNDDmY3jAYkljrsH_Q/edit?gid=1282806052',
    N8N_WEBHOOK_URL: window.ENV?.VITE_N8N_WEBHOOK_URL || 'https://n8n.avertisystems.com/webhook-test/send-vendor-rfq',
    N8N_CUSTOMER_OFFER_URL: window.ENV?.VITE_N8N_CUSTOMER_OFFER_URL || 'https://n8n.avertisystems.com/webhook/77695719-ae79-4c6e-baf5-c961a4f23440/webhook',
    ITEMS_PER_PAGE: 50,
    REFRESH_INTERVAL: 300000
  };
  
  // Parse Google Sheet URL
  export const parseGoogleSheetUrl = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/gid=([0-9]+)/);
    return { 
      sheetId: match ? match[1] : null, 
      gid: gidMatch ? gidMatch[1] : '0' 
    };
  };
  
  // Parse CSV data
  export const parseCSV = (csv) => {
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
  
  // Get cell value helper - handles multiple column name formats
  export const cellValue = (row, key) => {
    if (!row) return '—';
    
    // Try exact match first
    if (row[key] !== undefined && row[key] !== '') return row[key];
    
    // Try with underscore replaced by space
    const spaceKey = key.replace(/_/g, ' ');
    if (row[spaceKey] !== undefined && row[spaceKey] !== '') return row[spaceKey];
    
    // Try with space replaced by underscore
    const underscoreKey = key.replace(/ /g, '_');
    if (row[underscoreKey] !== undefined && row[underscoreKey] !== '') return row[underscoreKey];
    
    // Try lowercase variations
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === lowerKey && row[k] !== '') {
        return row[k];
      }
    }
    
    return '—';
  };
  
  // Primary columns for matching table
  export const MATCHING_PRIMARY_COLS = [
    'Match_ID',
    'Customer_Name',
    'Whatsapp_Number',
    'Product_Needed',
    'Qty_Needed',
    'RFQ Status'
  ];
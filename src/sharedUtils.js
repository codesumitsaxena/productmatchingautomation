// src/sharedUtils.js



export const safeValue = (value) => (value === null || value === undefined || value === '') ? '—' : value;

export const getFieldValue = (item, ...keys) => {
  for (const key of keys) {
    if (item && item[key] !== undefined && item[key] !== null && item[key] !== '') {
      return item[key];
    }
  }
  return 'N/A';
};
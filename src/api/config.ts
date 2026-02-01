
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

if (typeof window !== 'undefined') {
  console.log(`📡 API URL is: ${API_BASE_URL}`);
  if (API_BASE_URL.includes('localhost')) {
    console.warn(`⚠️ Using LOCAL API: ${API_BASE_URL}`);
  }
}

export const getApiBaseUrl = () => API_BASE_URL;

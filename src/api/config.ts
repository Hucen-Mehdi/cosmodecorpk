// 🌐 SSR-compatible API URL
export const API_BASE_URL = typeof window === 'undefined'
  ? 'http://localhost:5000/api' // Server: Direct to backend
  : '/api';                     // Client: Relative via Proxy

if (typeof window !== 'undefined') {
  console.log(`🔌 API URL Set to Local: ${API_BASE_URL}`);
}

export const getApiBaseUrl = () => API_BASE_URL;

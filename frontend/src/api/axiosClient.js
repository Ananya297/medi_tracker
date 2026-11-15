// -----------------------------------------------------------------------------
// Module Imports
// Import Axios library for HTTP communications
// -----------------------------------------------------------------------------
import axios from 'axios';

// -----------------------------------------------------------------------------
// Configuration: Base API URL
// Reads VITE_API_BASE_URL from environment variables, fallback to localhost:8000
// -----------------------------------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// -----------------------------------------------------------------------------
// Axios Instance Creation
// Configures default timeouts, headers, and base server address
// -----------------------------------------------------------------------------
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// -----------------------------------------------------------------------------
// Request Interceptor: User Session Injection
// Dynamically extracts active user from localStorage and attaches header / params
// -----------------------------------------------------------------------------
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('medtracker_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.id) {
          // Attach both standard custom header and query fallback
          config.headers['X-User-Id'] = user.id.toString();
          config.params = {
            ...config.params,
            user_id: user.id,
          };
        }
      }
    } catch (err) {
      console.warn('[axiosClient] Unable to parse stored user:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;

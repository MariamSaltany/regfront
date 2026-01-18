import axios from 'axios';

const api = axios.create({
  // Direct connection to Laravel backend
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Interceptor to attach the token and XSRF token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add XSRF token if available
  const xsrfToken = getCookie('XSRF-TOKEN');
  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }
  
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 419) {
      // CSRF token mismatch - try to refresh
      return getCsrfToken().then(() => {
        // Retry the original request
        const originalRequest = error.config;
        return api(originalRequest);
      });
    }
    return Promise.reject(error);
  }
);

// Helper function to get cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper for CSRF (Sanctum)
// Note: sanctum/csrf-cookie is usually NOT under the /api prefix, 
// so we use a full path or a separate instance.
export const getCsrfToken = () =>
  axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { withCredentials: true });

export default api;
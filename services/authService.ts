import api, { getCsrfToken } from './api';

export const authApi = {
  /**
   * Login: Fetches CSRF cookie, posts credentials, and saves the token
   */
  login: async (credentials: any) => {
    // CSRF token not needed since we disabled stateful API
    const response = await api.post('/login', credentials);
    
    // access_token comes from your AuthenticatedSessionController::store
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response;
  },

  /**
   * Register: Similar to login, saves the token immediately after account creation
   */
  register: async (userData: any) => {
    // CSRF token not needed since we disabled stateful API
    const response = await api.post('/register', userData);
    
    // token comes from your RegisteredUserController::store
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  },

  /**
   * Logout: Informs the backend to revoke the token, then cleans local storage
   */
  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      // Always remove token locally even if the server-side call fails
      localStorage.removeItem('token');
    }
  },

  /**
   * GetUser: Fetches the currently authenticated user profile
   * Hits the Route::get('/user') in your api.php
   */
  getUser: () => api.get('/user'),
};
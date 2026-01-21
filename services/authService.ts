import api from './api';

export const authApi = {
  login: async (credentials: any) => {
    const response = await api.post('/login', credentials);

    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }

    return response;
  },

  register: async (userData: any) => {
    const response = await api.post('/register', userData);

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  getUser: () => api.get('/user'),
};

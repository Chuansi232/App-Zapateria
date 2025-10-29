import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const userStored = localStorage.getItem('user');
    console.log('User stored:', userStored);
    
    if (userStored) {
      try {
        const userData = JSON.parse(userStored);
        const token = userData?.token;
        console.log('Token:', token);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Authorization header set:', config.headers.Authorization);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
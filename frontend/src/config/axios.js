import axios from 'axios'

// Create axios instance with credentials and base URL
export const axiosi = axios.create({
  withCredentials: true,
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8000'
})

// Add request interceptor for debugging
axiosi.interceptors.request.use(
  config => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosi.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Response Error:', error.response ? {
      url: error.config.url,
      status: error.response.status,
      data: error.response.data
    } : error);
    return Promise.reject(error);
  }
);
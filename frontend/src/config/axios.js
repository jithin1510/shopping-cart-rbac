import axios from 'axios'

// Create axios instance with credentials and base URL
export const axiosi = axios.create({
  withCredentials: true,
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:8000'
})

// Add request interceptor for debugging
axiosi.interceptors.request.use(
  config => {
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
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
    // Improved error logging
    if (error.response) {
      console.error('API Response Error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        message: error.message
      });
    } else if (error.request) {
      console.error('API No Response Error:', {
        url: error.config?.url,
        request: error.request,
        message: 'No response received from server'
      });
    } else {
      console.error('API Setup Error:', {
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);
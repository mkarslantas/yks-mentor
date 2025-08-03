import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiCall = async (method, url, data = null, config = {}) => {
  try {
    console.log(`🌐 API Call: ${method} ${url}`, data ? { data } : '');
    
    const response = await api({
      method,
      url,
      data,
      ...config
    });
    
    console.log(`✅ API Response: ${method} ${url}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ API Error: ${method} ${url}`, error);
    
    // Handle network errors
    if (!error.response) {
      console.error('❌ Network error - no response received');
      throw new Error('Ağ bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
    }
    
    console.error('❌ Server error response:', error.response?.data);
    console.error('❌ Status code:', error.response?.status);
    
    // Throw the error with server response
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData.message && typeof errorData.message === 'string') {
        throw new Error(errorData.message);
      } else if (typeof errorData === 'object') {
        throw new Error(errorData.code || 'API Hatası');
      }
    } else if (error.response?.data?.message && typeof error.response.data.message === 'string') {
      throw new Error(error.response.data.message);
    } else if (error.response?.data && typeof error.response.data === 'object') {
      // Handle cases where the entire data object is returned
      const errorMsg = error.response.data.message || 'API Hatası';
      if (typeof errorMsg === 'string') {
        throw new Error(errorMsg);
      } else {
        console.error('❌ Non-string error in response:', error.response.data);
        throw new Error('API Hatası - geçersiz response formatı');
      }
    }
    
    // Always throw Error objects, never plain objects
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Bilinmeyen hata oluştu');
  }
};

// Convenience methods
export const get = (url, config = {}) => apiCall('GET', url, null, config);
export const post = (url, data, config = {}) => apiCall('POST', url, data, config);
export const put = (url, data, config = {}) => apiCall('PUT', url, data, config);
export const patch = (url, data, config = {}) => apiCall('PATCH', url, data, config);
export const del = (url, config = {}) => {
  // DELETE requests should not send a body
  const deleteConfig = {
    ...config,
    data: undefined // Explicitly remove data
  };
  return api({
    method: 'DELETE',
    url,
    ...deleteConfig
  });
};

// File upload helper
export const uploadFile = async (url, file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(progress);
    };
  }

  return apiCall('POST', url, formData, config);
};

// Query string helper
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

// Get with query parameters
export const getWithParams = (url, params = {}) => {
  const queryString = buildQueryString(params);
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  return get(fullUrl);
};

// Fetch with auth helper - compatible with existing code
export const fetchWithAuth = async (endpoint, options = {}) => {
  const method = options.method || 'GET';
  const data = options.body ? JSON.parse(options.body) : null;
  
  try {
    return await apiCall(method, endpoint, data, options);
  } catch (error) {
    // Ensure error is properly formatted as string for React rendering
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'object' && errorData.error) {
        throw new Error(errorData.error);
      } else if (typeof errorData === 'object' && errorData.message) {
        throw new Error(errorData.message);
      } else if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (typeof errorData === 'object') {
        const errorMsg = errorData.error || errorData.message || 'Bilinmeyen hata';
        throw new Error(errorMsg);
      }
    }
    
    // Handle other error formats
    if (error.message) {
      throw new Error(error.message);
    }
    
    // Fallback for unknown error formats
    throw new Error('Bilinmeyen hata oluştu');
  }
};

export default api;
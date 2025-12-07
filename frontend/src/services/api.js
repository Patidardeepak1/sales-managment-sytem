import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('Backend server is not running. Please start the backend server on port 5000.');
    }
    return Promise.reject(error);
  }
);

export const fetchSales = async (params = {}) => {
  try {
    const response = await api.get('/sales', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

export const fetchFilterOptions = async () => {
  try {
    const response = await api.get('/sales/filters');
    return response.data;
  } catch (error) {
    console.error('Error fetching filter options:', error);
    // Return empty options if backend is not available
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      return {
        customerRegions: [],
        genders: [],
        productCategories: [],
        tags: [],
        paymentMethods: [],
        ageRange: { minAge: 0, maxAge: 100 },
      };
    }
    throw error;
  }
};

export const importSalesData = async (data) => {
  try {
    const response = await api.post('/sales/import', data);
    return response.data;
  } catch (error) {
    console.error('Error importing sales data:', error);
    throw error;
  }
};


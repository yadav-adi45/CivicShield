import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Create user-friendly error message
    let userMessage = 'An unexpected error occurred';
    let isRetryable = false;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      userMessage = 'Request timeout. The service is taking too long to respond.';
      isRetryable = true;
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      userMessage = 'Cannot connect to backend service. Please check if the server is running on port 5000.';
      isRetryable = true;
    } else if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 502:
          userMessage = 'Backend gateway error. The ML service may be unavailable.';
          isRetryable = true;
          break;
        case 503:
          userMessage = data.message || 'Service temporarily unavailable. Please try again.';
          isRetryable = true;
          break;
        case 504:
          userMessage = 'Gateway timeout. The service is taking too long to respond.';
          isRetryable = true;
          break;
        case 500:
          userMessage = data.message || 'Internal server error. Please try again later.';
          isRetryable = true;
          break;
        case 404:
          userMessage = data.message || 'Resource not found.';
          isRetryable = false;
          break;
        case 429:
          userMessage = 'Too many requests. Please wait a moment and try again.';
          isRetryable = true;
          break;
        default:
          userMessage = data.message || data.error || `Error ${status}: ${error.message}`;
          isRetryable = data.retryable || status >= 500;
      }
    }

    // Attach user-friendly message to error
    error.userMessage = userMessage;
    error.isRetryable = isRetryable;
    
    console.error('[API Error]', {
      message: error.message,
      userMessage,
      status: error.response?.status,
      code: error.code,
      isRetryable
    });

    return Promise.reject(error);
  }
);

export async function fetchPredictions() {
  try {
    const response = await api.get('/prediction');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchRegionDetail(stateCode) {
  try {
    const response = await api.get(`/region/${stateCode}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export default api;

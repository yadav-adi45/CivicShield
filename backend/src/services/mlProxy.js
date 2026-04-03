import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry requests
async function retryRequest(requestFn, retries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[ML Service] Attempt ${attempt}/${retries}`);
      const result = await requestFn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        console.error(`[ML Service] Client error ${error.response.status}, not retrying`);
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === retries) {
        console.error(`[ML Service] All ${retries} attempts failed`);
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = RETRY_DELAY * attempt;
      console.log(`[ML Service] Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
      await delay(waitTime);
    }
  }
  
  throw lastError;
}

// Add request interceptor for logging
mlClient.interceptors.request.use(
  (config) => {
    console.log(`[ML Service] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[ML Service] Request error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
mlClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('[ML Service] Connection refused - service may be down');
      error.isServiceDown = true;
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.error('[ML Service] Request timeout');
      error.isTimeout = true;
    } else if (error.response) {
      console.error(`[ML Service] HTTP ${error.response.status}: ${error.response.statusText}`);
    } else {
      console.error('[ML Service] Unknown error:', error.message);
    }
    return Promise.reject(error);
  }
);

export async function getPredictions() {
  try {
    const response = await retryRequest(() => mlClient.get('/prediction'));
    return response.data;
  } catch (error) {
    console.error('[getPredictions] Failed after retries:', error.message);
    throw error;
  }
}

export async function getRegionDetail(stateCode) {
  try {
    const response = await retryRequest(() => mlClient.get(`/region/${stateCode}`));
    return response.data;
  } catch (error) {
    console.error(`[getRegionDetail] Failed after retries for state ${stateCode}:`, error.message);
    throw error;
  }
}

export async function checkMLHealth() {
  try {
    // Don't retry health checks as aggressively
    const response = await mlClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('[checkMLHealth] Failed:', error.message);
    throw error;
  }
}

export function errorHandler(err, req, res, next) {
  // Log error details for debugging
  console.error('[Gateway Error]', {
    message: err.message,
    code: err.code,
    status: err.response?.status,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle ML service connection errors
  if (err.code === 'ECONNREFUSED' || err.isServiceDown) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'ML service is not reachable. Please ensure it is running on port 8000.',
      code: 'ML_SERVICE_DOWN',
      retryable: true
    });
  }

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED' || err.isTimeout) {
    return res.status(504).json({
      error: 'Gateway Timeout',
      message: 'ML service took too long to respond. Please try again.',
      code: 'ML_SERVICE_TIMEOUT',
      retryable: true
    });
  }

  // Handle ML service HTTP errors
  if (err.response) {
    const status = err.response.status || 502;
    const message = err.response.data?.detail || err.response.data?.message || err.message;
    
    return res.status(status).json({
      error: status === 404 ? 'Not Found' : 'ML Service Error',
      message: message,
      code: 'ML_SERVICE_ERROR',
      retryable: status >= 500
    });
  }

  // Handle network errors
  if (err.code === 'ENOTFOUND' || err.code === 'EHOSTUNREACH') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Cannot reach ML service. Check network configuration.',
      code: 'NETWORK_ERROR',
      retryable: true
    });
  }

  // Generic fallback error
  const status = err.status || 500;
  res.status(status).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    retryable: false
  });
}

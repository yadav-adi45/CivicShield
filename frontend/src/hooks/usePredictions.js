import { useState, useEffect, useCallback } from 'react';
import { fetchPredictions } from '../services/api';

export function usePredictions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPredictions();
      setData(result);
    } catch (err) {
      // Use user-friendly message from API interceptor
      const errorMessage = err.userMessage || err.message || 'Failed to fetch predictions';
      setError(errorMessage);
      console.error('[usePredictions] Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  return { data, loading, error, refresh: load };
}

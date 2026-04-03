import { useState, useCallback } from 'react';
import { fetchRegionDetail } from '../services/api';

export function useRegion() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRegion = useCallback(async (stateCode) => {
    if (!stateCode) return;
    try {
      setLoading(true);
      setError(null);
      const result = await fetchRegionDetail(stateCode);
      setData(result);
    } catch (err) {
      // Use user-friendly message from API interceptor
      const errorMessage = err.userMessage || err.message || 'Failed to fetch region detail';
      setError(errorMessage);
      console.error('[useRegion] Error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRegion = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, loadRegion, clearRegion };
}

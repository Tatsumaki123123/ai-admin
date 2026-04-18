import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../services/api/apiClient';
import { RootState } from '../redux/store';

const useFetchData = <T = any,>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Listen to dataMode changes so we refetch when user toggles
  const { useMockData } = useSelector((state: RootState) => state.dataMode);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[useFetchData] Fetching URL:', url, 'Mock mode:', useMockData);

      // Use apiClient instead of fetch - this will go through our interceptor
      const data = await apiClient.get(url);

      console.log('[useFetchData] Response received:', data);

      // apiClient now resolves directly to data (no .data wrapper needed)
      setData(data);
      setError(null);
    } catch (error) {
      console.error('[useFetchData] Error:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [url, useMockData]); // Re-fetch when URL or dataMode changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading };
};

export default useFetchData;

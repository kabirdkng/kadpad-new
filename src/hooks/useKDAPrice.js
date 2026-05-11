import { useState, useEffect } from 'react';
import { fetchKDAPrice } from '../utils/priceUtils';

/**
 * Custom hook to fetch and manage KDA price
 * @param {boolean} enabled - Whether to fetch the price
 * @returns {Object} { kdaPrice, loading, error, refetch }
 */
export const useKDAPrice = (enabled = true) => {
  const [kdaPrice, setKdaPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrice = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const price = await fetchKDAPrice();
      setKdaPrice(price);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch KDA price:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    
    // Refresh price every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [enabled]);

  return {
    kdaPrice,
    loading,
    error,
    refetch: fetchPrice
  };
};

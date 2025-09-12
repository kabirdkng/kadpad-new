import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  addOrUpdateStakerEmail, 
  getStakerByAccount, 
  updateNotificationPreferences, 
  deleteStakerEmail 
} from '../api';

// Cache to store staker data by account to avoid redundant API calls
const stakerDataCache = new Map();
const cacheExpiration = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const useStakerEmail = (account) => {
  const [stakerData, setStakerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastFetchedAccount = useRef(null);
  const abortController = useRef(null);

  // Check if we have fresh cached data
  const getCachedData = useCallback((account) => {
    if (!account) return null;
    
    const cached = stakerDataCache.get(account);
    const expiration = cacheExpiration.get(account);
    
    if (cached && expiration && Date.now() < expiration) {
      console.log('useStakerEmail: Using cached data for account:', account);
      return cached;
    }
    
    // Remove expired cache
    if (cached) {
      stakerDataCache.delete(account);
      cacheExpiration.delete(account);
    }
    
    return null;
  }, []);

  // Cache data with expiration
  const setCachedData = useCallback((account, data) => {
    if (!account) return;
    
    stakerDataCache.set(account, data);
    cacheExpiration.set(account, Date.now() + CACHE_DURATION);
    console.log('useStakerEmail: Cached data for account:', account);
  }, []);

  // Clear cache for specific account
  const clearCacheForAccount = useCallback((account) => {
    if (account) {
      stakerDataCache.delete(account);
      cacheExpiration.delete(account);
      console.log('useStakerEmail: Cleared cache for account:', account);
    }
  }, []);

  // Fetch staker data with caching and request deduplication
  const fetchStakerData = useCallback(async (forceRefresh = false) => {
    if (!account) {
      setStakerData(null);
      setError(null);
      return;
    }

    // Prevent duplicate requests for the same account
    if (lastFetchedAccount.current === account && !forceRefresh) {
      console.log('useStakerEmail: Skipping duplicate request for account:', account);
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData(account);
      if (cachedData) {
        setStakerData(cachedData);
        setError(null);
        lastFetchedAccount.current = account;
        return;
      }
    }

    // Cancel any pending request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setIsLoading(true);
    setError(null);
    lastFetchedAccount.current = account;

    try {
      console.log('useStakerEmail: Fetching fresh data for account:', account);
      const response = await getStakerByAccount(account);
      const data = response.data.data.staker;
      
      setStakerData(data);
      setCachedData(account, data);
    } catch (err) {
      // Don't set error if request was aborted (component unmounted or account changed)
      if (err.name !== 'AbortError') {
        console.error('Error fetching staker data:', err);
        setError(err.response?.data?.message || 'Failed to fetch staker data');
        setStakerData(null);
      }
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  }, [account, getCachedData, setCachedData]);

  // Add or update email
  const addOrUpdateEmail = useCallback(async (email) => {
    if (!account) {
      throw new Error('No account connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await addOrUpdateStakerEmail(account, email);
      const data = response.data.data.staker;
      setStakerData(data);
      setCachedData(account, data); // Update cache
      return response.data;
    } catch (err) {
      console.error('Error adding/updating email:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add/update email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, setCachedData]);

  // Update notification preferences
  const updateNotifications = useCallback(async (emailNotificationsEnabled) => {
    if (!account) {
      throw new Error('No account connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await updateNotificationPreferences(account, emailNotificationsEnabled);
      const data = response.data.data.staker;
      setStakerData(data);
      setCachedData(account, data); // Update cache
      return response.data;
    } catch (err) {
      console.error('Error updating notifications:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update notification preferences';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, setCachedData]);

  // Delete email
  const deleteEmail = useCallback(async () => {
    if (!account) {
      throw new Error('No account connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteStakerEmail(account);
      setStakerData(null);
      clearCacheForAccount(account); // Clear cache since data is deleted
      return { message: 'Email deleted successfully' };
    } catch (err) {
      console.error('Error deleting email:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account, clearCacheForAccount]);

  // Effect to fetch data when account changes
  useEffect(() => {
    if (account) {
      // Only fetch if account actually changed or no cached data exists
      const cachedData = getCachedData(account);
      if (!cachedData || lastFetchedAccount.current !== account) {
        fetchStakerData();
      } else if (cachedData) {
        // Use cached data immediately
        setStakerData(cachedData);
        setError(null);
      }
    } else {
      // Clear data when no account
      setStakerData(null);
      setError(null);
      lastFetchedAccount.current = null;
    }

    // Cleanup on unmount or account change
    return () => {
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
    };
  }, [account, fetchStakerData, getCachedData]);

  return {
    stakerData,
    isLoading,
    error,
    hasEmail: !!stakerData?.email,
    addOrUpdateEmail,
    updateNotifications,
    deleteEmail,
    refetch: () => fetchStakerData(true), // Force refresh when manually called
    clearCache: () => clearCacheForAccount(account)
  };
};

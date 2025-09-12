import { useState, useEffect, useCallback } from 'react';
import { 
  addOrUpdateStakerEmail, 
  getStakerByAccount, 
  updateNotificationPreferences, 
  deleteStakerEmail 
} from '../api';

export const useStakerEmail = (account) => {
  const [stakerData, setStakerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch staker data when account changes
  const fetchStakerData = useCallback(async () => {
    if (!account) {
      setStakerData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getStakerByAccount(account);
      setStakerData(response.data.data.staker);
    } catch (err) {
      console.error('Error fetching staker data:', err);
      setError(err.response?.data?.message || 'Failed to fetch staker data');
      setStakerData(null);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Add or update email
  const addOrUpdateEmail = useCallback(async (email) => {
    if (!account) {
      throw new Error('No account connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await addOrUpdateStakerEmail(account, email);
      setStakerData(response.data.data.staker);
      return response.data;
    } catch (err) {
      console.error('Error adding/updating email:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add/update email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Update notification preferences
  const updateNotifications = useCallback(async (emailNotificationsEnabled) => {
    if (!account) {
      throw new Error('No account connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await updateNotificationPreferences(account, emailNotificationsEnabled);
      setStakerData(response.data.data.staker);
      return response.data;
    } catch (err) {
      console.error('Error updating notifications:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update notification preferences';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

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
      return { message: 'Email deleted successfully' };
    } catch (err) {
      console.error('Error deleting email:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Effect to fetch data when account changes
  useEffect(() => {
    fetchStakerData();
  }, [fetchStakerData]);

  return {
    stakerData,
    isLoading,
    error,
    hasEmail: !!stakerData?.email,
    addOrUpdateEmail,
    updateNotifications,
    deleteEmail,
    refetch: fetchStakerData
  };
};

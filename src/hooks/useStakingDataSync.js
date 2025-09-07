import { useEffect, useCallback, useRef } from 'react';
import { useStakingPactCalls } from './useStakingPactCalls';
import useWalletStore from '../wallet/walletStore';
import useTransactionStore from '../store/useTransactionStore';

/**
 * Hook for managing real-time staking data synchronization
 * Handles automatic polling, transaction-based updates, and efficient data refresh
 */
export const useStakingDataSync = () => {
  const { isConnected } = useWalletStore();
  const { refreshData, refreshPublicData, isLoading } = useStakingPactCalls();
  const { getTransactionsByType } = useTransactionStore();
  
  // Polling intervals refs
  const publicDataPollingRef = useRef(null);
  const userDataPollingRef = useRef(null);
  const lastTransactionCheckRef = useRef(null);
  
  // Configuration
  const PUBLIC_DATA_POLL_INTERVAL = 30000; // 30 seconds for public data
  const USER_DATA_POLL_INTERVAL = 15000; // 15 seconds for user data
  const TRANSACTION_CHECK_INTERVAL = 5000; // 5 seconds for transaction monitoring
  
  // Get staking-related transactions
  const getStakingTransactions = useCallback(() => {
    const stakingTxs = getTransactionsByType('stake-tokens');
    const unstakingTxs = getTransactionsByType('unstake-tokens');
    return [...stakingTxs, ...unstakingTxs].sort((a, b) => b.createdAt - a.createdAt);
  }, [getTransactionsByType]);
  
  // Check if there are pending staking transactions
  const hasPendingStakingTransactions = useCallback(() => {
    const transactions = getStakingTransactions();
    return transactions.some(tx => tx.status === 'pending');
  }, [getStakingTransactions]);
  
  // Refresh public data (stats, leaderboard, total staked)
  const refreshPublicDataSafe = useCallback(async () => {
    if (isLoading) return;
    
    try {
      await refreshPublicData();
    } catch (error) {
      console.error('Error refreshing public data:', error);
    }
  }, [refreshPublicData, isLoading]);
  
  // Refresh user-specific data
  const refreshUserDataSafe = useCallback(async () => {
    if (!isConnected || isLoading) return;
    
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [isConnected, refreshData, isLoading]);
  
  // Start public data polling
  const startPublicDataPolling = useCallback(() => {
    if (publicDataPollingRef.current) return;
    
    publicDataPollingRef.current = setInterval(() => {
      refreshPublicDataSafe();
    }, PUBLIC_DATA_POLL_INTERVAL);
  }, [refreshPublicDataSafe]);
  
  // Start user data polling
  const startUserDataPolling = useCallback(() => {
    if (!isConnected || userDataPollingRef.current) return;
    
    userDataPollingRef.current = setInterval(() => {
      refreshUserDataSafe();
    }, USER_DATA_POLL_INTERVAL);
  }, [isConnected, refreshUserDataSafe]);
  
  // Start transaction monitoring (more frequent polling when there are pending transactions)
  const startTransactionMonitoring = useCallback(() => {
    if (lastTransactionCheckRef.current) return;
    
    let checkCount = 0;
    const maxChecks = 60; // 5 minutes of checking
    
    lastTransactionCheckRef.current = setInterval(() => {
      checkCount++;
      
      if (hasPendingStakingTransactions()) {
        // More frequent refresh when transactions are pending
        refreshUserDataSafe();
        refreshPublicDataSafe();
        checkCount = 0; // Reset counter when there are pending transactions
      } else if (checkCount >= maxChecks) {
        // Stop monitoring after max checks if no pending transactions
        clearInterval(lastTransactionCheckRef.current);
        lastTransactionCheckRef.current = null;
        checkCount = 0;
      }
    }, TRANSACTION_CHECK_INTERVAL);
  }, [hasPendingStakingTransactions, refreshUserDataSafe, refreshPublicDataSafe]);
  
  // Stop all polling
  const stopAllPolling = useCallback(() => {
    if (publicDataPollingRef.current) {
      clearInterval(publicDataPollingRef.current);
      publicDataPollingRef.current = null;
    }
    if (userDataPollingRef.current) {
      clearInterval(userDataPollingRef.current);
      userDataPollingRef.current = null;
    }
    if (lastTransactionCheckRef.current) {
      clearInterval(lastTransactionCheckRef.current);
      lastTransactionCheckRef.current = null;
    }
  }, []);
  
  // Manual refresh function for immediate updates
  const forceRefresh = useCallback(async () => {
    if (isConnected) {
      await Promise.all([
        refreshUserDataSafe(),
        refreshPublicDataSafe()
      ]);
    } else {
      await refreshPublicDataSafe();
    }
  }, [isConnected, refreshUserDataSafe, refreshPublicDataSafe]);
  
  // Function to be called after transactions
  const refreshAfterTransaction = useCallback(async () => {
    // Start transaction monitoring
    startTransactionMonitoring();
    
    // Immediate refresh
    await forceRefresh();
  }, [forceRefresh, startTransactionMonitoring]);
  
  // Setup polling when component mounts or wallet connects
  useEffect(() => {
    // Always start public data polling
    startPublicDataPolling();
    
    // Start user data polling if connected
    if (isConnected) {
      startUserDataPolling();
    }
    
    // Initial data fetch
    forceRefresh();
    
    return () => {
      // Don't stop public polling on unmount, but stop user polling
      if (userDataPollingRef.current) {
        clearInterval(userDataPollingRef.current);
        userDataPollingRef.current = null;
      }
    };
  }, [isConnected]); // Only depend on isConnected
  
  // Monitor for new transactions
  useEffect(() => {
    const stakingTransactions = getStakingTransactions();
    const transactionCount = stakingTransactions.length;
    
    if (transactionCount > 0) {
      startTransactionMonitoring();
      
      // Immediate refresh when new staking transactions are detected
      const recentTransaction = stakingTransactions[0];
      const isRecent = Date.now() - recentTransaction.createdAt < 10000; // Within last 10 seconds
      
      if (isRecent) {
        forceRefresh();
      }
    }
    
    // Don't add getStakingTransactions().length as dependency to avoid infinite re-renders
    // Instead we'll rely on the periodic polling to catch updates
  }, []); // Empty dependency array, will run once on mount
  
  // Listen for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when user returns to tab
        forceRefresh();
        // Restart polling if needed
        startPublicDataPolling();
        if (isConnected) {
          startUserDataPolling();
        }
      } else {
        // Stop user data polling when tab is hidden (keep public data polling)
        if (userDataPollingRef.current) {
          clearInterval(userDataPollingRef.current);
          userDataPollingRef.current = null;
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, forceRefresh, startPublicDataPolling, startUserDataPolling]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllPolling();
    };
  }, [stopAllPolling]);
  
  return {
    refreshAfterTransaction,
    hasPendingTransactions: hasPendingStakingTransactions(),
    stopAllPolling,
    startPolling: () => {
      startPublicDataPolling();
      if (isConnected) {
        startUserDataPolling();
      }
    }
  };
};

export default useStakingDataSync;

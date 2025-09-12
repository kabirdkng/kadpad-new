import { useEffect, useCallback, useRef } from 'react';
import { useStakingPactCalls } from './useStakingPactCalls';
import useWalletStore from '../wallet/walletStore';
import useTransactionStore from '../store/useTransactionStore';

/**
 * Hook for managing real-time staking data synchronization
 * Handles automatic polling, transaction-based updates, and efficient data refresh
 */
export const useStakingDataSync = () => {
  const { isConnected, account } = useWalletStore();
  const { refreshData, refreshPublicData, isLoading } = useStakingPactCalls();
  const { getTransactionsByType } = useTransactionStore();
  
  // Polling intervals refs
  const publicDataPollingRef = useRef(null);
  const userDataPollingRef = useRef(null);
  const lastTransactionCheckRef = useRef(null);
  
  // Configuration - Increased intervals to reduce API load
  const PUBLIC_DATA_POLL_INTERVAL = 30000; 
  const USER_DATA_POLL_INTERVAL = 15000; 
  const TRANSACTION_CHECK_INTERVAL = 5000; 
  
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
  }, [isLoading]); // Remove refreshPublicData from dependencies
  
  // Refresh user-specific data
  const refreshUserDataSafe = useCallback(async () => {
    if (!isConnected || !account || isLoading) return;
    
    try {
      console.log('useStakingDataSync: Refreshing user data for account:', account);
      await refreshData();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [isConnected, account, isLoading]); // Remove refreshData from dependencies
  
  // Start public data polling
  const startPublicDataPolling = useCallback(() => {
    if (publicDataPollingRef.current) return;
    
    publicDataPollingRef.current = setInterval(() => {
      // Use the current refreshPublicData function directly
      if (!isLoading) {
        refreshPublicData().catch(error => {
          console.error('Error refreshing public data:', error);
        });
      }
    }, PUBLIC_DATA_POLL_INTERVAL);
  }, []); // No dependencies needed
  
  // Start user data polling
  const startUserDataPolling = useCallback(() => {
    if (!isConnected || !account || userDataPollingRef.current) return;
    
    console.log('useStakingDataSync: Starting user data polling for account:', account);
    userDataPollingRef.current = setInterval(() => {
      // Use the current refreshData function directly
      if (isConnected && account && !isLoading) {
        refreshData().catch(error => {
          console.error('Error refreshing user data:', error);
        });
      }
    }, USER_DATA_POLL_INTERVAL);
  }, [isConnected, account]); // Only depend on isConnected and account
  
  // Start transaction monitoring (more frequent polling when there are pending transactions)
  const startTransactionMonitoring = useCallback(() => {
    if (lastTransactionCheckRef.current) return;
    
    let checkCount = 0;
    const maxChecks = 60; // 5 minutes of checking
    
    lastTransactionCheckRef.current = setInterval(() => {
      checkCount++;
      
      // Check transactions directly without callback dependency
      const stakingTxs = getTransactionsByType('stake-tokens');
      const unstakingTxs = getTransactionsByType('unstake-tokens');
      const allTxs = [...stakingTxs, ...unstakingTxs];
      const hasPending = allTxs.some(tx => tx.status === 'pending');
      
      if (hasPending) {
        // More frequent refresh when transactions are pending
        if (isConnected && account && !isLoading) {
          refreshData().catch(error => console.error('Error refreshing user data:', error));
        }
        if (!isLoading) {
          refreshPublicData().catch(error => console.error('Error refreshing public data:', error));
        }
        checkCount = 0; // Reset counter when there are pending transactions
      } else if (checkCount >= maxChecks) {
        // Stop monitoring after max checks if no pending transactions
        clearInterval(lastTransactionCheckRef.current);
        lastTransactionCheckRef.current = null;
        checkCount = 0;
      }
    }, TRANSACTION_CHECK_INTERVAL);
  }, []); // No dependencies needed
  
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
    console.log('useStakingDataSync: Force refresh for account:', account, 'isConnected:', isConnected);
    if (isConnected && account && !isLoading) {
      await Promise.all([
        refreshData().catch(error => console.error('Error refreshing user data:', error)),
        refreshPublicData().catch(error => console.error('Error refreshing public data:', error))
      ]);
    } else if (!isLoading) {
      await refreshPublicData().catch(error => console.error('Error refreshing public data:', error));
    }
  }, [isConnected, account]); // Remove function dependencies
  
  // Function to be called after transactions
  const refreshAfterTransaction = useCallback(async () => {
    // Start transaction monitoring
    startTransactionMonitoring();
    
    // Immediate refresh
    await forceRefresh();
  }, [startTransactionMonitoring, forceRefresh]);
  
  // Setup polling when component mounts or wallet connects/account changes
  useEffect(() => {
    console.log('useStakingDataSync: Account or connection changed', { account, isConnected });
    
    // Stop all existing polling first
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
    
    // Always start public data polling
    if (!publicDataPollingRef.current) {
      publicDataPollingRef.current = setInterval(() => {
        if (!isLoading) {
          refreshPublicData().catch(error => {
            console.error('Error refreshing public data:', error);
          });
        }
      }, PUBLIC_DATA_POLL_INTERVAL);
    }
    
    // Start user data polling if connected and has account
    if (isConnected && account && !userDataPollingRef.current) {
      console.log('useStakingDataSync: Starting user data polling for account:', account);
      userDataPollingRef.current = setInterval(() => {
        if (isConnected && account && !isLoading) {
          refreshData().catch(error => {
            console.error('Error refreshing user data:', error);
          });
        }
      }, USER_DATA_POLL_INTERVAL);
    }
    
    // Initial data fetch
    if (isConnected && account && !isLoading) {
      Promise.all([
        refreshData().catch(error => console.error('Error refreshing user data:', error)),
        refreshPublicData().catch(error => console.error('Error refreshing public data:', error))
      ]);
    } else if (!isLoading) {
      refreshPublicData().catch(error => console.error('Error refreshing public data:', error));
    }
    
    return () => {
      // Don't stop public polling on unmount, but stop user polling
      if (userDataPollingRef.current) {
        clearInterval(userDataPollingRef.current);
        userDataPollingRef.current = null;
      }
    };
  }, [isConnected, account]); // Watch both isConnected AND account
  
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
        if (isConnected && account && !isLoading) {
          Promise.all([
            refreshData().catch(error => console.error('Error refreshing user data:', error)),
            refreshPublicData().catch(error => console.error('Error refreshing public data:', error))
          ]);
        } else if (!isLoading) {
          refreshPublicData().catch(error => console.error('Error refreshing public data:', error));
        }
        
        // Restart polling if needed - check if intervals are already running
        if (!publicDataPollingRef.current) {
          publicDataPollingRef.current = setInterval(() => {
            if (!isLoading) {
              refreshPublicData().catch(error => {
                console.error('Error refreshing public data:', error);
              });
            }
          }, PUBLIC_DATA_POLL_INTERVAL);
        }
        
        if (isConnected && account && !userDataPollingRef.current) {
          userDataPollingRef.current = setInterval(() => {
            if (isConnected && account && !isLoading) {
              refreshData().catch(error => {
                console.error('Error refreshing user data:', error);
              });
            }
          }, USER_DATA_POLL_INTERVAL);
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
  }, [isConnected, account]); // Only depend on isConnected and account
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
    };
  }, []); // No dependencies needed for cleanup
  
  return {
    refreshAfterTransaction,
    hasPendingTransactions: hasPendingStakingTransactions(),
    stopAllPolling,
    startPolling: () => {
      // Always start public data polling
      if (!publicDataPollingRef.current) {
        publicDataPollingRef.current = setInterval(() => {
          if (!isLoading) {
            refreshPublicData().catch(error => {
              console.error('Error refreshing public data:', error);
            });
          }
        }, PUBLIC_DATA_POLL_INTERVAL);
      }
      
      // Start user data polling if connected
      if (isConnected && account && !userDataPollingRef.current) {
        userDataPollingRef.current = setInterval(() => {
          if (isConnected && account && !isLoading) {
            refreshData().catch(error => {
              console.error('Error refreshing user data:', error);
            });
          }
        }, USER_DATA_POLL_INTERVAL);
      }
    }
  };
};

export default useStakingDataSync;

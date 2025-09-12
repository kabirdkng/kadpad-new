import React, { createContext, useContext, useEffect } from 'react';
import useStakingDataSync from '../hooks/useStakingDataSync';
import useWalletStore from '../wallet/walletStore';
import useStakingStore from '../store/useStakingStore';

const StakingDataContext = createContext();

export const useStakingDataContext = () => {
  const context = useContext(StakingDataContext);
  if (!context) {
    // Provide fallback values if context is not available
    console.warn('useStakingDataContext used outside of StakingDataProvider, providing fallback values');
    return {
      refreshAfterTransaction: () => Promise.resolve(),
      hasPendingTransactions: false,
      stopAllPolling: () => {},
      startPolling: () => {}
    };
  }
  return context;
};

export const StakingDataProvider = ({ children }) => {
  const stakingDataSync = useStakingDataSync();
  const { account, isConnected } = useWalletStore();
  const { clearUserData } = useStakingStore();
  
  // Watch for account changes and refresh data
  useEffect(() => {
    if (isConnected && account) {
      console.log('StakingDataContext: Account changed, refreshing staking data for:', account);
      // Clear user data first
      clearUserData();
      
      // Stop existing polling
      stakingDataSync.stopAllPolling();
      
      // Refresh data for new account
      stakingDataSync.refreshAfterTransaction();
      
      // Restart polling with new account
      stakingDataSync.startPolling();
    } else if (!isConnected) {
      // Stop polling and clear data when disconnected
      console.log('StakingDataContext: Wallet disconnected, stopping staking data polling');
      stakingDataSync.stopAllPolling();
      clearUserData();
    }
  }, [account, isConnected]); // Remove stakingDataSync and clearUserData from dependencies

  // Initial data load when component mounts
  useEffect(() => {
    if (isConnected && account) {
      stakingDataSync.startPolling();
    }
    
    // Cleanup on unmount
    return () => {
      stakingDataSync.stopAllPolling();
    };
  }, []);
  
  return (
    <StakingDataContext.Provider value={stakingDataSync}>
      {children}
    </StakingDataContext.Provider>
  );
};

export default StakingDataProvider;

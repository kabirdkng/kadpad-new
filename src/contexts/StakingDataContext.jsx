import React, { createContext, useContext } from 'react';
import useStakingDataSync from '../hooks/useStakingDataSync';

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
  
  return (
    <StakingDataContext.Provider value={stakingDataSync}>
      {children}
    </StakingDataContext.Provider>
  );
};

export default StakingDataProvider;

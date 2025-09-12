import React, { createContext, useContext } from 'react';
import { useStakerEmail } from '../hooks/useStakerEmail';
import useWalletStore from '../wallet/walletStore';

const StakerEmailContext = createContext();

export const useStakerEmailContext = () => {
  const context = useContext(StakerEmailContext);
  if (!context) {
    console.warn('useStakerEmailContext used outside of StakerEmailProvider, providing fallback values');
    return {
      stakerData: null,
      isLoading: false,
      error: null,
      hasEmail: false,
      addOrUpdateEmail: () => Promise.resolve(),
      updateNotifications: () => Promise.resolve(),
      deleteEmail: () => Promise.resolve(),
      refetch: () => Promise.resolve(),
      clearCache: () => {}
    };
  }
  return context;
};

export const StakerEmailProvider = ({ children }) => {
  const { account } = useWalletStore();
  const stakerEmailData = useStakerEmail(account);
  
  return (
    <StakerEmailContext.Provider value={stakerEmailData}>
      {children}
    </StakerEmailContext.Provider>
  );
};

export default StakerEmailProvider;
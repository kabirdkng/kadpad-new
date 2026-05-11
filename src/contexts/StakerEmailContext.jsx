import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStakerEmail } from '../hooks/useStakerEmail';
import useWalletStore from '../wallet/walletStore';

const StakerEmailContext = createContext();

export const useStakerEmailContext = () => {
  const context = useContext(StakerEmailContext);
  // Always return a valid context, even if it's the fallback
  return context || {
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
};

export const StakerEmailProvider = ({ children }) => {
  const { account, isConnected } = useWalletStore();
  const [debouncedAccount, setDebouncedAccount] = useState(account);
  
  // Debounce account changes to prevent rapid context recreations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAccount(account);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [account]);
  
  const stakerEmailData = useStakerEmail(debouncedAccount);
  
  // Don't render children until we have a stable context
  if (!isConnected || !debouncedAccount) {
    return (
      <StakerEmailContext.Provider value={{
        stakerData: null,
        isLoading: false,
        error: null,
        hasEmail: false,
        addOrUpdateEmail: () => Promise.resolve(),
        updateNotifications: () => Promise.resolve(),
        deleteEmail: () => Promise.resolve(),
        refetch: () => Promise.resolve(),
        clearCache: () => {}
      }}>
        {children}
      </StakerEmailContext.Provider>
    );
  }
  
  return (
    <StakerEmailContext.Provider value={stakerEmailData}>
      {children}
    </StakerEmailContext.Provider>
  );
};

export default StakerEmailProvider;
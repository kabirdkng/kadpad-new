// walletPersistence.js
const WALLET_STORAGE_KEY = 'kadpad_wallet_session';

export const saveWalletToStorage = (walletData) => {
  try {
    const dataToStore = {
      provider: walletData.provider,
      account: walletData.account,
      pubKey: walletData.pubKey,
      isConnected: walletData.isConnected,
      timestamp: Date.now(), // Add timestamp for potential expiration
    };
    sessionStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Failed to save wallet data to sessionStorage:', error);
  }
};

export const loadWalletFromStorage = () => {
  try {
    const storedData = sessionStorage.getItem(WALLET_STORAGE_KEY);
    if (!storedData) {
      return null;
    }
    
    const parsedData = JSON.parse(storedData);
    
    // Optional: Check if data is too old (e.g., older than 7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (parsedData.timestamp && Date.now() - parsedData.timestamp > maxAge) {
      clearWalletFromStorage();
      return null;
    }
    
    // Validate required fields
    if (!parsedData.provider || !parsedData.account || !parsedData.pubKey) {
      clearWalletFromStorage();
      return null;
    }
    
    return {
      provider: parsedData.provider,
      account: parsedData.account,
      pubKey: parsedData.pubKey,
      isConnected: parsedData.isConnected,
    };
  } catch (error) {
    console.error('Failed to load wallet data from sessionStorage:', error);
    clearWalletFromStorage(); // Clear corrupted data
    return null;
  }
};

export const clearWalletFromStorage = () => {
  try {
    sessionStorage.removeItem(WALLET_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear wallet data from sessionStorage:', error);
  }
};

export const isWalletStorageAvailable = () => {
  try {
    const test = '__test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export const hasStoredWalletSession = () => {
  try {
    const storedData = sessionStorage.getItem(WALLET_STORAGE_KEY);
    if (!storedData) {
      return false;
    }
    
    const parsedData = JSON.parse(storedData);
    
    // Check if data is valid and not expired
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const isExpired = parsedData.timestamp && Date.now() - parsedData.timestamp > maxAge;
    const hasRequiredFields = parsedData.provider && parsedData.account && parsedData.pubKey;
    
    return !isExpired && hasRequiredFields && parsedData.isConnected;
  } catch {
    return false;
  }
};

// Simple test script to verify wallet persistence functionality
// This can be run in browser console or as a test

import { 
  saveWalletToStorage, 
  loadWalletFromStorage, 
  clearWalletFromStorage 
} from './walletPersistence.js';

export const testWalletPersistence = () => {
  console.log('Testing wallet persistence...');
  
  // Test data
  const testWalletData = {
    provider: 'TEST_PROVIDER',
    account: 'test-account-123',
    pubKey: 'test-public-key-456',
    isConnected: true,
  };
  
  try {
    // Test saving
    console.log('1. Testing save...');
    saveWalletToStorage(testWalletData);
    console.log('✓ Save successful');
    
    // Test loading
    console.log('2. Testing load...');
    const loadedData = loadWalletFromStorage();
    console.log('Loaded data:', loadedData);
    
    // Verify data integrity
    const isDataValid = (
      loadedData &&
      loadedData.provider === testWalletData.provider &&
      loadedData.account === testWalletData.account &&
      loadedData.pubKey === testWalletData.pubKey &&
      loadedData.isConnected === testWalletData.isConnected
    );
    
    if (isDataValid) {
      console.log('✓ Load successful - data integrity verified');
    } else {
      console.error('✗ Load failed - data integrity check failed');
    }
    
    // Test clearing
    console.log('3. Testing clear...');
    clearWalletFromStorage();
    const clearedData = loadWalletFromStorage();
    
    if (clearedData === null) {
      console.log('✓ Clear successful');
    } else {
      console.error('✗ Clear failed - data still exists');
    }
    
    console.log('All wallet persistence tests completed!');
    return true;
    
  } catch (error) {
    console.error('Wallet persistence test failed:', error);
    return false;
  }
};

// Auto-run test if this file is imported
// testWalletPersistence();

// Utility to detect if the app is running in Linx Explorer
export const isLinxExplorer = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.kadena !== undefined &&
    window.kadena.isKadena === true &&
    window.kadena.name != null &&
    window.kadena.name === "Linx Wallet"
  );
};

// Utility to detect if X Wallet (Ecko) extension is available
export const isXWalletAvailable = () => {
  if (typeof window === 'undefined') return false;
  
  return window.kadena !== undefined && window.kadena.isKadena === true;
};

// Get the display name for the wallet provider
export const getWalletDisplayName = (provider) => {
  if (provider === 'X_WALLET' && isLinxExplorer()) {
    return 'Linx Wallet';
  }
  
  switch (provider) {
    case 'X_WALLET':
      return 'Ecko Wallet';
    case 'WC':
      return 'WalletConnect';
    case 'SPIREKEY':
      return 'SpireKey';
    case 'METAMASK':
      return 'MetaMask';
    case 'MAGIC':
      return 'Magic';
    case 'CHAINWEAVER':
      return 'Chainweaver';
    case 'CHAINWEAVER_LEGACY':
      return 'Chainweaver Legacy';
    default:
      return 'Wallet';
  }
};

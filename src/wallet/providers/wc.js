import config from "../config.js";

export const WC = "WC";
const networkId = config.networkId;

// Create a function to get the client from React context
let clientInstance = null;

export const setWalletClient = (client) => {
  console.log("Setting WalletConnect client:", !!client);
  if (client) {
    console.log("Client methods:", Object.keys(client));
    console.log("Client type:", typeof client);
  }
  clientInstance = client;
  
  // Test the client immediately after setting it
  if (client && typeof client.getConnectedAccounts === 'function') {
    try {
      client.getConnectedAccounts('WalletConnect').then(accounts => {
        console.log("Connected accounts test:", accounts);
      }).catch(err => {
        console.log("Connected accounts test failed:", err.message);
      });
    } catch (error) {
      console.log("Connected accounts test error:", error.message);
    }
  }
};

// Helper function to get client from the React context when needed
const getClientFromContext = async () => {
  try {
    // Try to get the client from the wallet adapter context
    if (typeof window !== 'undefined' && window.__KADENA_WALLET_CONTEXT__) {
      return window.__KADENA_WALLET_CONTEXT__.client;
    }
    
    // Try to import and use the hook dynamically
    const { useKadenaWallet } = await import('@kadena/wallet-adapter-react');
    
    // This won't work outside of React component, but we can try
    // to access it if it's been stored globally
    return null;
  } catch (error) {
    console.error('Error getting client from context:', error);
    return null;
  }
};

// Helper function to validate WalletConnect connection
const validateWalletConnectConnection = async () => {
  try {
    // Check if we're using WalletConnect provider
    if (typeof window !== 'undefined') {
      const walletStore = await import('../walletStore.jsx');
      const currentState = walletStore.default.getState();
      
      if (currentState.provider !== 'WC') {
        throw new Error('Current provider is not WalletConnect. Please connect with WalletConnect first.');
      }
      
      if (!currentState.isConnected) {
        throw new Error('Wallet is not connected. Please connect your WalletConnect wallet first.');
      }
      
      if (!currentState.account || !currentState.pubKey) {
        throw new Error('Wallet connection is incomplete. Missing account or public key.');
      }
      
      console.log('WalletConnect connection validated successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('WalletConnect validation failed:', error);
    throw error;
  }
};

// Helper function to ensure client is available
const ensureClientAvailable = async (maxRetries = 10, retryDelay = 200) => {
  // First check if we have a client instance
  if (clientInstance) {
    console.log('Using existing client instance');
    return clientInstance;
  }
  
  // Try to get client from context
  const contextClient = await getClientFromContext();
  if (contextClient) {
    console.log('Got client from context');
    clientInstance = contextClient;
    return clientInstance;
  }
  
  // If not, try to get it from the React context with retries
  for (let i = 0; i < maxRetries; i++) {
    if (clientInstance) {
      console.log(`WalletConnect client became available on retry ${i + 1}`);
      return clientInstance;
    }
    
    console.log(`WalletConnect client not available, retrying... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
  
  // Try to get client from the global wallet adapter if available
  if (typeof window !== 'undefined' && window.__KADENA_WALLET_CLIENT__) {
    console.log("Using global wallet client as fallback");
    clientInstance = window.__KADENA_WALLET_CLIENT__;
    return clientInstance;
  }
  
  // Last resort: check if there's a wallet adapter context
  if (typeof window !== 'undefined' && window.__KADENA_WALLET_ADAPTER_CONTEXT__) {
    console.log("Using wallet adapter context as fallback");
    const client = window.__KADENA_WALLET_ADAPTER_CONTEXT__.client;
    if (client) {
      clientInstance = client;
      return clientInstance;
    }
  }
  
  throw new Error("WalletConnect client not initialized. Make sure KadenaWalletProvider is wrapping your app and wallet is connected.");
};

// Function to check client status - useful for debugging
export const getClientStatus = () => {
  return {
    hasClientInstance: !!clientInstance,
    hasGlobalClient: typeof window !== 'undefined' && !!window.__KADENA_WALLET_CLIENT__,
    hasGlobalContext: typeof window !== 'undefined' && !!window.__KADENA_WALLET_CONTEXT__,
    hasAdapterContext: typeof window !== 'undefined' && !!window.__KADENA_WALLET_ADAPTER_CONTEXT__,
    clientMethods: clientInstance ? Object.keys(clientInstance) : [],
  };
};

const wc = {
  name: "wc",
  config: {
    networkId: networkId,
    adapterName: 'WalletConnect'
  },
  connect: async function () {
    try {
      const client = await ensureClientAvailable();
      
      const account = await client.connect('WalletConnect');
      
      // Return the account data for the caller to handle store updates
      return {
        success: true,
        account: account.accountName,
        pubKey: account.publicKey,
        provider: "WC",
        session: { connected: true, account }
      };
    } catch (error) {
      console.error("Failed to connect to WalletConnect:", error);
      throw new Error("Failed to connect to the wallet");
    }
  },
  
  disconnect: async function () {
    try {
      const client = await ensureClientAvailable();
      
      await client.disconnect('WalletConnect');
      
      // Return success for the caller to handle store updates
      return { success: true };
    } catch (error) {
      console.error("WalletConnect disconnect failed:", error);
      throw new Error("WalletConnect client disconnection failed");
    }
  },
  
  sign: async function (signingCommand) {
    try {
      const client = await ensureClientAvailable();
      
      console.log("WalletConnect sign with command:", signingCommand);
      
      // Try different method names that might be available
      let result;
      if (typeof client.signTransaction === 'function') {
        console.log("Using signTransaction method for sign");
        result = await client.signTransaction('WalletConnect', signingCommand);
      } else if (typeof client.sign === 'function') {
        console.log("Using sign method for sign");
        result = await client.sign('WalletConnect', signingCommand);
      } else {
        console.error("No supported signing method found on client for sign");
        throw new Error("No supported signing method found");
      }
      
      console.log("WalletConnect sign result:", result);
      return result;
    } catch (error) {
      console.error("Error during signing:", error);
      throw error;
    }
  },
  
  quickSign: async function (data) {
    try {
      // First validate that we're properly connected to WalletConnect
      await validateWalletConnectConnection();
      
      const client = await ensureClientAvailable();
      
      console.log("WalletConnect client methods:", Object.keys(client));
      console.log("Attempting to sign transaction with data:", data);
      
      // Try different method names that might be available
      let result;
      if (typeof client.signTransaction === 'function') {
        console.log("Using signTransaction method");
        result = await client.signTransaction('WalletConnect', data);
      } else if (typeof client.sign === 'function') {
        console.log("Using sign method");
        result = await client.sign('WalletConnect', data);
      } else if (typeof client.signCommand === 'function') {
        console.log("Using signCommand method");
        result = await client.signCommand('WalletConnect', data);
      } else {
        console.error("No supported signing method found on client. Available methods:", Object.keys(client));
        throw new Error("No supported signing method found");
      }
      
      console.log("WalletConnect signing result:", result);
      return result;
    } catch (error) {
      console.error("Error during quick signing:", error);
      throw error;
    }
  },
  
  quickSignAll: async function (data) {
    try {
      // First validate that we're properly connected to WalletConnect
      await validateWalletConnectConnection();
      
      const client = await ensureClientAvailable();
      
      console.log("WalletConnect quickSignAll with data:", data);
      console.log("Data is array:", Array.isArray(data), "Length:", data?.length);
      
      // WalletConnect supports batch signing
      let result;
      if (typeof client.signTransaction === 'function') {
        console.log("Using signTransaction method for batch signing");
        result = await client.signTransaction('WalletConnect', data);
      } else if (typeof client.sign === 'function') {
        console.log("Using sign method for batch signing");
        result = await client.sign('WalletConnect', data);
      } else {
        throw new Error("No supported signing method found");
      }
      
      console.log("WalletConnect batch signing result:", result);
      
      // Ensure result is properly formatted for batch operations
      if (Array.isArray(result)) {
        return { 
          responses: result,
          status: 'success'
        };
      } else if (result && typeof result === 'object') {
        // Single transaction result, wrap in array
        return { 
          responses: [result],
          status: 'success'
        };
      } else {
        throw new Error("Invalid signing result format");
      }
    } catch (error) {
      console.error("Error during WalletConnect batch signing:", error);
      throw error;
    }
  },
};

export default wc;

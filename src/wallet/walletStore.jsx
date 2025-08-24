// walletStore.jsx
import { create } from "zustand";
import walletConnectStore from "./providers/connectWalletModalSlice";
import { toast } from "react-toastify";
import config from "./config";
import { 
  saveWalletToStorage, 
  loadWalletFromStorage, 
  clearWalletFromStorage, 
  isWalletStorageAvailable 
} from "./walletPersistence";

// MetaMask connection function using adapter
const connectMetaMaskWithAdapter = async () => {
  try {
    const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
    
    // Detect if MetaMask Snap is available (this will check for both MetaMask and the Snap)
    const provider = await detectSnapProvider({ silent: false });
    if (!provider) {
      return {
        status: "error",
        message: "MetaMask Snap not available. Please install MetaMask and enable the Kadena Snap."
      };
    }

    // Create adapter instance
    const adapter = new SnapAdapter({ provider });
    
    // Connect using the adapter
    await adapter.connect();
    
    // Get account information
    const accounts = await adapter.getAccounts();
    if (!accounts || accounts.length === 0) {
      return {
        status: "error",
        message: "No accounts found in MetaMask Snap. Please create an account in the Kadena Snap."
      };
    }

    const account = accounts[0];
    return {
      status: "success",
      account: {
        account: account.address || account.accountName,
        publicKey: account.publicKey || account.guard?.keys?.[0]
      }
    };
  } catch (error) {
    console.error("MetaMask Snap connection error:", error);
    
    // Check for specific Snap-related errors
    if (error.message.includes('Snap') || error.message.includes('snap')) {
      return {
        status: "error",
        message: "MetaMask Snap error. Please ensure the Kadena Snap is installed and enabled."
      };
    }
    
    if (error.message.includes('User rejected') || error.message.includes('denied')) {
      return {
        status: "error",
        message: "Connection rejected. Please approve the MetaMask Snap connection."
      };
    }
    
    return {
      status: "error",
      message: error.message || "Failed to connect to MetaMask Snap"
    };
  }
};

// Load initial state from sessionStorage
const getInitialState = () => {
  if (typeof window !== 'undefined' && isWalletStorageAvailable()) {
    const savedWallet = loadWalletFromStorage();
    if (savedWallet) {
      return {
        provider: savedWallet.provider,
        account: savedWallet.account,
        pubKey: savedWallet.pubKey,
        isConnected: savedWallet.isConnected,
        messages: savedWallet.isConnected ? "Restored from previous session." : "",
        session: undefined,
      };
    }
  }
  
  return {
    provider: null,
    account: null,
    pubKey: null,
    isConnected: false,
    messages: "",
    session: undefined,
  };
};

const useWalletStore = create((set) => ({
  ...getInitialState(),

  setSessionData: ({ provider, account, pubKey, isConnected }) => {
    const newState = {
      provider,
      account,
      pubKey,
      isConnected,
      messages: isConnected ? "Successfully connected." : "",
    };
    
    set(newState);
    
    // Save to sessionStorage when session data is set
    if (isConnected && isWalletStorageAvailable()) {
      saveWalletToStorage(newState);
    }
  },

  connectWallet: async (providerId, connectWithWalletConnect) => {
    let connectResult = {};
    const { sethideConnectWalletModal } = walletConnectStore.getState();
    console.log("providerId", providerId);
    try {
      if (providerId === "WC") {
        console.log("Connecting with WalletConnect...");
        // Handles our Wallet Connect specific logic
        connectResult = await connectWithWalletConnect();
        console.log("WalletConnect connectResult", connectResult);
        
        // Hide the modal after successful connection
        sethideConnectWalletModal();
        return;
      } else if (providerId === "METAMASK") {
        console.log("Connecting with MetaMask...");
        // Use the adapter system for MetaMask
        try {
          const result = await connectMetaMaskWithAdapter();
          
          if (result.status === "success") {
            const newWalletState = {
              provider: providerId,
              account: result.account.account,
              pubKey: result.account.publicKey,
              isConnected: true,
              messages: "Successfully connected to MetaMask.",
            };
            
            set(newWalletState);
            
            // Save to sessionStorage
            if (isWalletStorageAvailable()) {
              saveWalletToStorage(newWalletState);
            }
            
            sethideConnectWalletModal();
            return;
          } else {
            // Show toast error message for MetaMask issues
            toast.error(result.message);
            console.error("MetaMask connection error:", result.message);
            set({ messages: `MetaMask connection error: ${result.message}` });
            return;
          }
        } catch (error) {
          const errorMessage = error.message || "Failed to connect to MetaMask";
          toast.error(errorMessage);
          console.error("Error connecting to MetaMask:", error);
          set({ messages: `MetaMask connection error: ${errorMessage}` });
          return;
        }
      } else {
        // Dynamically import providers to avoid circular dependency
        const { default: providers } = await import("./providers/providers");
        const provider = providers[providerId];
        connectResult = await provider.connect();
      }
      if (connectResult.status === "success") {
        const newWalletState = {
          provider: providerId,
          account: connectResult.account.account,
          pubKey: connectResult.account.publicKey,
          isConnected: true,
          messages: "Successfully connected.",
        };
        
        set(newWalletState);
        
        // Save to sessionStorage
        if (isWalletStorageAvailable()) {
          saveWalletToStorage(newWalletState);
        }
        
        sethideConnectWalletModal();
      } else if (connectResult.message === "Network invalid") {
        // Specific handling when the network is invalid
        toast(`Error: Please ensure your wallet is set to ${config.networkId}.`);
        console.error("Connection error: Wrong network.");
        set({ messages: "Connection error: Wrong network." });
      } else {
        console.error("Error during connection:", connectResult);
        set({ messages: `Connection error: ${connectResult.message}` });
      }
    } catch (error) {
      console.error("Error during connection:", error);
      set({ messages: `Connection error: ${error.message}` });
    }
  },

  disconnectWallet: async () => {
    const providerName = useWalletStore.getState().provider;

    if (!providerName) {
      console.log("No provider connected, skipping disconnection.");
      return;
    }

    try {
      if (providerName === "WC") {
        // Handle WalletConnect disconnection through adapter system
        const { disconnectWithWalletConnect } = await import("./wcStore");
        await disconnectWithWalletConnect();
      } else if (providerName === "METAMASK") {
        // Handle MetaMask disconnection through adapter system
        try {
          const { detectSnapProvider, SnapAdapter } = await import('@kadena/wallet-adapter-metamask-snap');
          const provider = await detectSnapProvider({ silent: true });
          if (provider) {
            const adapter = new SnapAdapter({ provider });
            await adapter.disconnect();
          }
        } catch (error) {
          console.error("Error disconnecting MetaMask:", error);
        }
      } else {
        // Dynamically import providers to avoid circular dependency
        const { default: providers } = await import("./providers/providers");
        const provider = providers[providerName];
        await provider.disconnect(); // Attempt to disconnect from wallet
      }
    } catch (error) {
      console.error("Error during disconnection:", error);
    }

    // Always reset the state after attempting to disconnect
    localStorage.removeItem("spireKeySession"); // Clear SpireKey session from localStorage
    
    // Clear wallet data from sessionStorage
    clearWalletFromStorage();
    
    set({
      provider: null,
      account: null,
      pubKey: null,
      isConnected: false,
      messages: "Disconnected",
    });
  },

  restoreWalletSession: () => {
    if (typeof window !== 'undefined' && isWalletStorageAvailable()) {
      const savedWallet = loadWalletFromStorage();
      if (savedWallet && savedWallet.isConnected) {
        set({
          provider: savedWallet.provider,
          account: savedWallet.account,
          pubKey: savedWallet.pubKey,
          isConnected: savedWallet.isConnected,
          messages: "Session restored from storage.",
        });
        return savedWallet;
      }
    }
    return null;
  },

  clearWalletSession: () => {
    clearWalletFromStorage();
    set({
      provider: null,
      account: null,
      pubKey: null,
      isConnected: false,
      messages: "",
      session: undefined,
    });
  },

  setProvider: (newProvider) => set({ provider: newProvider }),
  getState: () => ({ /* return the current state */ }),
}));

export default useWalletStore;

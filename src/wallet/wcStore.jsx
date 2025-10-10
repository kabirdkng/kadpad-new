import { create } from "zustand";
import { useWalletConnectClient } from "./providers/ClientContextProvider";

const useWalletConnectStore = create((set) => ({
  selectedAccount: null,
  signingType: "sign",
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setSigningType: (type) => set({ signingType: type }),
}));

export const useWalletConnect = () => {
  const { selectedAccount, signingType, setSelectedAccount, setSigningType } = useWalletConnectStore();
  const { session, connect, disconnect, isInitializing } = useWalletConnectClient();

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return {
    session,
    selectedAccount,
    signingType,
    isInitializing,
    setSelectedAccount,
    setSigningType,
    handleConnect,
    handleDisconnect,
  };
};

// Function to establish a connection with WalletConnect
export const useWalletConnection = () => {
  const { connect, disconnect } = useWalletConnectClient();

  const connectWithWalletConnect = async () => {
    return connect();
  };

  const disconnectWithWalletConnect = async () => {
    return disconnect();
  };

  return { connectWithWalletConnect, disconnectWithWalletConnect };
};

// Non-hook function to disconnect WalletConnect
export const disconnectWithWalletConnect = async () => {
  try {
    // Get the current wallet store state directly (non-hook way)
    const walletStoreModule = await import("./walletStore");
    const walletStore = walletStoreModule.default;
    const currentState = walletStore.getState();
    
    if (!currentState.session) {
      console.log("No WalletConnect session found to disconnect");
      return;
    }
    
    // Import SignClient and required utilities directly
    const SignClient = (await import("@walletconnect/sign-client")).default;
    const { getSdkError } = await import("@walletconnect/utils");
    
    // Initialize client with the same config as ClientContextProvider
    let client;
    try {
      const projectId = import.meta.env.VITE_APP_projectId;
      const relayUrl = import.meta.env.VITE_APP_relayUrl || "wss://relay.walletconnect.com";
      
      client = await SignClient.init({
        relayUrl,
        projectId,
        metadata: {
          name: "Kadpad",
          description: "Kadpad Platform",
          url: "https://kadpad.xyz",
          icons: ["https://kadpad.xyz/favicon.svg"],
        },
      });
    } catch (error) {
      console.error("Failed to initialize SignClient for disconnect:", error);
      // If we can't initialize the client, just clear the store
      walletStore.setState({
        account: "",
        provider: null,
        pubKey: "",
        session: null,
        isConnected: false,
        messages: "Disconnected from WalletConnect",
        networkId: null,
      });
      return;
    }
    
    // Get all active sessions and disconnect them
    try {
      const allSessions = client.session.getAll();
      console.log("Found sessions to disconnect:", allSessions.length);
      
      // Disconnect all active sessions
      for (const session of allSessions) {
        try {
          await client.disconnect({
            topic: session.topic,
            reason: getSdkError("USER_DISCONNECTED"),
          });
          console.log("Disconnected session:", session.topic);
        } catch (sessionError) {
          console.error("Failed to disconnect session:", session.topic, sessionError);
        }
      }
      
      // Also try to disconnect the specific session if we have it
      if (currentState.session && currentState.session.topic) {
        try {
          await client.disconnect({
            topic: currentState.session.topic,
            reason: getSdkError("USER_DISCONNECTED"),
          });
          console.log("Disconnected current session:", currentState.session.topic);
        } catch (error) {
          console.error("Failed to disconnect current session:", error);
        }
      }
      
    } catch (error) {
      console.error("Error getting or disconnecting sessions:", error);
    }
    
    // Clear all pairings as well
    try {
      const allPairings = client.pairing.getAll();
      for (const pairing of allPairings) {
        try {
          await client.pairing.delete(pairing.topic, getSdkError("USER_DISCONNECTED"));
          console.log("Deleted pairing:", pairing.topic);
        } catch (pairingError) {
          console.error("Failed to delete pairing:", pairing.topic, pairingError);
        }
      }
    } catch (error) {
      console.error("Error clearing pairings:", error);
    }
    
    // Clear the wallet store state
    walletStore.setState({
      account: "",
      provider: null,
      pubKey: "",
      session: null,
      isConnected: false,
      messages: "Successfully Disconnected from WalletConnect",
      networkId: null,
    });
    
    // Clear from storage if the function exists
    const clearWalletFromStorage = currentState.clearWalletFromStorage;
    if (typeof clearWalletFromStorage === 'function') {
      clearWalletFromStorage();
    }
    
    // Clear localStorage keys that WalletConnect might use
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('wc@2:') || 
          key.startsWith('walletconnect') ||
          key.includes('walletconnect') ||
          key.includes('wc_') ||
          key.includes('@walletconnect')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log("Removed localStorage key:", key);
      });
    } catch (storageError) {
      console.error("Error clearing localStorage:", storageError);
    }
    
    console.log("WalletConnect disconnection completed");
    return true;
    
  } catch (error) {
    console.error("Error disconnecting WalletConnect:", error);
    
    // Fallback: at least clear the store state and localStorage
    try {
      const walletStoreModule = await import("./walletStore");
      const walletStore = walletStoreModule.default;
      walletStore.setState({
        account: "",
        provider: null,
        pubKey: "",
        session: null,
        isConnected: false,
        messages: "Disconnected (with errors)",
        networkId: null,
      });
      
      // Force clear WalletConnect localStorage even if there are errors
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('wc@2:') || 
          key.startsWith('walletconnect') ||
          key.includes('walletconnect') ||
          key.includes('wc_') ||
          key.includes('@walletconnect')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
    } catch (fallbackError) {
      console.error("Fallback cleanup failed:", fallbackError);
    }
    
    throw error;
  }
};
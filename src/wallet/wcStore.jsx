import { create } from "zustand";
import { useKadenaWallet } from "@kadena/wallet-adapter-react";
import useWalletStore from "./walletStore";

const useWalletConnectStore = create((set) => ({
  selectedAccount: null,
  signingType: "sign",
  isConnecting: false,
  session: null,
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setSigningType: (type) => set({ signingType: type }),
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),
  setSession: (session) => set({ session: session }),
}));

export const useWalletConnect = () => {
  const { 
    selectedAccount, 
    signingType, 
    isConnecting, 
    session,
    setSelectedAccount, 
    setSigningType, 
    setIsConnecting,
    setSession
  } = useWalletConnectStore();

  const { client } = useKadenaWallet();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const account = await client.connect('WalletConnect');
      setSelectedAccount(account);
      setSession({ connected: true, account });
      return account;
    } catch (error) {
      console.error("WalletConnect connection failed:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await client.disconnect('WalletConnect');
      setSelectedAccount(null);
      setSession(null);
    } catch (error) {
      console.error("WalletConnect disconnection failed:", error);
      throw error;
    }
  };

  return {
    session,
    selectedAccount,
    signingType,
    isInitializing: isConnecting,
    setSelectedAccount,
    setSigningType,
    handleConnect,
    handleDisconnect,
  };
};

// Function to establish a connection with WalletConnect
export const useWalletConnection = () => {
  const { handleConnect, handleDisconnect } = useWalletConnect();

  const connectWithWalletConnect = async () => {
    try {
      const account = await handleConnect();
      console.log("WalletConnect account object:", account);
      console.log("Account properties:", Object.keys(account || {}));
      
      // Extract the public key from the guard or keyset
      const publicKey = account.guard?.keys?.[0] || account.keyset?.keys?.[0];
      
      const walletState = {
        provider: "WC",
        account: account.accountName,
        pubKey: publicKey,
        isConnected: true,
        session: { connected: true, account }
      };
      
      // Update the main wallet store with WalletConnect data
      useWalletStore.setState(walletState);
      
      // Save to sessionStorage
      const { saveWalletToStorage, isWalletStorageAvailable } = await import('./walletPersistence');
      if (isWalletStorageAvailable()) {
        saveWalletToStorage(walletState);
      }
      
      console.log("Updated wallet store with:", walletState);
      
      return account;
    } catch (error) {
      console.error("WalletConnect connection error:", error);
      throw error;
    }
  };

  const disconnectWithWalletConnect = async () => {
    try {
      await handleDisconnect();
      
      // Update the main wallet store
      useWalletStore.setState({
        provider: null,
        account: null,
        pubKey: null,
        isConnected: false,
        session: null
      });
      
      // Clear wallet data from sessionStorage
      const { clearWalletFromStorage } = await import('./walletPersistence');
      clearWalletFromStorage();
      
      console.log("WalletConnect disconnected and wallet store cleared");
    } catch (error) {
      console.error("WalletConnect disconnection error:", error);
      throw error;
    }
  };

  return { connectWithWalletConnect, disconnectWithWalletConnect };
};

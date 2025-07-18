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

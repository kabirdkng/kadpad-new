// walletStore.jsx
import { create } from "zustand";
import providers from "./providers/providers";
import walletConnectStore from "./providers/connectWalletModalSlice";
import { toast } from "react-toastify";
import config from "./config";

const useWalletStore = create((set) => ({
  provider: null,
  account: null,
  pubKey: null,
  isConnected: false,
  messages: "",
  session: undefined,

  setSessionData: ({ provider, account, pubKey, isConnected }) => {
    set({
      provider,
      account,
      pubKey,
      isConnected,
      messages: isConnected ? "Successfully connected." : "",
    });
  },

  connectWallet: async (providerId, connectWithWalletConnect) => {
    let connectResult = {};
    const { sethideConnectWalletModal } = walletConnectStore.getState();
    console.log("providerId", providerId);
    try {
      if (providerId === "WC") {
        console.log("Connecting with WalletConnect...");
        // Handles our Wallet Connect specific logic
        // set({ isConnected: true });
        connectResult = await connectWithWalletConnect();
        // console.log("connectResult", connectResult);
        return;
      } else {
        // Handles all other providers
        const provider = providers[providerId];
        connectResult = await provider.connect();
      }
      if (connectResult.status === "success") {
        set({
          provider: providerId,
          account: connectResult.account.account,
          pubKey: connectResult.account.publicKey,
          isConnected: true,
          messages: "Successfully connected.",
        });
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

    const provider = providers[providerName];

    try {
      await provider.disconnect(); // Attempt to disconnect from wallet
    } catch (error) {
      console.error("Error during disconnection:", error);
    }

    // Always reset the state after attempting to disconnect
    localStorage.removeItem("spireKeySession"); // Clear SpireKey session from localStorage
    set({
      provider: null,
      account: null,
      pubKey: null,
      isConnected: false,
      messages: "Disconnected",
    });
  },

  setProvider: (newProvider) => set({ provider: newProvider }),
  getState: () => ({ /* return the current state */ }),
}));

export default useWalletStore;

import { create } from "zustand";
import useWalletStore from "../walletStore.jsx";

const walletConnectStore = create((set) => ({
  showModal: false,
  setshowConnectWalletModal: () => set({ showModal: true }),
  sethideConnectWalletModal: () => set({ showModal: false }),
}));
export const { setshowConnectWalletModal, sethideConnectWalletModal } = walletConnectStore;

export const connectWithProvider = () => {
  const { provider, setProvider } = useWalletStore.getState();
  const { sethideConnectWalletModal } = walletConnectStore.getState();
  console.log("prov", provider)
  if (provider !== "") {
    // Hides the wallet connect modal
    sethideConnectWalletModal();
    // Set the provider in the wallet store
    setProvider(provider);
  }
};

export const connectWithSpireKey = (data) => {
  const { setProvider, setSessionData } = useWalletStore.getState();
  const { sethideConnectWalletModal } = walletConnectStore.getState();
  if (data && data._user && data._user.accountName) {
    // Correctly hide the wallet connect modal
    sethideConnectWalletModal();

    // Update the wallet store with the SpireKey session data
    setSessionData({
      provider: "SPIREKEY",
      account: data._user.accountName,
      pubKey: data._user.credentials[0].publicKey,
      isConnected: true
    });
  } else {
    console.error("SpireKey data is missing or incomplete");
  }
};

export default walletConnectStore;

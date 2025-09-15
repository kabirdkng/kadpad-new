// ConnectWalletModal.jsx
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { X_WALLET, WC, KOALA, METAMASK, MAGIC } from "./providers";
import useWalletStore from "../walletStore";
import walletConnectStore from "./connectWalletModalSlice";
import "./wallet.css";
import { useWalletConnect, useWalletConnection } from "../wcStore";
import Ecko from "../../assets/Ecko.svg?react"
import wc from "../../assets/WC.svg?react"
import magic from "../../assets/magic.svg?react"
import { toast } from "react-toastify";

const ConnectWalletModal = ({ onWalletConnected }) => {
  const showModal = walletConnectStore((state) => state.showModal);
  const { handleConnect } = useWalletConnect();
  const { connectWithWalletConnect } = useWalletConnection();
  const closeModal = walletConnectStore((state) => state.sethideConnectWalletModal);
  const { connectWallet, provider } = useWalletStore();
  const modalRef = useRef();

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  const connectMetaMaskClicked = async () => {
    // Use the metamask provider directly
    connectWallet(METAMASK);
    closeModal();
  };

  const connectMagicClicked = async () => {
    connectWallet(MAGIC);
    closeModal();
  };

  const connectXWalletClicked = () => {
    !window.kadena && toast.error("eckoWallet not installed")
    connectWallet(X_WALLET);
    closeModal()
  };

  const handleWalletConnect = async () => {
    try {
      closeModal();
      await connectWithWalletConnect();
    } catch (error) {
      console.error('Error connecting to WalletConnect:', error);
      toast.error("Failed to connect to WalletConnect");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  useEffect(() => {
    if (onWalletConnected && provider) {
      onWalletConnected(provider);
    }
  }, [provider, onWalletConnected]);
  
  if (!showModal) {
    return null;
  }
  
  console.log(showModal)
  return (
    <div className="wallet-modal-container">
      <div className="wallet-modal" ref={modalRef}>
        <h3 className="text-xl font-semibold text-center mb-4 text-primary">Connect Wallet</h3>
        
        <button onClick={connectXWalletClicked} className="btn btn-secondary wallet-row">
          <span className="wallet-icon"><img src={Ecko} alt="Ecko" /></span>
          <span className="wallet-name">Ecko Wallet</span>
        </button>
        
        <button onClick={connectMetaMaskClicked} className="btn btn-secondary wallet-row">
          <span className="wallet-icon"><img src="https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg" alt="MetaMask" /></span>
          <span className="wallet-name">MetaMask (Snap)</span>
        </button>
        
        <button onClick={handleWalletConnect} className="btn btn-secondary wallet-row">
          <span className="wallet-icon"><img src={wc} alt="WalletConnect" /></span>
          <span className="wallet-name">Wallet Connect</span>
        </button>
        
        <button onClick={connectMagicClicked} className="btn btn-secondary wallet-row">
          <span className="wallet-icon"><img src={magic} alt="Magic" /></span>
          <span className="wallet-name">Magic Wallet (Spirekey)</span>
        </button>
      </div>
    </div>
  );
};

ConnectWalletModal.propTypes = {
  onWalletConnected: PropTypes.func,
};

export default ConnectWalletModal;

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
 
  useEffect(() => {
    if (!showModal) {
      return null;
    }
  }, [])
  
 console.log(showModal)
  return (
    <div className="wallet-modal-container tm-bg-dark-n">
      <div className="wallet-modal" ref={modalRef}>
            <button onClick={connectXWalletClicked} className='btn provider-button' ><img src={Ecko} /> Ecko Wallet </button>
            <button onClick={handleWalletConnect} className='btn provider-button' ><img src={wc} /> Wallet Connect </button>
            <button onClick={connectMagicClicked} className='btn provider-button' ><span style={{width: '24px', height: '24px', backgroundColor: '#6851ff', borderRadius: '4px', display: 'inline-block', marginRight: '8px'}}></span> Magic Wallet </button>
            {/* <button onClick={connectMetaMaskClicked} className='btn provider-button' ><img src="https://images.ctfassets.net/clixtyxoaeas/4rnpEzy1ATWRKVBOLxZ1Fm/a74dc1eed36d23d7ea6030383a4d5163/MetaMask-icon-fox.svg" /> MetaMask </button> */}
      </div>
    </div>
  );
};

ConnectWalletModal.propTypes = {
  onWalletConnected: PropTypes.func,
};

export default ConnectWalletModal;

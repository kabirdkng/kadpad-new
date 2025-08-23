// ConnectWalletModal.jsx
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { X_WALLET, WC, KOALA } from "./providers";
import useWalletStore from "../walletStore";
import walletConnectStore from "./connectWalletModalSlice";
import "./wallet.css";
import { useWalletConnect, useWalletConnection } from "../wcStore";
import Ecko from "../../assets/Ecko.svg?react"
import wc from "../../assets/WC.svg?react"
import SpireKey from "../../assets/SpireKey.svg?react"
import { connect } from '@kadena/spirekey-sdk';
import config from "../config";
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

  const connectXWalletClicked = () => {
    !window.kadena && toast.error("eckoWallet not installed")
    connectWallet(X_WALLET);
    closeModal()
  };
  
  const connectSpireKeyClicked = async () => {
    try {
      const account = await connect(config.networkId, config.chainId);
      console.log('spire account', account);
      useWalletStore.getState().connectWallet('SPIREKEY');
    } catch (error) {
      console.error('Error connecting to SpireKey:', error);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWithWalletConnect();
      closeModal();
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
            <button onClick={connectSpireKeyClicked} className='btn provider-button' ><img src={SpireKey} /> Spire Key </button>
      </div>
    </div>
  );
};

ConnectWalletModal.propTypes = {
  onWalletConnected: PropTypes.func,
};

export default ConnectWalletModal;

// ConnectWalletModal.jsx
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { X_WALLET, METAMASK, MAGIC, CHAINWEAVER, CHAINWEAVER_LEGACY } from "./providers";
import useWalletStore from "../walletStore.jsx";
import walletConnectStore from "./connectWalletModalSlice";
import "./wallet.css";
import { useWalletConnection } from "../wcStore";
import Ecko from "../../assets/Ecko.svg?react"
import wc from "../../assets/WC.svg?react"
import magic from "../../assets/magic.svg?react"
import chainweaverl from "../../assets/chainweaver-legacy.png?react"
import chainweaver from "../../assets/chainweaver.svg?react"
import { toast } from "react-toastify";
import { isLinxExplorer } from "../../utils/walletDetection.js";

const ConnectWalletModal = ({ onWalletConnected }) => {
  const showModal = walletConnectStore((state) => state.showModal);
  const { connectWithWalletConnect } = useWalletConnection();
  const closeModal = walletConnectStore((state) => state.sethideConnectWalletModal);
  const { connectWallet, provider } = useWalletStore();
  const modalRef = useRef();
  
  // State for Chainweaver Legacy account input
  const [showAccountInput, setShowAccountInput] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");

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

  const connectChainweaverClicked = async () => {
    connectWallet(CHAINWEAVER);
    closeModal();
  };

  const connectChainweaverLegacyClicked = async () => {
    console.log("Chainweaver Legacy button clicked");
    // Show the account input instead of connecting immediately
    setShowAccountInput(true);
    setConnectionError("");
  };

  const handleAccountSubmit = async () => {
    if (!accountName.trim()) {
      setConnectionError("Please enter an account name");
      return;
    }

    setIsConnecting(true);
    setConnectionError("");
    
    try {
      await connectWallet(CHAINWEAVER_LEGACY, accountName.trim());
      // Reset states and close modal on success
      setShowAccountInput(false);
      setAccountName("");
      closeModal();
    } catch (error) {
      setConnectionError(error.message || "Failed to connect to Chainweaver Legacy");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountInputKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAccountSubmit();
    }
  };

  const handleBackToWallets = () => {
    setShowAccountInput(false);
    setAccountName("");
    setConnectionError("");
    setIsConnecting(false);
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

  const isLinx = isLinxExplorer();

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
  console.log("ConnectWalletModal render - showAccountInput:", showAccountInput);
  
  return (
    <>
      
      <div className="wallet-modal-container">
        <div className="wallet-modal" ref={modalRef}>
          {!showAccountInput ? (
            // Show wallet selection
            <>
              <h3 className="text-xl font-semibold text-left text-primary">Select Wallet</h3>
              
              {/* Show only Linx Wallet (X_WALLET) button if in Linx Explorer */}
              {isLinx ? (
                <button onClick={connectXWalletClicked} className="btn btn-secondary wallet-row">
                  <span className="wallet-icon"><img src={Ecko} alt="Linx" /></span>
                  <span className="wallet-name">Linx Wallet</span>
                </button>
              ) : (
                <>
                  {/* Show all wallet options when not in Linx Explorer */}
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
              
                  <button onClick={connectChainweaverClicked} className="btn btn-secondary wallet-row">
                    <span className="wallet-icon">
                      <img src={chainweaver} alt="Chainweaver" />
                    </span>
                    <span className="wallet-name">Chainweaver(V3)</span>
                  </button>
              
                  <button onClick={connectChainweaverLegacyClicked} className="btn btn-secondary wallet-row">
                    <span className="wallet-icon">
                      <img src={chainweaverl} alt="Chainweaver Legacy" />
                    </span>
                    <span className="wallet-name">Chainweaver(Legacy)</span>
                  </button>
                </>
              )}
            </>
          ) : (
            // Show account input for Chainweaver Legacy
            <>
              <h3 className="text-xl font-semibold text-left text-primary">
                Connect to Chainweaver Legacy
              </h3>
              
              <div className="mt-4">
                <label htmlFor="account-name" className="block text-sm font-medium text-gray-300 mb-2">
                  Account Name
                </label>
                <input
                  id="account-name"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  onKeyPress={handleAccountInputKeyPress}
                  placeholder="Enter your account name (e.g., alice)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  disabled={isConnecting}
                  autoFocus
                />
                
                {connectionError && (
                  <p className="mt-2 text-sm text-red-600">{connectionError}</p>
                )}
                
                <div className="mt-4 text-xs text-gray-500">
                  <p>Your account name is typically in the format: k:your-account-name</p>
                  <p>You can find this in your Chainweaver wallet under &quot;Accounts&quot;.</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleBackToWallets}
                  disabled={isConnecting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleAccountSubmit}
                  disabled={isConnecting || !accountName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

ConnectWalletModal.propTypes = {
  onWalletConnected: PropTypes.func,
};

export default ConnectWalletModal;

import { useState } from 'react';
import { Wallet, LogOut, Copy, Check, ExternalLink } from 'lucide-react';
import useWalletStore from "../wallet/walletStore";
import walletConnectStore from "../wallet/providers/connectWalletModalSlice";

const WalletConnectButton = () => {
  const { disconnectWallet, isConnected, provider, account } = useWalletStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const setshowConnectWalletModal = walletConnectStore((state) => state.setshowConnectWalletModal);
  const sethideConnectWalletModal = walletConnectStore((state) => state.sethideConnectWalletModal);

  const handleClick = () => {
    if (isConnected) {
      setShowDropdown(!showDropdown);
    } else {
      setshowConnectWalletModal();
    }
  };

  const onDisconnect = () => {
    if (provider === "SPIREKEY") {
      alert("SpireKey logout");
    }
    disconnectWallet();
    sethideConnectWalletModal();
    setShowDropdown(false);
  };

  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    // More aggressive truncation for mobile
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'X_WALLET':
        return 'Ecko Wallet';
      case 'WC':
        return 'WalletConnect';
      case 'SPIREKEY':
        return 'SpireKey';
      case 'METAMASK':
        return 'MetaMask';
      case 'MAGIC':
        return 'Magic';
      case 'CHAINWEAVER':
        return 'Chainweaver';
      case 'CHAINWEAVER_LEGACY':
        return 'Chainweaver Legacy';
      default:
        return 'Wallet';
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleClick}
        className="btn btn-primary flex items-center gap-2 relative group px-3 py-2 sm:px-6 sm:py-3 z-10"
      >
        <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:inline text-sm sm:text-base">Connect Wallet</span>
        <span className="sm:hidden text-xs">Connect</span>
      </button>
    );
  }

  return (
    <div className="wallet-dropdown-container relative">
      <button
        onClick={handleClick}
        className="btn btn-secondary flex items-center gap-1 sm:gap-2 relative group px-2 py-2 sm:px-4 sm:py-3 min-w-[100px] sm:min-w-[120px] justify-center z-10"
      >
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-primary rounded-full animate-pulse"></div>
        <span className="font-mono text-xs sm:text-sm truncate max-w-[60px] sm:max-w-none">
          {truncateAddress(account)}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop - Fixed positioning for mobile */}
          <div 
            className="fixed inset-0 bg-transparent z-[9998]" 
            onClick={() => setShowDropdown(false)}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998
            }}
          ></div>
          
          {/* Dropdown Content */}
          <div className="wallet-dropdown-mobile" style={{ zIndex: 9999 }}>
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-border-color">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center flex-shrink-0">
                    <Wallet size={14} className="sm:w-[18px] sm:h-[18px] text-accent-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-primary-text text-sm sm:text-base">Connected</div>
                    <div className="text-xs text-secondary truncate">{getProviderName(provider)}</div>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-accent-primary rounded-full flex-shrink-0"></div>
              </div>
            </div>

            {/* Account Info */}
            <div className="p-3 sm:p-4 border-b border-border-color">
              <div className="text-xs text-secondary mb-1">Account Address</div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs sm:text-sm text-primary-text break-all flex-1 leading-relaxed">
                  {account}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-hover-bg transition-colors duration-200 flex-shrink-0 mt-0.5"
                  title="Copy address"
                >
                  {copied ? (
                    <Check size={14} className="sm:w-4 sm:h-4 text-accent-primary" />
                  ) : (
                    <Copy size={14} className="sm:w-4 sm:h-4 text-secondary hover:text-primary-text" />
                  )}
                </button>
              </div>
              {copied && (
                <div className="text-xs text-accent-primary mt-1 animate-fade-in">
                  Address copied to clipboard!
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-3 sm:p-4 space-y-2">
              <a
                href={`https://explorer.kadena.io/mainnet/account/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-2.5 sm:p-3 rounded-lg hover:bg-hover-bg transition-colors duration-200 group"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <ExternalLink size={14} className="sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-primary-text">View on Explorer</span>
                </div>
                <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5 text-secondary group-hover:text-primary-text flex-shrink-0" />
              </a>
              
              <button
                onClick={onDisconnect}
                className="flex items-center justify-between w-full p-2.5 sm:p-3 rounded-lg hover:bg-red-500/10 hover:border-red-500/20 transition-colors duration-200 group text-left"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <LogOut size={14} className="sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-red-400">Disconnect Wallet</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletConnectButton;
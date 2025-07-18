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
      default:
        return 'Wallet';
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleClick}
        className="btn btn-primary flex items-center gap-2 relative group"
      >
        <Wallet size={18} />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="btn btn-secondary flex items-center gap-2 relative group min-w-[120px] justify-center"
      >
        <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse"></div>
        <span className="font-mono text-sm">
          {truncateAddress(account)}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          ></div>
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-card border border-border-color rounded-2xl shadow-lg z-50 animate-scale-in">
            {/* Header */}
            <div className="p-4 border-b border-border-color">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
                    <Wallet size={18} className="text-accent-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-primary-text">Connected</div>
                    <div className="text-xs text-secondary">{getProviderName(provider)}</div>
                  </div>
                </div>
                <div className="w-3 h-3 bg-accent-primary rounded-full"></div>
              </div>
            </div>

            {/* Account Info */}
            <div className="p-4 border-b border-border-color">
              <div className="text-xs text-secondary mb-1">Account Address</div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-primary-text break-all">
                  {account}
                </span>
                <button
                  onClick={copyAddress}
                  className="ml-2 p-2 rounded-lg hover:bg-hover-bg transition-colors duration-200 flex-shrink-0"
                  title="Copy address"
                >
                  {copied ? (
                    <Check size={16} className="text-accent-primary" />
                  ) : (
                    <Copy size={16} className="text-secondary hover:text-primary-text" />
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
            <div className="p-4 space-y-2">
              <a
                href={`https://explorer.chainweb.com/testnet04/account/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-hover-bg transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={16} className="text-secondary" />
                  <span className="text-sm text-primary-text">View on Explorer</span>
                </div>
                <ExternalLink size={14} className="text-secondary group-hover:text-primary-text" />
              </a>
              
              <button
                onClick={onDisconnect}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-red-500/10 hover:border-red-500/20 transition-colors duration-200 group text-left"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={16} className="text-red-400" />
                  <span className="text-sm text-red-400">Disconnect Wallet</span>
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
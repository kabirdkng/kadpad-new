import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Settings, Users, DollarSign, X } from 'lucide-react';
import ManageSales from './ManageSales';
import AccessTreasury from './AccessTreasury';
import TransactionStatusIndicator from '../TransactionStatusIndicator';

const DeployerPanel = ({ setDeployerPanel, tokenSymbol, countdown, namespace, moduleName, supplyChain }) => {
  const [showOption, setShowOption] = useState(null);

  // Prevent body scrolling and ensure modal stability
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    // Ensure no layout shift by setting explicit viewport height
    document.documentElement.style.setProperty('overflow', 'hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.style.removeProperty('overflow');
    };
  }, []);

  const options = [
    {
      optionName: "Manage Sales",
      action: "manageSales",
      icon: Users,
      description: "Whitelist addresses and manage sale phases"
    },
    {
      optionName: "Access Treasury",
      action: "accessTreasury", 
      icon: DollarSign,
      description: "Manage treasury funds and token transfers"
    }
  ];

  const handleOptionClick = (action) => {
    setShowOption(action);
  };

  const renderOption = () => {
    switch (showOption) {
      case 'manageSales':
        return (
          <ManageSales 
            tokenSymbol={tokenSymbol} 
            namespace={namespace} 
            moduleName={moduleName} 
            supplyChain={supplyChain}
          />
        );
      case 'accessTreasury':
        return (
          <AccessTreasury 
            tokenSymbol={tokenSymbol} 
            namespace={namespace} 
            moduleName={moduleName} 
            supplyChain={supplyChain}
          />
        );
      default:
        return null;
    }
  };

  const handleClosePanel = () => {
    setDeployerPanel(false);
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setDeployerPanel(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[1000] p-4 overscroll-none"
      onClick={handleBackdropClick}
    >
      <div className="bg-secondary-bg border border-border-color rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-border-color flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-accent-primary" />
              <h3 className="text-2xl font-bold text-primary-text">Deployer Panel</h3>
            </div>
            <div className="flex items-center gap-3">
              <TransactionStatusIndicator />
              <button
                onClick={handleClosePanel}
                className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
            <p className="text-sm text-secondary mb-2">
              {countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0
                ? 'Time remaining'
                : 'Sale ended'
              }
            </p>
            <div className="flex gap-2 text-lg font-mono">
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                {countdown.days}d
              </span>
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                {countdown.hours}h
              </span>
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                {countdown.minutes}m
              </span>
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                {countdown.seconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-accent-primary scrollbar-track-secondary-bg">
          {!showOption && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={index}
                    className="card p-6 hover:bg-hover-bg transition-colors text-left group"
                    onClick={() => handleOptionClick(option.action)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent className="w-8 h-8 text-accent-primary" />
                      <h4 className="text-lg font-semibold text-primary-text">
                        {option.optionName}
                      </h4>
                    </div>
                    <p className="text-secondary text-sm">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
          
          {showOption && (
            <div>
              <button
                onClick={() => setShowOption(null)}
                className="mb-4 text-accent-primary hover:text-accent-primary/80 transition-colors"
              >
                ← Back to options
              </button>
              {renderOption()}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

DeployerPanel.propTypes = {
  setDeployerPanel: PropTypes.func.isRequired,
  tokenSymbol: PropTypes.string.isRequired,
  countdown: PropTypes.shape({
    days: PropTypes.number.isRequired,
    hours: PropTypes.number.isRequired,
    minutes: PropTypes.number.isRequired,
    seconds: PropTypes.number.isRequired,
  }).isRequired,
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.string.isRequired,
};

export default DeployerPanel;

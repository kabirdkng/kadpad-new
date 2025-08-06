import { useState } from 'react';
import PropTypes from 'prop-types';
import { Settings, Users, DollarSign, X } from 'lucide-react';
import ManageSales from './ManageSales';
import AccessTreasury from './AccessTreasury';

const DeployerPanel = ({ setDeployerPanel, tokenSymbol, countdown, namespace, moduleName, supplyChain }) => {
  const [showOption, setShowOption] = useState(null);
  
  // Transaction status states
  const [reqKey, setReqKey] = useState('');
  const [transactionStatus, setTransactionStatus] = useState(''); // 'pending', 'success', 'error'
  const [transactionMessage, setTransactionMessage] = useState('');

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
    // Clear transaction status when switching options
    setReqKey('');
    setTransactionStatus('');
    setTransactionMessage('');
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
            reqKey={reqKey}
            setReqKey={setReqKey}
            transactionStatus={transactionStatus}
            setTransactionStatus={setTransactionStatus}
            transactionMessage={transactionMessage}
            setTransactionMessage={setTransactionMessage}
          />
        );
      case 'accessTreasury':
        return (
          <AccessTreasury 
            tokenSymbol={tokenSymbol} 
            namespace={namespace} 
            moduleName={moduleName} 
            supplyChain={supplyChain}
            reqKey={reqKey}
            setReqKey={setReqKey}
            transactionStatus={transactionStatus}
            setTransactionStatus={setTransactionStatus}
            transactionMessage={transactionMessage}
            setTransactionMessage={setTransactionMessage}
          />
        );
      default:
        return null;
    }
  };

  const handleClosePanel = () => {
    setDeployerPanel(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-bg border border-border-color rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-color">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-accent-primary" />
              <h3 className="text-2xl font-bold text-primary-text">Deployer Panel</h3>
            </div>
            <button
              onClick={handleClosePanel}
              className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>
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

        <div className="p-6">
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
              
              {/* Transaction Status */}
              {(reqKey || transactionStatus) && (
                <div className="mt-6 card">
                  <h3 className="text-lg font-semibold text-primary-text mb-4">Transaction Status</h3>
                  <div className={`p-4 rounded-lg border ${
                    transactionStatus === 'success' ? 'bg-green-500/10 border-green-500/20' :
                    transactionStatus === 'error' ? 'bg-red-500/10 border-red-500/20' :
                    transactionStatus === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-blue-500/10 border-blue-500/20'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        transactionStatus === 'success' ? 'bg-green-500/20' :
                        transactionStatus === 'error' ? 'bg-red-500/20' :
                        transactionStatus === 'pending' ? 'bg-yellow-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {transactionStatus === 'success' ? (
                          <span className="text-green-400 text-sm">✓</span>
                        ) : transactionStatus === 'error' ? (
                          <span className="text-red-400 text-sm">✗</span>
                        ) : transactionStatus === 'pending' ? (
                          <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="text-blue-400 text-sm">•</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium mb-1 ${
                          transactionStatus === 'success' ? 'text-green-400' :
                          transactionStatus === 'error' ? 'text-red-400' :
                          transactionStatus === 'pending' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {transactionStatus === 'success' ? 'Transaction Successful!' :
                           transactionStatus === 'error' ? 'Transaction Failed' :
                           transactionStatus === 'pending' ? 'Transaction Pending' :
                           'Transaction Submitted'}
                        </p>
                        {transactionMessage && (
                          <p className="text-xs text-secondary mb-2">{transactionMessage}</p>
                        )}
                        {reqKey && (
                          <a
                            href={`https://explorer.chainweb.com/testnet/tx/${reqKey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 break-all underline"
                          >
                            View on Explorer →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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

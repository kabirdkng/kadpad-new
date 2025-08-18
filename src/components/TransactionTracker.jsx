import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X, Clock, CheckCircle, XCircle, RefreshCw, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';
import useTransactionStore from '../store/useTransactionStore';
import transactionPollingService from '../services/transactionPollingService';

const TransactionTracker = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [showDetails, setShowDetails] = useState({});
  
  const {
    getAllTransactions,
    getActiveTransactions,
    getTransactionsByStatus,
    removeTransaction,
    clearOldTransactions,
    clearAllTransactions,
    getTransactionStats,
  } = useTransactionStore();

  const stats = getTransactionStats();
  const allTransactions = getAllTransactions();
  const activeTransactions = getActiveTransactions();
  const successTransactions = getTransactionsByStatus('success');
  const errorTransactions = getTransactionsByStatus('error');

  useEffect(() => {
    // Clean up old transactions on mount
    clearOldTransactions();
  }, [clearOldTransactions]);

  const handleStopPolling = (txId) => {
    transactionPollingService.stopPolling(txId);
  };

  const handleRemoveTransaction = (txId) => {
    removeTransaction(txId);
  };

  const handleToggleDetails = (txId) => {
    setShowDetails(prev => ({
      ...prev,
      [txId]: !prev[txId]
    }));
  };

  const formatDuration = (startTime, endTime = Date.now()) => {
    const duration = endTime - startTime;
    const seconds = Math.floor(duration / 1000) % 60;
    const minutes = Math.floor(duration / (1000 * 60)) % 60;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getStatusIcon = (status, isPolling = false) => {
    switch (status) {
      case 'pending':
        return isPolling ? (
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        ) : (
          <Clock className="w-4 h-4 text-yellow-500" />
        );
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    }
  };

  const TransactionCard = ({ transaction }) => {
    const isPolling = transactionPollingService.isPolling(transaction.id);
    const isDetailsOpen = showDetails[transaction.id];

    return (
      <div className="bg-secondary-bg border border-border-color rounded-lg p-3 md:p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(transaction.status, isPolling)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-medium text-primary-text text-sm md:text-base">
                  {transaction.type || 'Transaction'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(transaction.status)} self-start`}>
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs md:text-sm text-secondary break-all font-mono mt-1">
                {transaction.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {transaction.explorerUrl && (
              <a
                href={transaction.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-hover-bg rounded text-accent-primary hover:text-accent-primary/80"
                title="View on Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            
            <button
              onClick={() => handleToggleDetails(transaction.id)}
              className="p-1 hover:bg-hover-bg rounded"
              title="Toggle details"
            >
              {isDetailsOpen ? (
                <EyeOff className="w-4 h-4 text-secondary" />
              ) : (
                <Eye className="w-4 h-4 text-secondary" />
              )}
            </button>
            
            {transaction.status === 'pending' && isPolling && (
              <button
                onClick={() => handleStopPolling(transaction.id)}
                className="p-1 hover:bg-hover-bg rounded text-red-400 hover:text-red-300"
                title="Stop polling"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {(transaction.status === 'success' || transaction.status === 'error') && (
              <button
                onClick={() => handleRemoveTransaction(transaction.id)}
                className="p-1 hover:bg-hover-bg rounded text-red-400 hover:text-red-300"
                title="Remove transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Message - Only show if not too long */}
        {transaction.message && transaction.message.length < 100 && (
          <p className="text-xs md:text-sm text-secondary break-words">
            {transaction.message}
          </p>
        )}

        {/* Timestamps - Mobile friendly */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-secondary">
          <span className="break-words">
            {new Date(transaction.createdAt).toLocaleTimeString()}
          </span>
          <span>
            {formatDuration(transaction.createdAt, transaction.updatedAt)}
          </span>
        </div>

        {/* Details Section - Minimal for mobile */}
        {isDetailsOpen && (
          <div className="border-t border-border-color pt-3 space-y-2">
            {/* Explorer Link - Make it prominent */}
            {transaction.explorerUrl && (
              <div className="mb-3">
                <a
                  href={transaction.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-accent-primary/10 border border-accent-primary/20 rounded-lg text-accent-primary hover:bg-accent-primary/20 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </a>
              </div>
            )}
            
            {transaction.message && transaction.message.length >= 100 && (
              <div>
                <span className="text-xs font-medium text-secondary">Message:</span>
                <p className="text-xs text-primary-text mt-1 break-words">{transaction.message}</p>
              </div>
            )}
            
            {transaction.amount && (
              <div>
                <span className="text-xs font-medium text-secondary">Amount:</span>
                <p className="text-xs text-primary-text break-words">{transaction.amount}</p>
              </div>
            )}
            
            {transaction.lastError && (
              <div>
                <span className="text-xs font-medium text-red-400">Error:</span>
                <p className="text-xs text-red-300 mt-1 break-words">{transaction.lastError}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  TransactionCard.propTypes = {
    transaction: PropTypes.shape({
      id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      type: PropTypes.string,
      message: PropTypes.string,
      pollAttempt: PropTypes.number,
      maxRetries: PropTypes.number,
      createdAt: PropTypes.number.isRequired,
      updatedAt: PropTypes.number,
      description: PropTypes.string,
      amount: PropTypes.string,
      lastError: PropTypes.string,
      result: PropTypes.any,
      explorerUrl: PropTypes.string,
    }).isRequired,
  };

  const TabButton = ({ id, label, count, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-accent-primary text-white'
          : 'bg-secondary-bg text-secondary hover:bg-hover-bg'
      }`}
    >
      {label} {count > 0 && <span className="ml-1">({count})</span>}
    </button>
  );

  TabButton.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    isActive: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  if (!isOpen) return null;

  const getTransactionsForTab = () => {
    switch (activeTab) {
      case 'active':
        return activeTransactions;
      case 'success':
        return successTransactions;
      case 'error':
        return errorTransactions;
      case 'all':
      default:
        return allTransactions;
    }
  };

  const transactions = getTransactionsForTab();

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[1000] p-2 md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-primary-bg border border-border-color rounded-xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border-color flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-primary-text">Transactions</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="mt-3 md:mt-4 grid grid-cols-4 gap-2 md:gap-4">
            <div className="bg-secondary-bg border border-border-color rounded-lg p-2 md:p-3">
              <div className="text-sm md:text-lg font-bold text-primary-text">{stats.total}</div>
              <div className="text-xs md:text-sm text-secondary">Total</div>
            </div>
            <div className="bg-secondary-bg border border-border-color rounded-lg p-2 md:p-3">
              <div className="text-sm md:text-lg font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-xs md:text-sm text-secondary">Pending</div>
            </div>
            <div className="bg-secondary-bg border border-border-color rounded-lg p-2 md:p-3">
              <div className="text-sm md:text-lg font-bold text-green-400">{stats.success}</div>
              <div className="text-xs md:text-sm text-secondary">Success</div>
            </div>
            <div className="bg-secondary-bg border border-border-color rounded-lg p-2 md:p-3">
              <div className="text-sm md:text-lg font-bold text-red-400">{stats.error}</div>
              <div className="text-xs md:text-sm text-secondary">Error</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-3 md:p-4 border-b border-border-color flex-shrink-0">
          <div className="flex gap-1 md:gap-2 flex-wrap">
            <TabButton
              id="active"
              label="Active"
              count={stats.active}
              isActive={activeTab === 'active'}
              onClick={setActiveTab}
            />
            <TabButton
              id="all"
              label="All"
              count={stats.total}
              isActive={activeTab === 'all'}
              onClick={setActiveTab}
            />
            <TabButton
              id="success"
              label="Success"
              count={stats.success}
              isActive={activeTab === 'success'}
              onClick={setActiveTab}
            />
            <TabButton
              id="error"
              label="Error"
              count={stats.error}
              isActive={activeTab === 'error'}
              onClick={setActiveTab}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={clearOldTransactions}
              className="px-3 py-1 text-xs bg-secondary-bg border border-border-color rounded hover:bg-hover-bg transition-colors"
            >
              Clear Old
            </button>
            <button
              onClick={clearAllTransactions}
              className="px-3 py-1 text-xs bg-red-600/20 border border-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 overflow-y-auto flex-grow">
          {transactions.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Clock className="w-8 h-8 md:w-12 md:h-12 text-secondary mx-auto mb-4" />
              <p className="text-secondary text-sm md:text-base">
                {activeTab === 'active' ? 'No active transactions' : `No ${activeTab} transactions`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

TransactionTracker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TransactionTracker;

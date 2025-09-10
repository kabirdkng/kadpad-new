import React from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import useTransactionStore from '../../store/useTransactionStore';

const StakingTransactionStatus = () => {
  const { getTransactionsByType } = useTransactionStore();
  
  // Get recent staking transactions
  const stakingTransactions = getTransactionsByType('stake-tokens').slice(0, 3);
  const unstakingTransactions = getTransactionsByType('unstake-tokens').slice(0, 3);
  
  const allStakingTxs = [...stakingTransactions, ...unstakingTransactions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  if (allStakingTxs.length === 0) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'border-blue-500/20 bg-blue-500/10 text-blue-400';
      case 'success':
        return 'border-green-500/20 bg-green-500/10 text-green-400';
      case 'error':
        return 'border-red-500/20 bg-red-500/10 text-red-400';
      default:
        return 'border-gray-500/20 bg-gray-500/10 text-gray-400';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="border border-border-color rounded-lg p-4 bg-secondary-bg/30">
      <h3 className="text-sm font-medium text-primary-text mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Transactions
      </h3>
      
      <div className="space-y-2">
        {allStakingTxs.map((tx) => (
          <div
            key={tx.id}
            className={`flex items-center gap-3 p-2 rounded-lg border ${getStatusColor(tx.status)}`}
          >
            <div className="flex-shrink-0">
              {getStatusIcon(tx.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-primary-text truncate">
                {tx.description || tx.type}
              </div>
              <div className="text-xs text-secondary">
                {formatTime(tx.createdAt)}
              </div>
            </div>
            
            {tx.explorerUrl && (
              <a
                href={tx.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-1 hover:bg-hover-bg rounded transition-colors"
                title="View on Explorer"
              >
                <ExternalLink className="w-3 h-3 text-secondary hover:text-primary-text" />
              </a>
            )}
          </div>
        ))}
      </div>
      
      {allStakingTxs.some(tx => tx.status === 'pending') && (
        <div className="mt-3 text-xs text-secondary text-center">
          Transactions are being processed...
        </div>
      )}
    </div>
  );
};

export default StakingTransactionStatus;

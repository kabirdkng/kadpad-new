import { useState } from 'react';
import PropTypes from 'prop-types';
import { Clock, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import useTransactionStore from '../store/useTransactionStore';
import TransactionTracker from './TransactionTracker';

const TransactionStatusIndicator = ({ className = '' }) => {
  const [showTracker, setShowTracker] = useState(false);
  const { getTransactionStats } = useTransactionStore();
  
  const stats = getTransactionStats();
  const hasActiveTransactions = stats.active > 0;

  if (!hasActiveTransactions && stats.total === 0) {
    return null;
  }

  const getIndicatorIcon = () => {
    if (stats.active > 0) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
    }
    if (stats.error > 0) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    if (stats.success > 0) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getIndicatorText = () => {
    if (stats.active > 0) {
      return `${stats.active} active`;
    }
    if (stats.error > 0 && stats.success > 0) {
      return `${stats.success}/${stats.error}`;
    }
    if (stats.error > 0) {
      return `${stats.error} failed`;
    }
    if (stats.success > 0) {
      return `${stats.success} completed`;
    }
    return 'No transactions';
  };

  const getIndicatorColor = () => {
    if (stats.active > 0) {
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20';
    }
    if (stats.error > 0) {
      return 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20';
    }
    if (stats.success > 0) {
      return 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20';
    }
    return 'bg-gray-500/10 border-gray-500/20 text-gray-400 hover:bg-gray-500/20';
  };

  return (
    <>
      <button
        onClick={() => setShowTracker(true)}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium 
          transition-all duration-200 ${getIndicatorColor()} ${className}
        `}
        title="View transaction history"
      >
        {getIndicatorIcon()}
        <span>{getIndicatorText()}</span>
        <Eye className="w-3 h-3 opacity-60" />
      </button>

      <TransactionTracker 
        isOpen={showTracker} 
        onClose={() => setShowTracker(false)} 
      />
    </>
  );
};

TransactionStatusIndicator.propTypes = {
  className: PropTypes.string,
};

export default TransactionStatusIndicator;

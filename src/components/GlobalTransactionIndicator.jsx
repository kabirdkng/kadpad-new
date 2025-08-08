import { useState } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, Eye, X } from 'lucide-react';
import useTransactionStore from '../store/useTransactionStore';
import TransactionTracker from './TransactionTracker';

const GlobalTransactionIndicator = () => {
  const [showTracker, setShowTracker] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { getTransactionStats } = useTransactionStore();
  
  const stats = getTransactionStats();
  const hasAnyTransactions = stats.total > 0;

  // Don't render if no transactions or if closed
  if (!hasAnyTransactions || !isVisible) {
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

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    <>
      {/* Fixed position indicator in bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <div
          className={`
            relative flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium 
            transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-sm
            ${getIndicatorColor()}
          `}
        >
          {/* Main clickable area */}
          <div 
            className="flex items-center gap-2"
            onClick={() => setShowTracker(true)}
            title="View transaction history"
          >
            {getIndicatorIcon()}
            <span className="font-medium">{getIndicatorText()}</span>
            <Eye className="w-3 h-3 opacity-60" />
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Close indicator"
          >
            <X className="w-3 h-3 opacity-60 hover:opacity-80" />
          </button>
        </div>
      </div>

      {/* Transaction Tracker Modal */}
      <TransactionTracker 
        isOpen={showTracker} 
        onClose={() => setShowTracker(false)} 
      />
    </>
  );
};

export default GlobalTransactionIndicator;

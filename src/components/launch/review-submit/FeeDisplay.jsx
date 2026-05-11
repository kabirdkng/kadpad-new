import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useKDAPrice } from '../../../hooks/useKDAPrice';
import { convertUSDToKDA, formatKDAAmount } from '../../../utils/priceUtils';

/**
 * Component to display fees in both USD and KDA
 * @param {Object} props
 * @param {number} props.usdAmount - Fee amount in USD
 * @param {string} props.className - Additional CSS classes
 */
const FeeDisplay = ({ usdAmount, className = '' }) => {
  const { kdaPrice, loading, error } = useKDAPrice();
  const [copied, setCopied] = useState(false);

  const handleCopyKDA = async (kdaAmount) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formatKDAAmount(kdaAmount));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = formatKDAAmount(kdaAmount);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy KDA amount:', err);
      // You could add a toast notification here if available
    }
  };

  const renderKDAAmount = () => {
    if (loading) {
      return (
        <div className="mt-1">
          <div className="bg-secondary-bg border border-gray-600 rounded-md p-2 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-3 bg-gray-700 rounded w-16 mb-1"></div>
                <div className="h-2 bg-gray-700 rounded w-20"></div>
              </div>
              <div className="w-6 h-6 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-1">
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2">
            <div className="text-xs text-red-400">
              Unable to fetch KDA price
            </div>
          </div>
        </div>
      );
    }

    if (kdaPrice) {
      try {
        const kdaAmount = convertUSDToKDA(usdAmount, kdaPrice);
        return (
          <div className="mt-1 space-y-1">
            <div className="bg-secondary-bg border border-gray-600 rounded-md p-2 flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-medium text-primary-text">
                  {formatKDAAmount(kdaAmount)} KDA
                </div>
                <div className="text-xs text-secondary">
                  1 KDA = ${kdaPrice.toFixed(4)}
                </div>
              </div>
              <button
                onClick={() => handleCopyKDA(kdaAmount)}
                className="ml-2 p-1 rounded-md hover:bg-gray-700 transition-colors duration-200 text-secondary hover:text-primary-text"
                title={copied ? "Copied!" : "Copy KDA amount"}
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        );
      } catch (err) {
        return (
          <div className="text-xs text-red-400">
            Error calculating KDA amount
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className={`fee-display ${className}`}>
      <div className="font-medium text-primary-text">
        ${usdAmount.toFixed(2)} USD
      </div>
      {copied && (
        <div className="text-xs text-green-400 mb-1">
          ✓ Copied to clipboard
        </div>
      )}
      {renderKDAAmount()}
    </div>
  );
};

export default FeeDisplay;

import React, { useState } from 'react';
import { Coins, Info, ArrowUp, AlertTriangle } from 'lucide-react';
import { useStakingPactCalls } from '../../hooks/useStakingPactCalls';

const StakingForm = () => {
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { 
    isConnected, 
    userBalance, 
    isLoading,
    stakeTokens, 
    getTierByAmount,
    extractNumericValue 
  } = useStakingPactCalls();

  const numericAmount = parseFloat(amount) || 0;
  const tierData = getTierByAmount(numericAmount);
  const tier = tierData.tier;

  const tierInfo = {
    0: { name: 'No Tier', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
    1: { name: 'Tier 1', color: 'text-bronze', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    2: { name: 'Tier 2', color: 'text-silver', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
    3: { name: 'Tier 3', color: 'text-gold', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
  };

  const handleMaxClick = () => {
    setAmount(extractNumericValue(userBalance)?.toString() || '0');
  };

  const handleStake = async () => {
    if (!amount || numericAmount <= 0) return;
    
    setShowConfirm(false);
    await stakeTokens(numericAmount);
    setAmount('');
  };

  const isValidAmount = numericAmount > 0 && numericAmount <= extractNumericValue(userBalance || 0);

  if (!isConnected) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Stake KPAD</h3>
        <div className="text-center py-6">
          <div className="text-secondary">Please connect your wallet to stake tokens</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Coins className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-primary-text">Stake KPAD</h3>
      </div>

      {/* Balance Display */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-sm text-secondary mb-1">Available Balance</div>
        <div className="text-lg font-semibold text-primary-text">
          {extractNumericValue(userBalance)?.toLocaleString() || '0'} KPAD
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary mb-2">
          Amount to Stake
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800/50 border border-border-color rounded-lg px-4 py-3 text-primary-text placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-accent transition-all"
            placeholder="Enter amount"
            min="0"
            step="1"
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            <span className="text-secondary text-sm">KPAD</span>
            <button
              onClick={handleMaxClick}
              className="text-accent hover:text-accent/80 text-sm font-medium transition-colors"
            >
              Max
            </button>
          </div>
        </div>
      </div>

      {/* Tier Preview */}
      {numericAmount > 0 && (
        <div className={`mb-4 p-3 rounded-lg border ${tierInfo[tier].bg} ${tierInfo[tier].border}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary">Your Tier:</span>
            <span className={`font-medium ${tierInfo[tier].color}`}>
              {tierInfo[tier].name}
            </span>
          </div>
          {tier >= 3 && (
            <div className="text-xs text-yellow-400 mt-1">
              🎉 Qualifies for whitelist access!
            </div>
          )}
        </div>
      )}

      {/* Warning for amount validation */}
      {amount && !isValidAmount && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">
            {numericAmount > extractNumericValue(userBalance || 0) 
              ? 'Insufficient balance' 
              : 'Please enter a valid amount'
            }
          </span>
        </div>
      )}

      {/* Stake Button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={!isValidAmount || isLoading}
        className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
          isValidAmount && !isLoading
            ? 'btn-primary'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Staking...</span>
          </>
        ) : (
          <>
            <ArrowUp className="w-4 h-4" />
            <span>Stake KPAD</span>
          </>
        )}
      </button>

      {/* Important Note */}
      <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <div className="text-sm text-orange-400">
          <strong>Note:</strong> Tokens are locked for 365 days. Early unstaking incurs penalties.
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full border border-border-color">
            <h4 className="text-lg font-semibold text-primary-text mb-4">Confirm Staking</h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-secondary">Amount:</span>
                <span className="text-primary-text font-medium">{numericAmount.toLocaleString()} KPAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Tier:</span>
                <span className={`font-medium ${tierInfo[tier].color}`}>{tierInfo[tier].name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Lock Period:</span>
                <span className="text-primary-text font-medium">365 days</span>
              </div>
            </div>

            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6">
              <div className="text-sm text-orange-400">
                By confirming, you understand that your tokens will be locked for 365 days and early unstaking will incur penalties.
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 px-4 border border-border-color rounded-lg text-secondary hover:text-primary-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStake}
                disabled={isLoading}
                className="flex-1 py-2 px-4 btn-primary rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Staking...' : 'Confirm Stake'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakingForm;

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ArrowDown, TrendingDown } from 'lucide-react';
import { useStakingPactCalls } from '../../hooks/useStakingPactCalls';
import { useStakingDataContext } from '../../contexts/StakingDataContext';

const UnstakingForm = () => {
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPenalty, setCurrentPenalty] = useState(null);
  const [penaltyLoading, setPenaltyLoading] = useState(false);
  
  const { 
    isConnected, 
    userStakes, 
    isLoading,
    unstakeTokens,
    extractNumericValue,
    calculatePenalty,
    calculatePenaltyFallback 
  } = useStakingPactCalls();

  const { refreshAfterTransaction } = useStakingDataContext();

  const stake = userStakes?.[0]; // Assuming single stake
  const numericAmount = parseFloat(amount) || 0;
  const maxUnstakeAmount = extractNumericValue(stake?.amount) || 0;
  
  // Calculate current penalty when stake data is available
  useEffect(() => {
    const getCurrentPenalty = async () => {
      if (stake && stake.lockDate && maxUnstakeAmount > 0) {
        setPenaltyLoading(true);
        try {
          let penaltyInfo = await calculatePenalty(maxUnstakeAmount, stake.lockDate);
          
          if (!penaltyInfo) {
            penaltyInfo = calculatePenaltyFallback(maxUnstakeAmount, stake.lockDate);
          }
          
          setCurrentPenalty(penaltyInfo);
        } catch (error) {
          console.error('Error calculating current penalty:', error);
          const fallbackPenalty = calculatePenaltyFallback(maxUnstakeAmount, stake.lockDate);
          setCurrentPenalty(fallbackPenalty);
        } finally {
          setPenaltyLoading(false);
        }
      }
    };

    getCurrentPenalty();
  }, [stake, maxUnstakeAmount, calculatePenalty, calculatePenaltyFallback]);
  
  const isMatured = extractNumericValue(currentPenalty?.['is-mature'] || stake?.['is-mature'] || stake?.isMature) === 1 || false;
  const penaltyPercent = penaltyLoading ? 'Calculating...' : currentPenalty ? (extractNumericValue(currentPenalty?.['penalty-percent']) * 100).toFixed(2) : '0.00';
  const actualPenaltyPercent = currentPenalty ? extractNumericValue(currentPenalty?.['penalty-percent']) : 0;

  const handleMaxClick = () => {
    setAmount(maxUnstakeAmount.toString());
  };

  const handleUnstake = async () => {
    if (!amount || numericAmount <= 0) return;
    
    setShowConfirm(false);
    const result = await unstakeTokens(numericAmount);
    
    if (result) {
      setAmount('');
      // Trigger immediate data refresh with transaction monitoring
      refreshAfterTransaction();
    }
  };

  const isValidAmount = numericAmount > 0 && numericAmount <= maxUnstakeAmount;

  if (!isConnected) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Unstake KPAD</h3>
        <div className="text-center py-6">
          <div className="text-secondary">Please connect your wallet to unstake tokens</div>
        </div>
      </div>
    );
  }

  if (!stake || maxUnstakeAmount === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-primary-text">Unstake KPAD</h3>
        </div>
        <div className="text-center py-6">
          <div className="text-secondary">No staked tokens available to unstake</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingDown className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-primary-text">Unstake KPAD</h3>
      </div>

      {/* Staked Amount Display */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-sm text-secondary mb-1">Total Staked</div>
        <div className="text-lg font-semibold text-primary-text">
          {maxUnstakeAmount.toLocaleString()} KPAD
        </div>
      </div>

      {/* Maturity Status */}
      <div className={`mb-4 p-3 rounded-lg border ${
        isMatured 
          ? 'bg-green-500/10 border-green-500/20' 
          : 'bg-orange-500/10 border-orange-500/20'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isMatured ? 'Matured - Ready to Unstake' : 'Early Unstaking'}
          </span>
        </div>
        <div className="text-sm">
          {isMatured ? (
            <span className="text-green-400">No penalty will be applied</span>
          ) : (
            <span className="text-orange-400">
              Current penalty: {penaltyPercent}% (decreases daily)
            </span>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary mb-2">
          Amount to Unstake
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800/50 border border-border-color rounded-lg px-4 py-3 text-primary-text placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all"
            placeholder="Enter amount"
            min="0"
            step="1"
            max={maxUnstakeAmount}
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            <span className="text-secondary text-sm">KPAD</span>
            <button
              onClick={handleMaxClick}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              Max
            </button>
          </div>
        </div>
      </div>

      {/* Penalty Calculation */}
      {numericAmount > 0 && !isMatured && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-secondary">Amount to unstake:</span>
              <span className="text-primary-text">{numericAmount.toLocaleString()} KPAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Penalty ({penaltyPercent}%):</span>
              <span className="text-orange-400">-{(numericAmount * actualPenaltyPercent).toLocaleString()} KPAD</span>
            </div>
            <div className="flex justify-between border-t border-orange-500/20 pt-2">
              <span className="text-secondary font-medium">You will receive:</span>
              <span className="text-primary-text font-medium">
                {(numericAmount * (1 - actualPenaltyPercent)).toLocaleString()} KPAD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mature Unstaking Preview */}
      {numericAmount > 0 && isMatured && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-secondary">Amount to unstake:</span>
              <span className="text-primary-text">{numericAmount.toLocaleString()} KPAD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Penalty:</span>
              <span className="text-green-400">None</span>
            </div>
            <div className="flex justify-between border-t border-green-500/20 pt-2">
              <span className="text-secondary font-medium">You will receive:</span>
              <span className="text-primary-text font-medium">{numericAmount.toLocaleString()} KPAD</span>
            </div>
          </div>
        </div>
      )}

      {/* Warning for amount validation */}
      {amount && !isValidAmount && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400">
            {numericAmount > maxUnstakeAmount 
              ? 'Amount exceeds staked balance' 
              : 'Please enter a valid amount'
            }
          </span>
        </div>
      )}

      {/* Unstake Button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={!isValidAmount || isLoading}
        className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
          isValidAmount && !isLoading
            ? isMatured 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Unstaking...</span>
          </>
        ) : (
          <>
            <ArrowDown className="w-4 h-4" />
            <span>{isMatured ? 'Unstake KPAD' : 'Unstake Early (with penalty)'}</span>
          </>
        )}
      </button>

      {/* Important Note */}
      {!isMatured && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="text-sm text-orange-400">
            <strong>Warning:</strong> Early unstaking results in {penaltyPercent}% penalty.
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full border border-border-color">
            <h4 className="text-lg font-semibold text-primary-text mb-4">Confirm Unstaking</h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-secondary">Amount to unstake:</span>
                <span className="text-primary-text font-medium">{numericAmount.toLocaleString()} KPAD</span>
              </div>
              {!isMatured && (
                <>
                  <div className="flex justify-between">
                    <span className="text-secondary">Penalty:</span>
                    <span className="text-orange-400 font-medium">{penaltyPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Penalty amount:</span>
                    <span className="text-red-400 font-medium">
                      -{(numericAmount * actualPenaltyPercent).toLocaleString()} KPAD
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-border-color pt-2">
                <span className="text-secondary font-medium">You will receive:</span>
                <span className="text-green-400 font-medium">
                  {isMatured 
                    ? numericAmount.toLocaleString()
                    : (numericAmount * (1 - actualPenaltyPercent)).toLocaleString()
                  } KPAD
                </span>
              </div>
            </div>

            {!isMatured && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6">
                <div className="text-sm text-orange-400">
                  You are about to unstake early and will lose {penaltyPercent}% of your tokens as penalty. This action cannot be undone.
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 px-4 border border-border-color rounded-lg text-secondary hover:text-primary-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnstake}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  isMatured 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isLoading ? 'Unstaking...' : 'Confirm Unstake'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnstakingForm;

import React from 'react';
import { useStakingPactCalls } from '../../hooks/useStakingPactCalls';
import WalletConnectButton from '../WalletConnectButton';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';

const StakingDashboard = () => {
  const { 
    isConnected, 
    userStakes, 
    userBalance, 
    isLoading,
    extractNumericValue,
    extractDateValue,
    getTierByAmount 
  } = useStakingPactCalls();

  if (!isConnected) {
    return (
      <div className="bg-card rounded-lg p-8 text-center border border-border-color">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-primary-text">Connect Your Wallet</h3>
          <p className="text-secondary max-w-md">
            Connect your wallet to view your staking dashboard and start earning rewards.
          </p>
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-8 border border-border-color">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userStakes || userStakes.length === 0) {
    return (
      <div className="bg-card rounded-lg p-8 text-center border border-border-color">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold text-primary-text">No Stakes Found</h3>
          <p className="text-secondary max-w-md">
            You haven't staked in any tiers yet. Start staking to earn rewards and gain access to exclusive launches.
          </p>
          <div className="text-sm text-secondary">
            Your KPAD Balance: <span className="font-medium text-primary-text">{extractNumericValue(userBalance)?.toLocaleString() || '0'} KPAD</span>
          </div>
        </div>
      </div>
    );
  }

  const stake = userStakes[0];
  
  const isMatured = extractNumericValue(stake?.['is-mature'] || stake?.isMature) === 1 || false;
  const penaltyPercent = (extractNumericValue(stake?.['penalty-percent'] || stake?.penaltyPercent) * 100).toFixed(2);
  const daysStaked = extractNumericValue(stake?.['days-staked'] || stake?.daysStaked) || 0;
  
  const lockDate = stake?.lockDate || extractDateValue(stake?.['lock-date']);
  const unlockDate = stake?.unlockDate || extractDateValue(stake?.['unlock-date']);
  
  const now = new Date();
  const timeUntilUnlock = unlockDate ? unlockDate.getTime() - now.getTime() : 0;
  const daysUntilUnlock = Math.max(0, Math.ceil(timeUntilUnlock / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="bg-card rounded-lg p-3 lg:p-4 border border-border-color">
        <h3 className="text-base font-semibold text-primary-text mb-3 lg:block hidden">Dashboard</h3>
        
        <div className="grid grid-cols-1 gap-2 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-secondary mb-1">Amount Staked</div>
            <div className="text-base font-bold text-primary-text">
              {extractNumericValue(stake?.amount)?.toLocaleString() || '0'} KPAD
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-secondary mb-1">Days Staked</div>
                <div className="text-base font-bold text-primary-text">
                  {daysStaked} days
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-secondary mb-1">Current Tier</div>
                <div className={`text-base font-bold ${
                  getTierByAmount(extractNumericValue(stake?.amount) || 0).tier === 3 
                    ? 'text-yellow-400' 
                    : getTierByAmount(extractNumericValue(stake?.amount) || 0).tier === 2
                    ? 'text-blue-400'
                    : 'text-green-400'
                }`}>
                  Tier {getTierByAmount(extractNumericValue(stake?.amount) || 0).tier}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <h4 className="text-sm lg:text-base font-semibold text-primary-text">Status</h4>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isMatured 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }`}>
              {isMatured ? 'Matured' : 'Locked'}
            </div>
          </div>

          <div className="space-y-2 lg:space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-secondary mb-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Lock Period</span>
              </div>
              <div className="text-xs lg:text-sm text-primary-text">
                {isMatured ? (
                  <span className="text-green-400 font-medium">Ready to unstake</span>
                ) : (
                  <span>{daysUntilUnlock} days remaining</span>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 text-secondary mb-1">
                <AlertCircle className="w-3 h-3" />
                <span className="text-xs">Early Unstake Penalty</span>
              </div>
              <div className="text-xs lg:text-sm text-primary-text">
                {isMatured ? (
                  <span className="text-green-400 font-medium">No penalty</span>
                ) : (
                  <span className="text-orange-400 font-medium">{penaltyPercent}%</span>
                )}
              </div>
            </div>
          </div>

          {!isMatured && (
            <div className="mt-2 lg:mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-xs text-orange-400">
                <strong>Note:</strong> Early unstaking incurs a {penaltyPercent}% penalty. Penalty decreases daily.
              </div>
            </div>
          )}

          {isMatured && (
            <div className="mt-2 lg:mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-xs text-green-400">
                <strong>Congratulations!</strong> Your stake has matured. You can now unstake without any penalty.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg p-3 lg:p-4 border border-border-color">
        <h4 className="text-sm lg:text-base font-semibold text-primary-text mb-2 lg:mb-3">Important Dates</h4>
        <div className="space-y-1 lg:space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-border-color">
            <span className="text-secondary text-xs lg:text-sm">Stake Date</span>
            <span className="text-primary-text font-medium text-xs lg:text-sm">
              {lockDate ? lockDate.toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-secondary text-xs lg:text-sm">Unlock Date</span>
            <span className="text-primary-text font-medium text-xs lg:text-sm">
              {unlockDate ? unlockDate.toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboard;

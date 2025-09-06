import React from 'react';
import { useStakingPactCalls } from '../../hooks/useStakingPactCalls';
import WalletConnectButton from '../WalletConnectButton';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';

const StakingDashboard = () => {
  const { 
    isConnected, 
    userStakes, 
    userBalance, 
    isLoading 
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
            Your KPAD Balance: <span className="font-medium text-primary-text">{userBalance?.toLocaleString() || '0'} KPAD</span>
          </div>
        </div>
      </div>
    );
  }

  const stake = userStakes[0];
  const isMatured = stake?.is_mature || false;
  const penaltyPercent = ((stake?.penalty_percent || 0) * 100).toFixed(2);
  const daysStaked = stake?.days_staked || 0;
  const unlockDate = new Date(stake?.unlockDate || Date.now());
  const now = new Date();
  const timeUntilUnlock = unlockDate.getTime() - now.getTime();
  const daysUntilUnlock = Math.max(0, Math.ceil(timeUntilUnlock / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-6 border border-border-color">
        <h3 className="text-xl font-semibold text-primary-text mb-4">Your Staking Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-secondary mb-1">Total Staked</div>
            <div className="text-2xl font-bold text-primary-text">
              {stake?.amount?.toLocaleString() || '0'} KPAD
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-secondary mb-1">Available Balance</div>
            <div className="text-2xl font-bold text-primary-text">
              {userBalance?.toLocaleString() || '0'} KPAD
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-secondary mb-1">Days Staked</div>
            <div className="text-2xl font-bold text-primary-text">
              {daysStaked} days
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-primary-text">Staking Status</h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isMatured 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }`}>
              {isMatured ? 'Matured' : 'Locked'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-secondary mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Lock Period</span>
              </div>
              <div className="text-primary-text">
                {isMatured ? (
                  <span className="text-green-400 font-medium">Ready to unstake without penalty</span>
                ) : (
                  <span>{daysUntilUnlock} days remaining</span>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 text-secondary mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Early Unstake Penalty</span>
              </div>
              <div className="text-primary-text">
                {isMatured ? (
                  <span className="text-green-400 font-medium">No penalty</span>
                ) : (
                  <span className="text-orange-400 font-medium">{penaltyPercent}%</span>
                )}
              </div>
            </div>
          </div>

          {!isMatured && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="text-sm text-orange-400">
                <strong>Note:</strong> Unstaking before the lock period ends will result in a {penaltyPercent}% penalty. 
                The penalty decreases daily until maturity.
              </div>
            </div>
          )}

          {isMatured && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-sm text-green-400">
                <strong>Congratulations!</strong> Your stake has matured. You can now unstake without any penalty.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border-color">
        <h4 className="text-lg font-semibold text-primary-text mb-3">Important Dates</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border-color">
            <span className="text-secondary">Stake Date</span>
            <span className="text-primary-text font-medium">
              {stake?.lockDate ? new Date(stake.lockDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-secondary">Unlock Date</span>
            <span className="text-primary-text font-medium">
              {unlockDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboard;

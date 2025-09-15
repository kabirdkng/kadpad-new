import React from 'react';
import { TrendingUp, Wallet } from 'lucide-react';
import useWalletStore from '../../wallet/walletStore';
import useStakingStore from '../../store/useStakingStore';
import { extractNumericValue, getTierByAmount } from '../../utils/stakingUtils';

const BalanceOverview = () => {
  const { isConnected } = useWalletStore();
  
  // Get cached data from staking store
  const { userStakes, userBalance, isLoading } = useStakingStore();

  if (!isConnected) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Your KPAD Overview</h3>
        <div className="text-center py-6">
          <Wallet className="w-12 h-12 text-secondary mx-auto mb-3" />
          <p className="text-secondary">Connect your wallet to view your KPAD balance and staking information</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Your KPAD Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center animate-pulse">
            <div className="text-xs text-secondary mb-1">Available Balance</div>
            <div className="h-6 bg-gray-700 rounded w-16 mx-auto"></div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center animate-pulse">
            <div className="text-xs text-secondary mb-1">Total Staked</div>
            <div className="h-6 bg-gray-700 rounded w-16 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const availableBalance = extractNumericValue(userBalance) || 0;
  const totalStaked = userStakes && userStakes.length > 0 ? extractNumericValue(userStakes[0]?.amount) || 0 : 0;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-text mb-4">Your KPAD Overview</h3>
      
      {/* Main Balance Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Wallet className="w-4 h-4 text-accent" />
            <span className="text-xs text-secondary">Available Balance</span>
          </div>
          <div className="text-lg font-bold text-accent">
            {availableBalance.toLocaleString()} KPAD
          </div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-secondary">Total Staked</span>
          </div>
          <div className="text-lg font-bold text-green-400">
            {totalStaked.toLocaleString()} KPAD
          </div>
        </div>
      </div>

      {/* No Stake Message */}
      {totalStaked === 0 && availableBalance > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mt-4">
          <div className="text-xs text-orange-400 text-center">
            <strong>Ready to stake?</strong> You have {availableBalance.toLocaleString()} KPAD available for staking
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceOverview;

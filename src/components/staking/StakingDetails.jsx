import React from 'react';
import { Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const StakingDetails = ({ stake }) => {
  if (!stake) return null;

  const isMatured = stake.is_mature || false;
  const penaltyPercent = ((stake.penalty_percent || 0) * 100).toFixed(2);
  const daysStaked = stake.days_staked || 0;
  const unlockDate = new Date(stake.unlockDate);
  const lockDate = stake.lockDate ? new Date(stake.lockDate) : null;
  const now = new Date();
  const timeUntilUnlock = unlockDate.getTime() - now.getTime();
  const daysUntilUnlock = Math.max(0, Math.ceil(timeUntilUnlock / (1000 * 60 * 60 * 24)));

  // Determine tier
  const getTier = (amount) => {
    if (amount >= 350000) return { level: 3, name: 'Diamond', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
    if (amount >= 150000) return { level: 2, name: 'Gold', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (amount >= 50000) return { level: 1, name: 'Silver', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
    return { level: 0, name: 'Bronze', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
  };

  const tier = getTier(stake.amount);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${tier.bgColor} ${tier.color}`}>
            Tier {tier.level} - {tier.name}
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            isMatured 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            {isMatured ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Matured</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                <span>Locked</span>
              </>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {stake.amount?.toLocaleString()} KPAD
          </div>
          <div className="text-sm text-gray-400">Staked Amount</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-white">{daysStaked}</div>
          <div className="text-xs text-gray-400">Days Staked</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-white">
            {isMatured ? '0' : daysUntilUnlock}
          </div>
          <div className="text-xs text-gray-400">Days Until Unlock</div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-semibold ${isMatured ? 'text-green-400' : 'text-orange-400'}`}>
            {isMatured ? '0%' : `${penaltyPercent}%`}
          </div>
          <div className="text-xs text-gray-400">Current Penalty</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-white">15.5%</div>
          <div className="text-xs text-gray-400">APY</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Staking Timeline</h4>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-gray-300">Stake Date</span>
          </div>
          <span className="text-white font-medium">
            {lockDate ? lockDate.toLocaleDateString() : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isMatured ? 'bg-green-400' : 'bg-orange-400'}`}></div>
            <span className="text-gray-300">Unlock Date</span>
          </div>
          <span className="text-white font-medium">
            {unlockDate.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Progress to Maturity</span>
          <span>{Math.min(100, Math.round((daysStaked / 365) * 100))}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isMatured ? 'bg-green-400' : 'bg-gradient-to-r from-orange-400 to-yellow-400'
            }`}
            style={{ width: `${Math.min(100, (daysStaked / 365) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Status Message */}
      {!isMatured && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-400">
              <strong>Early Unstake Warning:</strong> Unstaking before maturity will result in a {penaltyPercent}% penalty. 
              The penalty decreases daily until your stake matures in {daysUntilUnlock} days.
            </div>
          </div>
        </div>
      )}

      {isMatured && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-400">
              <strong>Ready to Unstake:</strong> Your stake has matured! You can now unstake your tokens without any penalty.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakingDetails;

import React from 'react';
import { Trophy, Crown, Award, Medal } from 'lucide-react';
import { useStakingPactCalls } from '../../hooks/useStakingPactCalls';

const Leaderboard = () => {
  const { leaderboard, isLoading, extractNumericValue } = useStakingPactCalls();

  const getTierIcon = (tier) => {
    switch (tier) {
      case 3:
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 2:
        return <Award className="w-4 h-4 text-gray-400" />;
      case 1:
        return <Medal className="w-4 h-4 text-orange-400" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 3:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 2:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 1:
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-4 border border-border-color">
        <div className="flex items-center space-x-2 mb-3">
          <Trophy className="w-4 h-4 text-accent" />
          <h3 className="text-base font-semibold text-primary-text">Leaderboard</h3>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-2 p-2 bg-gray-800/30 rounded-lg">
              <div className="w-5 h-5 bg-gray-700 rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                <div className="h-2 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-border-color">
      <div className="flex items-center space-x-2 mb-3">
        <Trophy className="w-4 h-4 text-accent" />
        <h3 className="text-base font-semibold text-primary-text">Top Stakers</h3>
      </div>

      {!leaderboard || leaderboard.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-secondary text-sm">No data available</div>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.account}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                index < 3 
                  ? 'bg-accent/5 border border-accent/20' 
                  : 'bg-gray-800/30 hover:bg-gray-800/50'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-6 h-6 text-xs font-bold">
                {getRankDisplay(entry.rank)}
              </div>

              {/* Account & Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-primary-text font-medium font-mono text-xs">
                    {truncateAddress(entry.account)}
                  </span>
                  {getTierIcon(entry.tier)}
                </div>
                <div className="text-xs text-secondary">
                  {extractNumericValue(entry.amount).toLocaleString()} KPAD
                </div>
              </div>

              {/* Tier Badge */}
              <div className={`px-1 py-0.5 rounded text-xs font-medium border ${getTierColor(entry.tier)}`}>
                T{entry.tier}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tier Legend */}
      <div className="mt-6 pt-4 border-t border-border-color">
        <div className="text-sm text-secondary mb-2">Staking Tiers</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Medal className="w-3 h-3 text-orange-400" />
            <span className="text-secondary">50k+</span>
          </div>
          <div className="flex items-center space-x-1">
            <Award className="w-3 h-3 text-gray-400" />
            <span className="text-secondary">150k+</span>
          </div>
          <div className="flex items-center space-x-1">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span className="text-secondary">350k+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

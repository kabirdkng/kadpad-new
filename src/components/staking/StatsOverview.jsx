import React from 'react';
import { TrendingUp, Users, Target, Lock } from 'lucide-react';
import useStakingStore from '../../store/useStakingStore';
import { extractNumericValue } from '../../utils/stakingUtils';
import { formatCompact } from '../../utils/numberUtils';

const StatsOverview = () => {
  // Get cached data from staking store
  const { stakingStats, isPublicDataLoaded } = useStakingStore();

  const stats = [
    {
      id: 'totalStaked',
      label: 'Total Staked',
      value: formatCompact(extractNumericValue(stakingStats?.totalStaked)) || '0',
      suffix: 'KPAD',
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/20'
    },
    {
      id: 'totalStakers',
      label: 'Total Stakers',
      value: formatCompact(extractNumericValue(stakingStats?.totalStakers)) || '0',
      suffix: '',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 'lockPeriod',
      label: 'Lock Period',
      value: '365',
      suffix: 'Days',
      icon: Lock,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      id: 'tierThreshold',
      label: 'Max Tier Threshold',
      value: '350K',
      suffix: 'KPAD',
      icon: Target,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20'
    }
  ];

  if (!isPublicDataLoaded) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-card rounded-lg p-3 lg:p-4 border border-border-color">
            <div className="animate-pulse">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gray-700 rounded"></div>
                <div className="h-3 lg:h-4 bg-gray-700 rounded w-16 lg:w-20"></div>
              </div>
              <div className="h-5 lg:h-6 bg-gray-700 rounded w-12 lg:w-16 mb-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className={`bg-card rounded-lg p-3 lg:p-4 border ${stat.border} ${stat.bg}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${stat.color}`} />
              <span className="text-xs lg:text-sm text-secondary font-medium">{stat.label}</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className={`text-lg lg:text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="text-xs lg:text-sm text-secondary">{stat.suffix}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;

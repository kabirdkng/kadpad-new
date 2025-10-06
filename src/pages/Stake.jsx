import { useState, useEffect } from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { StakingDataProvider } from '../contexts/StakingDataContext';
import { StakerEmailProvider } from '../contexts/StakerEmailContext';
import useWalletStore from '../wallet/walletStore';
import useStakingStore from '../store/useStakingStore';

// Components
import StakingDashboard from '../components/staking/StakingDashboard';
import StakingForm from '../components/staking/StakingForm';
import UnstakingForm from '../components/staking/UnstakingForm';
import StatsOverview from '../components/staking/StatsOverview';
import Leaderboard from '../components/staking/Leaderboard';
import BalanceOverview from '../components/staking/MobileBalanceOverview';

// Skeleton Components
import StakingDashboardSkeleton from '../components/staking/skeletons/StakingDashboardSkeleton';
import StakingFormSkeleton from '../components/staking/skeletons/StakingFormSkeleton';
import LeaderboardSkeleton from '../components/staking/skeletons/LeaderboardSkeleton';
import StatsOverviewSkeleton from '../components/staking/skeletons/StatsOverviewSkeleton';
import BalanceOverviewSkeleton from '../components/staking/skeletons/BalanceOverviewSkeleton';

// Common Components
import SmoothTransition from '../components/common/SmoothTransition';

// Coming Soon Component
const ComingSoonMessage = () => {
  return (
    <div className="min-h-screen bg-primary-bg pt-24 pb-16 animate-fade-in">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center">
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-card border border-accent-primary/20 mb-6">
            <Clock className="w-4 h-4 mr-2 text-accent-primary" />
            <span className="text-sm font-medium text-accent-primary">
              Coming Soon
            </span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-primary-text mb-6">
            <span className="text-gradient">KPAD</span> Staking
          </h1>
          
          {/* Description */}
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
            Our staking platform is currently under development. Get ready to stake your KPAD tokens 
            and earn rewards while gaining access to exclusive launches.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card text-center p-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-primary-text mb-2">Earn Rewards</h3>
              <p className="text-sm text-secondary">
                Stake your KPAD tokens to earn whitelist spots and attractive rewards
              </p>
            </div>
            
            <div className="card text-center p-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-primary-text mb-2">Tier System</h3>
              <p className="text-sm text-secondary">
                Unlock different tiers with increasing benefits and exclusive access
              </p>
            </div>
            
            <div className="card text-center p-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🥇</span>
              </div>
              <h3 className="font-semibold text-primary-text mb-2">Whitelist Access</h3>
              <p className="text-sm text-secondary">
                Reach Tier 3 to gain guaranteed whitelist access to all KadPad launches
              </p>
            </div>
          </div>
          
          {/* What's Coming Section */}
          <div className="card p-8 mb-12">
            <h2 className="text-2xl font-bold text-primary-text mb-6">What&apos;s Coming</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium text-primary-text mb-3">Staking Tiers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">Tier 1 (50k+ KPAD):</span>
                    <span className="text-orange-400">Basic rewards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Tier 2 (150k+ KPAD):</span>
                    <span className="text-gray-400">Enhanced rewards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Tier 3 (350k+ KPAD):</span>
                    <span className="text-yellow-400">Premium + Whitelist</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-primary-text mb-3">Key Features</h4>
                <ul className="space-y-2 text-sm text-secondary">
                  <li>• 365-day lock period</li>
                  <li>• Daily penalty reduction</li>
                  <li>• Tier-based rewards</li>
                  <li>• Whitelist access (Tier 3)</li>
                  <li>• No fees on matured stakes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card text-center p-6 group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h4 className="font-semibold text-primary-text mb-2">Staking Guide</h4>
              <p className="text-sm text-secondary mb-4">
                Learn how to stake KPAD and maximize your rewards
              </p>
              <a 
                href="https://docs.kadpad.xyz/documentation/kadpad-token/kadpad-staking/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-ghost text-sm"
              >
                Read Guide
              </a>
            </div>

            <div className="card text-center p-6 group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-semibold text-primary-text mb-2">Community Support</h4>
              <p className="text-sm text-secondary mb-4">
                Get help from our community and team
              </p>
              <a 
                href="https://discord.gg/3jkAcdtAxf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-ghost text-sm"
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StakeContent = () => {
  const [activeTab, setActiveTab] = useState('stake');
  const { 
    isLoading, 
    isPublicDataLoaded,
    isUserDataLoaded,
    isStakingContractDeployed
  } = useStakingStore();
  const { isConnected } = useWalletStore();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // If staking contract is not deployed, show coming soon message
  if (!isStakingContractDeployed) {
    return <ComingSoonMessage />;
  }

  // Determine loading state for dynamic data only
  const shouldShowDataLoading = () => {
    if (isConnected) {
      // For connected users, only check user data loading, not global isLoading
      return !isUserDataLoaded;
    } else {
      // For non-connected users, only check public data loading
      return !isPublicDataLoaded;
    }
  };

  // Separate loading states for different component types
  const shouldShowPublicDataLoading = () => !isPublicDataLoaded;
  const shouldShowUserDataLoading = () => isConnected && !isUserDataLoaded;

  const dataIsLoading = shouldShowDataLoading();

  return (
    <div className="min-h-screen bg-primary-bg pt-24 pb-16 animate-fade-in">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-card border border-accent-primary/20 mb-6">
            <span className="text-sm font-medium text-accent-primary">
              🥇 Staking Platform
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-4">
            Stake Your <span className="text-gradient">KPAD</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto mb-8">
            Stake your KPAD tokens to earn rewards and gain access to exclusive launches. 
            Higher tiers unlock better benefits and guaranteed whitelist spots.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 transition-all duration-500 ease-in-out">
          <div className="lg:hidden">
            <div className="card">
              <h3 className="text-lg font-semibold text-primary-text mb-4">Platform Stats</h3>
              <SmoothTransition 
                isLoading={shouldShowPublicDataLoading()} 
                loadingComponent={StatsOverviewSkeleton}
              >
                <StatsOverview />
              </SmoothTransition>
            </div>
          </div>
          <div className="hidden lg:block">
            <SmoothTransition 
              isLoading={shouldShowPublicDataLoading()} 
              loadingComponent={StatsOverviewSkeleton}
            >
              <StatsOverview />
            </SmoothTransition>
          </div>
        </div>

        {/* Main Content Grid - Desktop: Dashboard | Staking Form | Leaderboard */}
        <div className="lg:hidden mb-8 space-y-6 transition-all duration-500 ease-in-out">
          {/* Staking Form - Priority on Mobile */}
          <div className="card">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Stake Your KPAD</h3>
            <div className="card">
              {/* Tab Navigation */}
              <div className="flex border-b border-border-color">
                <button
                  onClick={() => setActiveTab('stake')}
                  className={`flex-1 px-4 py-3 font-medium transition-colors ${
                    activeTab === 'stake'
                      ? 'text-white border-b-2 border-accent'
                      : 'text-secondary hover:text-primary-text hover:bg-hover-bg'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Stake</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('unstake')}
                  className={`flex-1 px-4 py-3 font-medium transition-colors ${
                    activeTab === 'unstake'
                      ? 'bg-red-600 text-white border-b-2 border-red-600'
                      : 'text-secondary hover:text-primary-text hover:bg-hover-bg'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="w-4 h-4 rotate-180" />
                    <span>Unstake</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-0">
                {dataIsLoading ? (
                  <StakingFormSkeleton />
                ) : (
                  activeTab === 'stake' ? <StakingForm /> : <UnstakingForm />
                )}
              </div>
            </div>
          </div>

          {/* Dashboard & Leaderboard - Secondary on Mobile */}
          <div className="card">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Dashboard & Stats</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-medium text-primary-text mb-3">Your Staking Info</h4>
                <SmoothTransition 
                  isLoading={shouldShowUserDataLoading()} 
                  loadingComponent={StakingDashboardSkeleton}
                >
                  <StakingDashboard />
                </SmoothTransition>
              </div>
              <div className="pt-4 border-t border-border-color">
                <h4 className="text-base font-medium text-primary-text mb-3">Top Stakers</h4>
                <SmoothTransition 
                  isLoading={shouldShowPublicDataLoading()} 
                  loadingComponent={LeaderboardSkeleton}
                >
                  <Leaderboard />
                </SmoothTransition>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-7 gap-6 max-w-7xl mx-auto mb-8 transition-all duration-500 ease-in-out">
          
          {/* Dashboard - Left Side on Desktop (2 columns) */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="sticky top-24">
              <SmoothTransition 
                isLoading={shouldShowUserDataLoading()} 
                loadingComponent={StakingDashboardSkeleton}
              >
                <StakingDashboard />
              </SmoothTransition>
            </div>
          </div>

          {/* Staking Forms - Middle on Desktop (3 columns) */}
          <div className="lg:col-span-3 order-2 lg:order-2">
            <div className="sticky top-24">
              <div className="card">
                {/* Tab Navigation */}
                <div className="flex border-b border-border-color">
                  <button
                    onClick={() => setActiveTab('stake')}
                    className={`flex-1 px-4 py-3 font-medium transition-colors ${
                      activeTab === 'stake'
                        ? 'text-white border-b-2 border-accent'
                        : 'text-secondary hover:text-primary-text hover:bg-hover-bg'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Stake</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('unstake')}
                    className={`flex-1 px-4 py-3 font-medium transition-colors ${
                      activeTab === 'unstake'
                        ? 'bg-red-600 text-white border-b-2 border-red-600'
                        : 'text-secondary hover:text-primary-text hover:bg-hover-bg'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="w-4 h-4 rotate-180" />
                      <span>Unstake</span>
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-0">
                  {dataIsLoading ? (
                    <StakingFormSkeleton />
                  ) : (
                    activeTab === 'stake' ? <StakingForm /> : <UnstakingForm />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard - Right Side on Desktop (2 columns) */}
          <div className="lg:col-span-2 order-3 lg:order-3">
            <div className="sticky top-24">
              <SmoothTransition 
                isLoading={shouldShowPublicDataLoading()} 
                loadingComponent={LeaderboardSkeleton}
              >
                <Leaderboard />
              </SmoothTransition>
            </div>
          </div>
        </div>

        {/* Balance Overview - Below main content */}
        <div className="mb-8 transition-all duration-500 ease-in-out">
          <SmoothTransition 
            isLoading={dataIsLoading} 
            loadingComponent={BalanceOverviewSkeleton}
          >
            <BalanceOverview />
          </SmoothTransition>
        </div>

        {/* Grid Layout for Information */}
        <div className="max-w-6xl mx-auto">
          <div className="card">
            <h3 className="text-xl font-semibold text-primary-text mb-4">Staking Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-primary-text mb-3">Staking Tiers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">Tier 1 (50k+ KPAD):</span>
                    <span className="text-orange-400">Basic rewards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Tier 2 (150k+ KPAD):</span>
                    <span className="text-gray-400">Enhanced rewards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Tier 3 (350k+ KPAD):</span>
                    <span className="text-yellow-400">Premium + Whitelist</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-primary-text mb-3">Key Features</h4>
                <ul className="space-y-2 text-sm text-secondary">
                  <li>• 365-day lock period</li>
                  <li>• Daily penalty reduction</li>
                  <li>• Tier-based rewards</li>
                  <li>• Whitelist access (Tier 3)</li>
                  <li>• No fees on matured stakes</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <h5 className="font-medium text-primary-text mb-2">🎯 Tier 3 Benefits</h5>
              <p className="text-sm text-secondary">
                Stake 350k+ KPAD to unlock Tier 3 and gain guaranteed whitelist access to all KadPad launches, 
                plus premium reward rates and exclusive community features.
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h4 className="font-semibold text-primary-text mb-2">Staking Guide</h4>
            <p className="text-sm text-secondary mb-4">
              Learn how to stake KPAD and maximize your rewards
            </p>
            <a 
              href="https://docs.kadpad.xyz/documentation/kadpad-token/kadpad-staking/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              Read Guide
            </a>
          </div>

          <div className="card text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h4 className="font-semibold text-primary-text mb-2">Community Support</h4>
            <p className="text-sm text-secondary mb-4">
              Get help from our community and team
            </p>
            <a 
              href="https://discord.gg/3jkAcdtAxf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stake = () => {
  const { account } = useWalletStore();
  
  return (
    <StakingDataProvider key={account || 'no-account'}>
      <StakerEmailProvider>
        <StakeContent />
      </StakerEmailProvider>
    </StakingDataProvider>
  );
};

export default Stake;


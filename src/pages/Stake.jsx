import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { StakingDataProvider } from '../contexts/StakingDataContext';
import { StakerEmailProvider } from '../contexts/StakerEmailContext';
import useWalletStore from '../wallet/walletStore';

// Components
import StakingDashboard from '../components/staking/StakingDashboard';
import StakingForm from '../components/staking/StakingForm';
import UnstakingForm from '../components/staking/UnstakingForm';
import StatsOverview from '../components/staking/StatsOverview';
import Leaderboard from '../components/staking/Leaderboard';
import BalanceOverview from '../components/staking/MobileBalanceOverview';

const StakeContent = () => {
  const [activeTab, setActiveTab] = useState('stake');
  const { isConnected } = useWalletStore();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-primary-bg pt-24 pb-16">
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
        <div className="mb-8">
          <div className="lg:hidden">
            <div className="card">
              <h3 className="text-lg font-semibold text-primary-text mb-4">Platform Stats</h3>
              <StatsOverview />
            </div>
          </div>
          <div className="hidden lg:block">
            <StatsOverview />
          </div>
        </div>

        {/* Main Content Grid - Desktop: Dashboard | Staking Form | Leaderboard */}
        <div className="lg:hidden mb-8 space-y-6">
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
                {activeTab === 'stake' ? <StakingForm /> : <UnstakingForm />}
              </div>
            </div>
          </div>

          {/* Dashboard & Leaderboard - Secondary on Mobile */}
          <div className="card">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Dashboard & Stats</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-medium text-primary-text mb-3">Your Staking Info</h4>
                <StakingDashboard />
              </div>
              <div className="pt-4 border-t border-border-color">
                <h4 className="text-base font-medium text-primary-text mb-3">Top Stakers</h4>
                <Leaderboard />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-7 gap-6 max-w-7xl mx-auto mb-8">
          
          {/* Dashboard - Left Side on Desktop (2 columns) */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="sticky top-24">
              <StakingDashboard />
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
                  {activeTab === 'stake' ? <StakingForm /> : <UnstakingForm />}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard - Right Side on Desktop (2 columns) */}
          <div className="lg:col-span-2 order-3 lg:order-3">
            <div className="sticky top-24">
              <Leaderboard />
            </div>
          </div>
        </div>

        {/* Balance Overview - Below main content */}
        <div className="mb-8">
          <BalanceOverview />
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
              href="https://docs.kadpad.xyz/documentation/kadpad-token/staking-tiers/" 
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

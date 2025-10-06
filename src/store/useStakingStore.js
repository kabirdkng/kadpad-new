import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStakingStore = create(
  devtools(
    (set, get) => ({
      // User staking data
      userStakes: [],
      userBalance: 0,
      totalStaked: 0,
      totalRewards: 0,
      leaderboard: [],
      
      // Loading states
      isLoading: false,
      isStaking: false,
      isUnstaking: false,
      isClaiming: false,
      
      // Data initialization states
      isPublicDataLoaded: false,
      isUserDataLoaded: false,
      
      // Contract deployment status
      isStakingContractDeployed: false, // Set to false to show coming soon page
      
      // Error handling
      error: null,
      
      // Staking details
      stakingStats: {
        totalStaked: 0,
        totalStakers: 0,
        totalRewardsDistributed: 0,
        currentAPY: 0
      },
      
      // Actions
      setUserStakes: (stakes) => set({ userStakes: stakes, isUserDataLoaded: true }),
      setUserBalance: (balance) => set({ userBalance: balance, isUserDataLoaded: true }),
      setTotalStaked: (total) => set({ totalStaked: total }),
      setTotalRewards: (rewards) => set({ totalRewards: rewards }),
      setLeaderboard: (leaderboard) => set({ leaderboard: leaderboard, isPublicDataLoaded: true }),
      setStakingStats: (stats) => set({ stakingStats: stats }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setStaking: (staking) => set({ isStaking: staking }),
      setUnstaking: (unstaking) => set({ isUnstaking: unstaking }),
      setClaiming: (claiming) => set({ isClaiming: claiming }),
      setError: (error) => set({ error: error }),
      setStakingContractDeployed: (deployed) => set({ isStakingContractDeployed: deployed }),
      
      // Add stake
      addStake: (stake) => {
        const currentStakes = get().userStakes;
        set({ userStakes: [...currentStakes, stake] });
      },
      
      // Update stake
      updateStake: (stakeId, updates) => {
        const currentStakes = get().userStakes;
        const updatedStakes = currentStakes.map(stake => 
          stake.id === stakeId ? { ...stake, ...updates } : stake
        );
        set({ userStakes: updatedStakes });
      },
      
      // Remove stake
      removeStake: (stakeId) => {
        const currentStakes = get().userStakes;
        const filteredStakes = currentStakes.filter(stake => stake.id !== stakeId);
        set({ userStakes: filteredStakes });
      },
      
      // Clear error
      clearError: () => set({ error: null }),
      
      // Clear user-specific data (for account switching)
      clearUserData: () => set({
        userStakes: [],
        userBalance: 0,
        error: null,
        isStaking: false,
        isUnstaking: false,
        isClaiming: false,
        isUserDataLoaded: false,
      }),
      
      // Reset state
      reset: () => set({
        userStakes: [],
        userBalance: 0,
        totalStaked: 0,
        totalRewards: 0,
        leaderboard: [],
        isLoading: false,
        isStaking: false,
        isUnstaking: false,
        isClaiming: false,
        error: null,
        isPublicDataLoaded: false,
        isUserDataLoaded: false,
        isStakingContractDeployed: false,
        stakingStats: {
          totalStaked: 0,
          totalStakers: 0,
          totalRewardsDistributed: 0,
          currentAPY: 0
        }
      }),
    }),
    {
      name: 'staking-store',
    }
  )
);

export default useStakingStore;

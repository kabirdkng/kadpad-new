import { useState, useCallback, useEffect } from 'react';
import { pactCallsSig, pactCalls, fetchBalance } from '../pactcalls/kadena';
import useStakingStore from '../store/useStakingStore';
import useWalletStore from '../wallet/walletStore';
import { toast } from 'react-toastify';

const STAKING_NAMESPACE = 'n_b9880e372b7ec49d21ef4afe82ece29c3a536bde';
const STAKING_MODULE = 'kadpad-staking';
const TOKEN_MODULE = 'kadpad';
const CHAIN_ID = 1;

export const useStakingPactCalls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { account, pubKey, isConnected } = useWalletStore();
  const { 
    setUserStakes, 
    setUserBalance, 
    setTotalStaked, 
    setLeaderboard,
    setStakingStats,
    setError,
    clearError,
    // Get current state values
    userBalance,
    userStakes,
    stakingStats,
    leaderboard
  } = useStakingStore();

  // Helper function to create Pact code
  const createPactCode = useCallback((functionCall) => {
    return `(${STAKING_NAMESPACE}.${STAKING_MODULE}.${functionCall})`;
  }, []);

  // Get user's token balance
  const getUserBalance = useCallback(async () => {
    if (!account) {
      console.log('🔍 getUserBalance: No account connected');
      return;
    }
    
    try {
      const code = `(${STAKING_NAMESPACE}.${TOKEN_MODULE}.get-balance "${account}")`;
      console.log('🔍 getUserBalance: Executing Pact code:', code);
      console.log('🔍 getUserBalance: Chain ID:', CHAIN_ID);
      console.log('🔍 getUserBalance: Account:', account);
      
      const result = await fetchBalance(code, CHAIN_ID);
      
      console.log('🔍 getUserBalance: Raw result from fetchBalance:', result);
      console.log('🔍 getUserBalance: Result type:', typeof result);
      console.log('🔍 getUserBalance: Result !== null:', result !== null);
      console.log('🔍 getUserBalance: Result !== undefined:', result !== undefined);
      
      if (result !== null && result !== undefined) {
        const balance = parseFloat(result);
        console.log('🔍 getUserBalance: Parsed balance:', balance);
        console.log('🔍 getUserBalance: Setting balance in store:', balance);
        setUserBalance(balance);
        return balance;
      } else {
        console.log('🔍 getUserBalance: Result is null or undefined, not setting balance');
      }
    } catch (error) {
      console.error('❌ Error fetching user balance:', error);
      setError('Failed to fetch balance');
    }
  }, [account, setUserBalance, setError]);

  // Get user's lockup data
  const getUserStakes = useCallback(async () => {
    if (!account) return;
    
    try {
      const code = createPactCode(`get-lockup "${account}"`);
      const result = await pactCalls(code, CHAIN_ID, pubKey);
      
      if (result?.result?.status === 'success') {
        const lockupData = result.result.data;
        
        // Calculate penalty info
        const penaltyCode = createPactCode(`calculate-penalty ${lockupData.total} (time "${lockupData.unlockDate}")`);
        const penaltyResult = await pactCalls(penaltyCode, CHAIN_ID, pubKey);
        
        let penaltyInfo = {};
        if (penaltyResult?.result?.status === 'success') {
          penaltyInfo = penaltyResult.result.data;
        }
        
        const stake = {
          id: account,
          account: lockupData.account,
          amount: parseFloat(lockupData.total),
          unlockDate: new Date(lockupData.unlockDate),
          lockDate: new Date(new Date(lockupData.unlockDate).getTime() - (365 * 24 * 60 * 60 * 1000)), // Subtract 1 year
          ...penaltyInfo
        };
        
        setUserStakes([stake]);
        return [stake];
      }
    } catch (error) {
      // If no lockup exists, return empty array
      if (error.message?.includes('row not found')) {
        setUserStakes([]);
        return [];
      }
      console.error('Error fetching user stakes:', error);
      setError('Failed to fetch staking data');
    }
  }, [account, pubKey, createPactCode, setUserStakes, setError]);

  // Get total staked amount
  const getTotalStaked = useCallback(async () => {
    try {
      const code = createPactCode('get-total-count');
      const result = await pactCalls(code, CHAIN_ID, pubKey);
      
      if (result?.result?.status === 'success') {
        const total = parseFloat(result.result.data.total);
        setTotalStaked(total);
        return total;
      }
    } catch (error) {
      console.error('Error fetching total staked:', error);
    }
  }, [createPactCode, pubKey, setTotalStaked]);

  // Get staking statistics
  const getStakingStats = useCallback(async () => {
    try {
      const [totalResult, countResult, tierResult] = await Promise.all([
        pactCalls(createPactCode('get-total-count'), CHAIN_ID, pubKey),
        pactCalls(createPactCode('get-staker-count'), CHAIN_ID, pubKey),
        pactCalls(createPactCode('get-accounts-by-tier'), CHAIN_ID, pubKey)
      ]);

      let stats = {
        totalStaked: 0,
        totalStakers: 0,
        totalRewardsDistributed: 0,
        currentAPY: 15.5 // Mock APY
      };

      if (totalResult?.result?.status === 'success') {
        stats.totalStaked = parseFloat(totalResult.result.data.total);
      }

      if (countResult?.result?.status === 'success') {
        stats.totalStakers = parseInt(countResult.result.data);
      }

      setStakingStats(stats);
      return stats;
    } catch (error) {
      console.error('Error fetching staking stats:', error);
    }
  }, [createPactCode, pubKey, setStakingStats]);

  // Get leaderboard data
  const getLeaderboard = useCallback(async () => {
    try {
      const code = createPactCode('get-tier-data');
      const result = await pactCalls(code, CHAIN_ID, pubKey);
      
      if (result?.result?.status === 'success') {
        const tierData = result.result.data;
        
        // Sort by total staked amount in descending order
        const sortedData = tierData
          .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
          .slice(0, 10) // Top 10
          .map((item, index) => ({
            rank: index + 1,
            account: item.account,
            amount: parseFloat(item.total),
            tier: getTierByAmount(parseFloat(item.total))
          }));
        
        setLeaderboard(sortedData);
        return sortedData;
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, [createPactCode, pubKey, setLeaderboard]);

  // Helper function to determine tier
  const getTierByAmount = (amount) => {
    if (amount >= 350000) return 3;
    if (amount >= 150000) return 2;
    if (amount >= 50000) return 1;
    return 0;
  };

  // Stake tokens
  const stakeTokens = useCallback(async (amount) => {
    if (!account || !pubKey || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      // Create guard for the user
      const guardCode = `(read-keyset "ks")`;
      const code = createPactCode(`lock-tokens "${account}" ${guardCode} ${amount}.0`);
      
      const result = await pactCallsSig(code, CHAIN_ID);
      
      if (result?.result?.status === 'success') {
        toast.success('Tokens staked successfully!');
        // Refresh data
        await Promise.all([
          getUserStakes(),
          getUserBalance(),
          getTotalStaked()
        ]);
        return result;
      } else {
        throw new Error(result?.result?.error?.message || 'Staking failed');
      }
    } catch (error) {
      console.error('Error staking tokens:', error);
      const errorMsg = error.message || 'Failed to stake tokens';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [account, pubKey, isConnected, createPactCode, clearError, getUserStakes, getUserBalance, getTotalStaked]);

  // Unstake tokens
  const unstakeTokens = useCallback(async (amount) => {
    if (!account || !pubKey || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const code = createPactCode(`remove-tokens "${account}" ${amount}.0`);
      
      const result = await pactCallsSig(code, CHAIN_ID);
      
      if (result?.result?.status === 'success') {
        toast.success('Tokens unstaked successfully!');
        // Refresh data
        await Promise.all([
          getUserStakes(),
          getUserBalance(),
          getTotalStaked()
        ]);
        return result;
      } else {
        throw new Error(result?.result?.error?.message || 'Unstaking failed');
      }
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      const errorMsg = error.message || 'Failed to unstake tokens';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [account, pubKey, isConnected, createPactCode, clearError, getUserStakes, getUserBalance, getTotalStaked]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        getUserBalance(),
        getUserStakes(),
        getTotalStaked(),
        getStakingStats(),
        getLeaderboard()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getUserBalance, getUserStakes, getTotalStaked, getStakingStats, getLeaderboard]);

  return {
    // Store data (like presale pattern)
    userBalance,
    userStakes,
    stakingStats,
    leaderboard,
    
    // Local state
    isLoading,
    
    // Data fetching functions
    getUserBalance,
    getUserStakes,
    getTotalStaked,
    getStakingStats,
    getLeaderboard,
    refreshData,
    
    // Action functions
    stakeTokens,
    unstakeTokens,
    
    // Utils
    getTierByAmount,
    
    // Store functions (exposing for components)
    account,
    pubKey,
    isConnected
  };
};

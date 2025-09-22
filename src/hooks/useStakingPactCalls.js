import { useState, useCallback, useEffect } from 'react';
import { pactCallsSig, pactCalls, fetchBalance, pactCallsStakeTokens, pactCallsUnstakeTokens } from '../pactcalls/kadena';
import useStakingStore from '../store/useStakingStore';
import useWalletStore from '../wallet/walletStore';
import { toast } from 'react-toastify';
import { handleTokenStaking, handleTokenUnstaking, isUserRejectionError } from '../utils/transactionUtils';
import { formatAmountForPact } from '../utils/decimalUtils';

const STAKING_NAMESPACE = 'n_b9880e372b7ec49d21ef4afe82ece29c3a536bde';
const STAKING_MODULE = 'kadpad-staking';
const TOKEN_MODULE = 'kadpad';
const CHAIN_ID = 1;

export const useStakingPactCalls = (options = {}) => {
  const { disableAutoRefresh = false } = options;
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
    clearUserData,
    // Get current state values
    userBalance,
    userStakes,
    stakingStats,
    leaderboard
  } = useStakingStore();

  // Helper function to extract numeric value from Pact data
  const extractNumericValue = useCallback((value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (typeof value === 'object') {
      // Handle Pact integer objects like {int: 123}
      if (value.int !== undefined) return parseFloat(value.int) || 0;
      if (value.decimal !== undefined) return parseFloat(value.decimal) || 0;
      // Handle direct numeric properties
      if (value.total !== undefined) return parseFloat(value.total) || 0;
    }
    return parseFloat(value) || 0;
  }, []);

  // Helper function to extract date value from Pact data
  const extractDateValue = useCallback((value) => {
    if (!value) return null;
    
    // If it's already a Date object
    if (value instanceof Date) return value;
    
    // If it's a Pact time object with timep property
    if (typeof value === 'object' && value.timep) {
      const date = new Date(value.timep);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // If it's a timestamp (number or string that looks like a timestamp)
    if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
      const timestamp = parseInt(value);
      // Check if it's in seconds (Unix timestamp) or milliseconds
      const date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // If it's a Pact object with timestamp
    if (typeof value === 'object') {
      if (value.time !== undefined) {
        const timestamp = parseInt(value.time);
        const date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
        return isNaN(date.getTime()) ? null : date;
      }
      if (value.int !== undefined) {
        const timestamp = parseInt(value.int);
        const date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
        return isNaN(date.getTime()) ? null : date;
      }
    }
    
    // Try to parse as a date string
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  }, []);

  // Helper function to create Pact code
  const createPactCode = useCallback((functionCall) => {
    return `(${STAKING_NAMESPACE}.${STAKING_MODULE}.${functionCall})`;
  }, []);

  // Helper function to get locker account
  const getLockerAccount = useCallback(async (account) => {
    try {
      const code = createPactCode(`get-LOCKER-account "${account}"`);
      const result = await pactCalls(code, CHAIN_ID);
      
      if (result?.result?.status === 'success') {
        return result.result.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting locker account:', error);
      return null;
    }
  }, [createPactCode]);

  // Get penalty calculation for an amount and lock date
  const calculatePenalty = useCallback(async (amount, lockDate) => {
    try {
      const formattedAmount = formatAmountForPact(amount);
      const code = createPactCode(`calculate-penalty ${formattedAmount} (time "${lockDate.toISOString()}")`);
      const result = await fetchBalance(code, CHAIN_ID);
      
      if (result) {
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error calculating penalty:', error);
      return null;
    }
  }, [createPactCode]);

  // Fallback penalty calculation (client-side) based on smart contract logic
  const calculatePenaltyFallback = useCallback((amount, lockDate) => {
    const now = new Date();
    const daysStaked = Math.floor((now.getTime() - lockDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysStaked >= 365) {
      return {
        'days-staked': daysStaked,
        'penalty-percent': 0.0,
        'penalty-amount': 0.0,
        'return-amount': amount,
        'is-mature': true
      };
    }
    
    const penaltyPercent = Math.max(0, (365 - daysStaked) / 365);
    const penaltyAmount = amount * penaltyPercent;
    const returnAmount = amount - penaltyAmount;
    
    return {
      'days-staked': daysStaked,
      'penalty-percent': penaltyPercent,
      'penalty-amount': penaltyAmount,
      'return-amount': returnAmount,
      'is-mature': daysStaked >= 365
    };
  }, []);

  // Get user's token balance
  const getUserBalance = useCallback(async () => {
    if (!account) return;
    
    try {
      const code = `(${STAKING_NAMESPACE}.${TOKEN_MODULE}.get-balance "${account}")`;
      const result = await fetchBalance(code, CHAIN_ID);
      
      if (result !== null && result !== undefined) {
        const balance = extractNumericValue(result);
        setUserBalance(balance);
        return balance;
      } else {
        // Handle case where account doesn't exist or has 0 balance
        console.log('getUserBalance: Account has no balance or does not exist, setting balance to 0');
        setUserBalance(0);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
      // Still set balance to 0 even if there's an error, to indicate data was loaded
      setUserBalance(0);
      setError('Failed to fetch balance');
      return 0;
    }
  }, [account, setUserBalance, setError, extractNumericValue]);

  // Get user's lockup data
  const getUserStakes = useCallback(async () => {
    if (!account) return;
    
    try {
      const code = createPactCode(`get-lockup "${account}"`);
      const result = await pactCalls(code, CHAIN_ID);
      
      if (result?.result?.status === 'success') {
        const lockupData = result.result.data;
        
        // Extract the actual date from the Pact time object
        let unlockDate = null;
        if (lockupData.unlockDate && lockupData.unlockDate.timep) {
          unlockDate = new Date(lockupData.unlockDate.timep);
        } else if (lockupData.unlockDate) {
          unlockDate = extractDateValue(lockupData.unlockDate);
        }
        
        // Calculate lock date (unlock date minus 365 days)
        let lockDate = null;
        if (unlockDate) {
          lockDate = new Date(unlockDate.getTime() - (365 * 24 * 60 * 60 * 1000));
        }
        
        // Calculate penalty info
        let penaltyInfo = null;
        if (unlockDate) {
          const calculatedLockDate = new Date(unlockDate.getTime() - (365 * 24 * 60 * 60 * 1000));
          penaltyInfo = await calculatePenalty(extractNumericValue(lockupData.total), calculatedLockDate);
          
          if (!penaltyInfo) {
            penaltyInfo = calculatePenaltyFallback(extractNumericValue(lockupData.total), calculatedLockDate);
          }
        }
        
        const stake = {
          id: account,
          account: lockupData.account,
          amount: extractNumericValue(lockupData.total),
          unlockDate: unlockDate,
          lockDate: lockDate,
          'unlock-date': unlockDate,
          'lock-date': lockDate,
          ...(penaltyInfo || {})
        };
        
        setUserStakes([stake]);
        return [stake];
      }
    } catch (error) {
      // If no lockup exists, return empty array
      if (error.message?.includes('row not found')) {
        console.log('getUserStakes: No lockup found for account, setting empty stakes');
        setUserStakes([]);
        return [];
      }
      console.error('Error fetching user stakes:', error);
      // Set empty stakes even on error to indicate data was loaded
      setUserStakes([]);
      setError('Failed to fetch staking data');
      return [];
    }
  }, [account, pubKey, createPactCode, setUserStakes, setError, calculatePenalty, calculatePenaltyFallback, extractNumericValue]);

  // Get total staked amount
  const getTotalStaked = useCallback(async () => {
    try {
      const code = createPactCode('get-total-count');
      const result = await pactCalls(code, CHAIN_ID);
      
      if (result?.result?.status === 'success') {
        const total = extractNumericValue(result.result.data.total || result.result.data);
        setTotalStaked(total);
        return total;
      }
    } catch (error) {
      console.error('Error fetching total staked:', error);
    }
  }, [createPactCode, pubKey, setTotalStaked, extractNumericValue]);

  // Get staking statistics
  const getStakingStats = useCallback(async () => {
    try {
      const [totalResult, countResult, tierResult] = await Promise.all([
        pactCalls(createPactCode('get-total-count'), CHAIN_ID),
        pactCalls(createPactCode('get-staker-count'), CHAIN_ID),
        pactCalls(createPactCode('get-accounts-by-tier'), CHAIN_ID)
      ]);

      let stats = {
        totalStaked: 0,
        totalStakers: 0,
        tier1Count: 0,
        tier2Count: 0,
        tier3Count: 0
      };

      if (totalResult?.result?.status === 'success') {
        stats.totalStaked = extractNumericValue(totalResult.result.data.total || totalResult.result.data);
      }

      if (countResult?.result?.status === 'success') {
        stats.totalStakers = extractNumericValue(countResult.result.data);
      }

      if (tierResult?.result?.status === 'success') {
        const tierData = tierResult.result.data;
        if (tierData) {
          stats.tier1Count = tierData['tier-1'] ? tierData['tier-1'].length : 0;
          stats.tier2Count = tierData['tier-2'] ? tierData['tier-2'].length : 0;
          stats.tier3Count = tierData['tier-3'] ? tierData['tier-3'].length : 0;
        }
      }

      setStakingStats(stats);
      return stats;
    } catch (error) {
      console.error('Error fetching staking stats:', error);
    }
  }, [createPactCode, pubKey, setStakingStats, extractNumericValue]);

  // Helper function to determine tier
  const getTierByAmount = useCallback((amount) => {
    if (amount >= 350000) return { tier: 3, name: 'Chainweb' };
    if (amount >= 150000) return { tier: 2, name: 'Cluster' };
    if (amount >= 50000) return { tier: 1, name: 'Node' };
    return { tier: 0, name: 'No Tier' };
  }, []);

  // Get leaderboard data
  const getLeaderboard = useCallback(async () => {
    try {
      const code = createPactCode('get-tier-data');
      const result = await pactCalls(code, CHAIN_ID);
      
      if (result?.result?.status === 'success') {
        const tierData = result.result.data;
        
        // Calculate tier percentages
        const totalWallets = tierData.length;
        const tierCounts = { tier1: 0, tier2: 0, tier3: 0, noTier: 0 };
        
        tierData.forEach(item => {
          const amount = extractNumericValue(item.total);
          const tierInfo = getTierByAmount(amount);
          if (tierInfo.tier === 3) tierCounts.tier3++;
          else if (tierInfo.tier === 2) tierCounts.tier2++;
          else if (tierInfo.tier === 1) tierCounts.tier1++;
          else tierCounts.noTier++;
        });
        
        const tierPercentages = {
          tier1: totalWallets > 0 ? Math.round((tierCounts.tier1 / totalWallets) * 100) : 0,
          tier2: totalWallets > 0 ? Math.round((tierCounts.tier2 / totalWallets) * 100) : 0,
          tier3: totalWallets > 0 ? Math.round((tierCounts.tier3 / totalWallets) * 100) : 0,
          noTier: totalWallets > 0 ? Math.round((tierCounts.noTier / totalWallets) * 100) : 0
        };
        
        // Sort by total staked amount in descending order
        const sortedData = tierData
          .sort((a, b) => extractNumericValue(b.total) - extractNumericValue(a.total))
          .slice(0, 5) // Top 5
          .map((item, index) => ({
            rank: index + 1,
            account: item.account,
            amount: extractNumericValue(item.total),
            tier: getTierByAmount(extractNumericValue(item.total)).tier
          }));
        
        // Add tier percentages to the leaderboard data
        const leaderboardWithPercentages = {
          rankings: sortedData,
          tierPercentages: tierPercentages
        };
        
        setLeaderboard(leaderboardWithPercentages);
        return leaderboardWithPercentages;
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, [createPactCode, pubKey, setLeaderboard, extractNumericValue, getTierByAmount]);

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
      // Get the locker account first
      const lockerAccount = await getLockerAccount(account);
      if (!lockerAccount) {
        throw new Error('Failed to get locker account');
      }

      // Create guard for the user
      const guardCode = `(read-keyset "ks")`;
      const formattedAmount = formatAmountForPact(amount);
      const code = createPactCode(`lock-tokens "${account}" ${guardCode} ${formattedAmount}`);
      
      const result = await handleTokenStaking({
        code,
        chainId: CHAIN_ID,
        namespace: STAKING_NAMESPACE,
        tokenModule: TOKEN_MODULE,
        amount,
        lockerAccount,
        account,
        pactCallsStakeTokens,
        onSuccess: (result) => {
          toast.success('Tokens staked successfully!');
          // Refresh data
          Promise.all([
            getUserStakes(),
            getUserBalance(),
            getTotalStaked()
          ]);
        },
        onError: (errorMsg) => {
          setError(errorMsg);
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error staking tokens:', error);
      const errorMsg = error.message || 'Failed to stake tokens';
      setError(errorMsg);
      
      // Don't show duplicate error if it's already a signing failure
      if (!isUserRejectionError(error)) {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [account, pubKey, isConnected, createPactCode, clearError, getUserStakes, getUserBalance, getTotalStaked, getLockerAccount]);

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
      // Get the locker account first
      const lockerAccount = await getLockerAccount(account);
      if (!lockerAccount) {
        throw new Error('Failed to get locker account');
      }

      const formattedAmount = formatAmountForPact(amount);
      const code = createPactCode(`remove-tokens "${account}" ${formattedAmount}`);
      
      const result = await handleTokenUnstaking({
        code,
        chainId: CHAIN_ID,
        namespace: STAKING_NAMESPACE,
        stakingModule: STAKING_MODULE,
        tokenModule: TOKEN_MODULE,
        account,
        lockerAccount,
        amount,
        pactCallsUnstakeTokens,
        onSuccess: (result) => {
          toast.success('Tokens unstaked successfully!');
          // Refresh data
          Promise.all([
            getUserStakes(),
            getUserBalance(),
            getTotalStaked()
          ]);
        },
        onError: (errorMsg) => {
          setError(errorMsg);
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      const errorMsg = error.message || 'Failed to unstake tokens';
      setError(errorMsg);
      
      // Don't show duplicate error if it's already a signing failure
      if (!isUserRejectionError(error)) {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [account, pubKey, isConnected, createPactCode, clearError, getUserStakes, getUserBalance, getTotalStaked, getLockerAccount]);

  // Refresh public data (stats, leaderboard, total staked) - doesn't require wallet connection
  const refreshPublicData = useCallback(async () => {
    try {
      await Promise.all([
        getTotalStaked(),
        getStakingStats(),
        getLeaderboard()
      ]);
    } catch (error) {
      console.error('Error refreshing public data:', error);
    }
  }, [getTotalStaked, getStakingStats, getLeaderboard]);

  // Refresh all data (including user-specific data)
  const refreshData = useCallback(async () => {
    if (!isConnected || !account) return;
    
    console.log('useStakingPactCalls: Refreshing data for account:', account);
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
  }, [isConnected, account, getUserBalance, getUserStakes, getTotalStaked, getStakingStats, getLeaderboard]);

  // Effect to clear and refresh data when account changes
  useEffect(() => {
    // Skip auto-refresh if disabled (used in forms to prevent redundant fetching)
    if (disableAutoRefresh) return;
    
    if (account) {
      console.log('useStakingPactCalls: Account changed, clearing and refreshing data for:', account);
      // Clear user-specific data first
      clearUserData();
      
      // Then refresh with new account data (but don't call refreshData directly here to avoid loops)
      // The data will be refreshed by useStakingDataSync
    } else if (isConnected) {
      // If connected but no account, clear user data
      console.log('useStakingPactCalls: Connected but no account, clearing user data');
      clearUserData();
    }
  }, [account, isConnected, disableAutoRefresh]); // Add disableAutoRefresh to dependencies

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
    refreshPublicData,
    getLockerAccount,
    calculatePenalty,
    calculatePenaltyFallback,
    
    // Action functions
    stakeTokens,
    unstakeTokens,
    
    // Utils
    getTierByAmount,
    extractNumericValue,
    extractDateValue,
    
    // Store functions (exposing for components)
    account,
    pubKey,
    isConnected
  };
};

import { useCallback } from 'react';
import { pactCallsStakeTokens, pactCallsUnstakeTokens, pactCalls } from '../pactcalls/kadena';
import useWalletStore from '../wallet/walletStore';
import useStakingStore from '../store/useStakingStore';

const STAKING_NAMESPACE = 'n_b9880e372b7ec49d21ef4afe82ece29c3a536bde';
const STAKING_MODULE = 'kadpad-staking';

/**
 * Hook that provides only staking action functions without any data fetching
 * Use this when you only need to perform actions like staking/unstaking
 */
export const useStakingActions = () => {
  const { account, pubKey, isConnected } = useWalletStore();
  const { clearError } = useStakingStore();

  // Stake tokens
  const stakeTokens = useCallback(async (amount) => {
    if (!isConnected || !account || !pubKey) {
      throw new Error('Wallet not connected');
    }

    clearError();

    try {
      const result = await pactCallsStakeTokens(amount, account, pubKey);
      return result;
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    }
  }, [account, pubKey, isConnected, clearError]);

  // Unstake tokens
  const unstakeTokens = useCallback(async (amount) => {
    if (!isConnected || !account || !pubKey) {
      throw new Error('Wallet not connected');
    }

    clearError();

    try {
      const result = await pactCallsUnstakeTokens(amount, account, pubKey);
      return result;
    } catch (error) {
      console.error('Unstaking failed:', error);
      throw error;
    }
  }, [account, pubKey, isConnected, clearError]);

  // Calculate penalty (this calls the smart contract but doesn't store data)
  const calculatePenalty = useCallback(async (amount, lockDate) => {
    try {
      const code = `(${STAKING_NAMESPACE}.${STAKING_MODULE}.calculate-penalty "${account}" ${parseFloat(amount)} (time "${lockDate.toISOString()}"))`;
      
      const result = await pactCalls(code, 1, {
        account,
        pubKey,
        gasLimit: 10000,
        addKeyset: false
      });
      
      return result?.result?.data;
    } catch (error) {
      console.error('Error calculating penalty:', error);
      return null;
    }
  }, [account, pubKey]);

  return {
    stakeTokens,
    unstakeTokens,
    calculatePenalty
  };
};

export default useStakingActions;
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { pactCallsSales, pactCalls } from '../pactcalls/kadena';

export const usePostSalesOperations = (
  namespace,
  salesModuleName,
  supplyChain,
  client,
  session,
  moduleName
) => {
  const [isDistributing, setIsDistributing] = useState(false);
  const [isEndingSales, setIsEndingSales] = useState(false);
  const [isInitializingLiquidity, setIsInitializingLiquidity] = useState(false);
  const [distributionComplete, setDistributionComplete] = useState(false);
  const [salesEnded, setSalesEnded] = useState(false);
  const [liquidityInitialized, setLiquidityInitialized] = useState(false);

  const checkDistributionStatus = useCallback(async () => {
    try {
      const code = `(${namespace}.${salesModuleName}.get-distribution-rounds-needed)`;
      const response = await pactCalls(code, supplyChain);
      if (response?.result?.data !== undefined) {
        const rounds = response.result.data?.int || response.result.data?.decimal || response.result.data;
        const isComplete = Number(rounds) === 0;
        setDistributionComplete(isComplete);
        return isComplete;
      }
    } catch (error) {
      console.error('Error checking distribution status:', error);
    }
    return false;
  }, [namespace, salesModuleName, supplyChain]);

  const checkSalesStatus = useCallback(async () => {
    try {
      // Check if the tail is HEAD, which means distribution is complete
      const code = `(${namespace}.${salesModuleName}.read tail-table "")`;
      const response = await pactCalls(code, supplyChain);
      if (response?.result?.data) {
        const tailAccount = response.result.data['tail-account'];
        const isEnded = tailAccount === 'HEAD';
        setSalesEnded(isEnded);
        return isEnded;
      }
    } catch (error) {
      // If table doesn't exist or error, sales might be ended
      console.error('Error checking sales status:', error);
    }
    return false;
  }, [namespace, salesModuleName, supplyChain]);

  const checkLiquidityStatus = useCallback(async () => {
    try {
      const code = `(${namespace}.${moduleName}-treasury.read liquidity-management "")`;
      const response = await pactCalls(code, supplyChain);
      if (response?.result?.data) {
        const isInitialized = response.result.data.init === true;
        setLiquidityInitialized(isInitialized);
        return isInitialized;
      }
    } catch (error) {
      console.error('Error checking liquidity status:', error);
    }
    return false;
  }, [namespace, moduleName, supplyChain]);

  const distributeTokens = useCallback(async () => {
    if (!client || !session) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsDistributing(true);
    try {
      const code = `(${namespace}.${salesModuleName}.distribute-tokens)`;
      
      const result = await pactCallsSales(
        code,
        supplyChain,
        client,
        session,
        namespace,
        moduleName
      );

      if (result?.preflightResult?.result?.status === 'success') {
        toast.success('Token distribution round completed successfully!');
        return true;
      } else {
        const errorMsg = result?.preflightResult?.result?.error?.message || 'Failed to distribute tokens';
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      console.error('Error distributing tokens:', error);
      toast.error('Error distributing tokens');
      return false;
    } finally {
      setIsDistributing(false);
    }
  }, [namespace, salesModuleName, supplyChain, client, session, moduleName]);

  const endSales = useCallback(async () => {
    if (!client || !session) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!distributionComplete) {
      toast.error('Please complete token distribution first');
      return false;
    }

    setIsEndingSales(true);
    try {
      const code = `(${namespace}.${salesModuleName}.end-sales)`;
      
      const result = await pactCallsSales(
        code,
        supplyChain,
        client,
        session,
        namespace,
        moduleName
      );

      if (result?.preflightResult?.result?.status === 'success') {
        toast.success('Sales contract ended successfully!');
        setSalesEnded(true);
        return true;
      } else {
        const errorMsg = result?.preflightResult?.result?.error?.message || 'Failed to end sales';
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      console.error('Error ending sales:', error);
      toast.error('Error ending sales');
      return false;
    } finally {
      setIsEndingSales(false);
    }
  }, [namespace, salesModuleName, supplyChain, client, session, moduleName, distributionComplete]);

  const initLiquidity = useCallback(async () => {
    if (!client || !session) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!salesEnded) {
      toast.error('Please end the sales contract first');
      return false;
    }

    setIsInitializingLiquidity(true);
    try {
      const code = `(${namespace}.${moduleName}-treasury.init-liquidity)`;
      
      const result = await pactCallsSales(
        code,
        supplyChain,
        client,
        session,
        namespace,
        moduleName
      );

      if (result?.preflightResult?.result?.status === 'success') {
        toast.success('DEX liquidity initialized successfully!');
        setLiquidityInitialized(true);
        return true;
      } else {
        const errorMsg = result?.preflightResult?.result?.error?.message || 'Failed to initialize liquidity';
        toast.error(errorMsg);
        return false;
      }
    } catch (error) {
      console.error('Error initializing liquidity:', error);
      toast.error('Error initializing liquidity');
      return false;
    } finally {
      setIsInitializingLiquidity(false);
    }
  }, [namespace, moduleName, supplyChain, client, session, salesEnded]);

  return {
    isDistributing,
    isEndingSales,
    isInitializingLiquidity,
    distributionComplete,
    salesEnded,
    liquidityInitialized,
    distributeTokens,
    endSales,
    initLiquidity,
    checkDistributionStatus,
    checkSalesStatus,
    checkLiquidityStatus
  };
};

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { pactCallsSales, pactCalls } from '../pactcalls/kadena';
import useTransactionManager from './useTransactionManager';

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

  const { 
    submitTransaction, 
    createTransactionMetadata, 
    transactionTypes 
  } = useTransactionManager();

  const checkDistributionStatus = useCallback(async () => {
    try {
      const code = `(${namespace}.${salesModuleName}.get-distribution-rounds-needed)`;
      const response = await pactCalls(code, supplyChain);
      if (response?.result?.data !== undefined && response?.result?.data !== null) {
        // Handle different response formats
        let rounds;
        if (typeof response.result.data === 'object' && response.result.data.int !== undefined) {
          rounds = response.result.data.int;
        } else if (typeof response.result.data === 'number') {
          rounds = response.result.data;
        } else {
          rounds = parseInt(response.result.data) || 0;
        }
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
      // Try to read the tail-table, but handle the case where it might not exist
      const code = `(use ${namespace}.${salesModuleName}) (read tail-table "")`;
      const response = await pactCalls(code, supplyChain);
      if (response?.result?.data && response.result.data !== "") {
        const tailAccount = response.result.data['tail-account'];
        const isEnded = tailAccount === 'HEAD';
        setSalesEnded(isEnded);
        return isEnded;
      }
      // If no tail-table data or empty, sales are not ended yet
      setSalesEnded(false);
      return false;
    } catch (error) {
      // If table doesn't exist or error, sales are not ended yet
      console.error('Error checking sales status:', error);
      setSalesEnded(false);
    }
    return false;
  }, [namespace, salesModuleName, supplyChain]);

  const checkLiquidityStatus = useCallback(async () => {
    try {
      // Try to read the liquidity-management table, handle case where it might not exist
      const code = `(use ${namespace}.${moduleName}-treasury) (read liquidity-management "")`;
      const response = await pactCalls(code, supplyChain);
      if (response?.result?.data && response.result.data !== "") {
        const isInitialized = response.result.data.init === true;
        setLiquidityInitialized(isInitialized);
        return isInitialized;
      }
      // If no data, liquidity is not initialized yet
      setLiquidityInitialized(false);
      return false;
    } catch (error) {
      console.error('Error checking liquidity status:', error);
      setLiquidityInitialized(false);
    }
    return false;
  }, [namespace, moduleName, supplyChain]);

  const distributeTokens = useCallback(async () => {
    setIsDistributing(true);
    try {
      const code = `(${namespace}.${salesModuleName}.distribute-tokens)`;
      
      toast.info('Submitting token distribution...', { position: 'top-center', autoClose: 2000 });
      const result = await pactCallsSales(
        code,
        supplyChain,
        client,
        session,
        namespace,
        moduleName
      );

      if (result?.preflightResult?.result?.status === 'success') {
        const txKey = result.transactionDescriptor?.requestKey;
        
        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.OTHER,
          'Distribute tokens to participants',
          {
            operation: 'distribute-tokens',
            chainId: supplyChain,
            namespace,
            moduleName: salesModuleName,
          }
        );

        // Submit transaction using the new manager
        try {
          const finalResult = await submitTransaction({
            txId: txKey,
            pactClient: result.pactClient,
            transactionDescriptor: result.transactionDescriptor,
            metadata,
            pollingConfig: {
              enableToasts: true,
            }
          });

          if (finalResult?.result?.status === 'success') {
            return true;
          } else {
            return false;
          }
        } catch (pollError) {
          console.error('Transaction polling error:', pollError);
          return false;
        }
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
  }, [namespace, salesModuleName, supplyChain, client, session, moduleName, submitTransaction, createTransactionMetadata, transactionTypes]);

  const endSales = useCallback(async () => {
    if (!distributionComplete) {
      toast.error('Please complete token distribution first');
      return false;
    }

    setIsEndingSales(true);
    try {
      const code = `(${namespace}.${salesModuleName}.end-sales)`;
      
      toast.info('Submitting sales end transaction...', { position: 'top-center', autoClose: 2000 });
      const result = await pactCallsSales(
        code,
        supplyChain,
        client,
        session,
        namespace,
        moduleName
      );

      if (result?.preflightResult?.result?.status === 'success') {
        const txKey = result.transactionDescriptor?.requestKey;
        
        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.OTHER,
          'End sales contract',
          {
            operation: 'end-sales',
            chainId: supplyChain,
            namespace,
            moduleName: salesModuleName,
          }
        );

        // Submit transaction using the new manager
        try {
          const finalResult = await submitTransaction({
            txId: txKey,
            pactClient: result.pactClient,
            transactionDescriptor: result.transactionDescriptor,
            metadata,
            pollingConfig: {
              enableToasts: true,
            }
          });

          if (finalResult?.result?.status === 'success') {
            setSalesEnded(true);
            return true;
          } else {
            return false;
          }
        } catch (pollError) {
          console.error('Transaction polling error:', pollError);
          return false;
        }
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
  }, [namespace, salesModuleName, supplyChain, client, session, moduleName, distributionComplete, submitTransaction, createTransactionMetadata, transactionTypes]);

  const initLiquidity = useCallback(async () => {
    if (!salesEnded) {
      toast.error('Please end the sales contract first');
      return false;
    }

    setIsInitializingLiquidity(true);
    try {
      const code = `(${namespace}.${moduleName}-treasury.init-liquidity)`;
      
      toast.info('Submitting liquidity initialization...', { position: 'top-center', autoClose: 2000 });
      const result = await pactCallsSales(
        code,
        supplyChain,
        client,
        session,
        namespace,
        moduleName
      );

      if (result?.preflightResult?.result?.status === 'success') {
        const txKey = result.transactionDescriptor?.requestKey;
        
        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.OTHER,
          'Initialize DEX liquidity',
          {
            operation: 'init-liquidity',
            chainId: supplyChain,
            namespace,
            moduleName: `${moduleName}-treasury`,
          }
        );

        // Submit transaction using the new manager
        try {
          const finalResult = await submitTransaction({
            txId: txKey,
            pactClient: result.pactClient,
            transactionDescriptor: result.transactionDescriptor,
            metadata,
            pollingConfig: {
              enableToasts: true,
            }
          });

          if (finalResult?.result?.status === 'success') {
            setLiquidityInitialized(true);
            return true;
          } else {
            return false;
          }
        } catch (pollError) {
          console.error('Transaction polling error:', pollError);
          return false;
        }
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
  }, [namespace, moduleName, supplyChain, client, session, salesEnded, submitTransaction, createTransactionMetadata, transactionTypes]);

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

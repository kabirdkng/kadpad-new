import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { pactCallsSales, pactCalls, initLiquidityTreasury } from '../pactcalls/kadena';
import useTransactionManager from './useTransactionManager';
import useWalletStore from '../wallet/walletStore';
import { markSalesEnded, markInitLiquidityDone, incrementDistributionRound, getLaunchedProject } from '../api';
import { isUserRejectionError } from '../utils/transactionUtils';

export const usePostSalesOperations = (
  namespace,
  salesModuleName,
  supplyChain,
  moduleName
) => {
  const [isDistributing, setIsDistributing] = useState(false);
  const [isEndingSales, setIsEndingSales] = useState(false);
  const [isInitializingLiquidity, setIsInitializingLiquidity] = useState(false);
  const [distributionComplete, setDistributionComplete] = useState(false);
  const [salesEnded, setSalesEnded] = useState(false);
  const [liquidityInitialized, setLiquidityInitialized] = useState(false);
  const [distributionRoundCompleted, setDistributionRoundCompleted] = useState(0);

  const [distributionRoundsNeeded, setDistributionRoundsNeeded] = useState(0);

  const { 
    submitTransaction, 
    createTransactionMetadata, 
    transactionTypes 
  } = useTransactionManager();

  const fetchDistributionRounds = useCallback(async () => {
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
        const roundsNumber = Number(rounds);
        setDistributionRoundsNeeded(roundsNumber);
        return roundsNumber;
      }
    } catch (error) {
      console.error('Error fetching distribution rounds:', error);
    }
    return 0;
  }, [namespace, salesModuleName, supplyChain]);

  const checkDistributionStatus = useCallback(async () => {
    try {
      // Check if distribution is complete by reading the tail-table
      // When tail-account is "HEAD", it means distribution is complete
      const code = `(use ${namespace}.${salesModuleName}) (read tail-table "")`;
      const response = await pactCalls(code, supplyChain);
      if (response?.result?.data && response.result.data !== "") {
        const tailAccount = response.result.data['tail-account'];
        const isComplete = tailAccount === 'HEAD';
        setDistributionComplete(isComplete);
        return isComplete;
      }
      // If no tail-table data or empty, distribution is not complete yet
      setDistributionComplete(false);
      return false;
    } catch (error) {
      console.error('Error checking distribution status:', error);
      setDistributionComplete(false);
      return false;
    }
  }, [namespace, salesModuleName, supplyChain]);

  // Check backend project status from database
  const checkBackendStatus = useCallback(async () => {
    try {
      const response = await getLaunchedProject(namespace, moduleName);
      if (response?.data?.data?.project) {
        const project = response.data.data.project;
        
        // Update states based on backend data
        if (project.isSalesEnded !== undefined) {
          setSalesEnded(project.isSalesEnded);
        }
        if (project.isInitLiquidity !== undefined) {
          setLiquidityInitialized(project.isInitLiquidity);
        }
        if (project.distributionRoundCompleted !== undefined) {
          setDistributionRoundCompleted(project.distributionRoundCompleted);
        }
        
        return {
          isSalesEnded: project.isSalesEnded,
          isInitLiquidity: project.isInitLiquidity,
          distributionRoundCompleted: project.distributionRoundCompleted
        };
      }
      return null;
    } catch (error) {
      console.error('Error checking backend project status:', error);
      return null;
    }
  }, [namespace, moduleName]);

  // Initialize status checks when the hook is first used
  useEffect(() => {
    if (namespace && salesModuleName && supplyChain) {
      // Check distribution status on mount
      checkDistributionStatus();
      // Also fetch distribution rounds needed
      fetchDistributionRounds();
      // Check backend status for sales ended and liquidity status
      checkBackendStatus();
    }
  }, [namespace, salesModuleName, supplyChain, checkDistributionStatus, fetchDistributionRounds, checkBackendStatus]);

  const checkSalesStatus = useCallback(async () => {
    try {
      // Check if the end-sales function has been called by trying to read the treasury liquidity account balance
      // If end-sales was called, KDA should have been transferred to treasury
      const treasuryBalanceCode = `(coin.get-balance ${namespace}.${moduleName}-treasury.LIQUIDITY-ACCOUNT)`;
      const treasuryResponse = await pactCalls(treasuryBalanceCode, supplyChain);
      
      if (treasuryResponse?.result?.data !== undefined && treasuryResponse?.result?.data > 0) {
        // If treasury has KDA balance, end-sales was likely called
        setSalesEnded(true);
        return true;
      }

      // If no KDA in treasury, sales contract hasn't been ended yet
      setSalesEnded(false);
      return false;
    } catch (error) {
      console.error('Error checking sales status:', error);
      setSalesEnded(false);
      return false;
    }
  }, [namespace, moduleName, supplyChain]);

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
      
      const result = await pactCallsSales(
        code,
        supplyChain,
        namespace,
        moduleName
      );

      // Check if signing failed
      if (result?.status === 'fail') {
        // Signing failed, don't show additional error as it's already shown in signAndSubmitTx
        return false;
      }

      if (result?.preflightResult?.result?.status === 'success') {
        const txKey = result.transactionDescriptor?.requestKey;
        
        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.DISTRIBUTE_TOKENS,
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
            // Check distribution status after successful distribution
            setTimeout(async () => {
              await checkDistributionStatus();
            }, 2000);
            
            // Increment distribution round in the backend
            try {
              await incrementDistributionRound(namespace, moduleName, { transactionKey: txKey });
              console.log('Distribution round incremented in backend');
            } catch (backendError) {
              console.error('Failed to increment distribution round in backend:', backendError);
              // Don't fail the whole operation for backend sync issues
            }
            
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
      
      // Don't show duplicate error if it's already a signing failure
      if (!isUserRejectionError(error)) {
        toast.error('Error distributing tokens');
      }
      
      return false;
    } finally {
      setIsDistributing(false);
    }
  }, [namespace, salesModuleName, supplyChain, moduleName, submitTransaction, createTransactionMetadata, transactionTypes, checkDistributionStatus]);

  const endSales = useCallback(async () => {
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
        namespace,
        moduleName
      );

      // Check if signing failed
      if (result?.status === 'fail') {
        // Signing failed, don't show additional error as it's already shown in signAndSubmitTx
        return false;
      }

      if (result?.preflightResult?.result?.status === 'success') {
        const txKey = result.transactionDescriptor?.requestKey;
        
        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.END_SALES,
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
            
            // Mark sales as ended in the backend
            try {
              await markSalesEnded(namespace, moduleName, { transactionKey: txKey });
              console.log('Sales ended status updated in backend');
            } catch (backendError) {
              console.error('Failed to update backend sales status:', backendError);
              // Don't fail the whole operation for backend sync issues
            }
            
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
      
      // Don't show duplicate error if it's already a signing failure
      if (!isUserRejectionError(error)) {
        toast.error('Error ending sales');
      }
      
      return false;
    } finally {
      setIsEndingSales(false);
    }
  }, [namespace, salesModuleName, supplyChain, moduleName, distributionComplete, submitTransaction, createTransactionMetadata, transactionTypes]);

  const initLiquidity = useCallback(async () => {
    if (!salesEnded) {
      toast.error('Please end the sales contract first');
      return false;
    }

    setIsInitializingLiquidity(true);
    try {
      const { account, pubKey } = useWalletStore.getState();
      const code = `(${namespace}.${moduleName}-treasury.init-liquidity)`;
      
      const result = await initLiquidityTreasury(
        `${namespace}.${moduleName}`,
        code,
        supplyChain,
        pubKey,
        account
      );

      // Check if signing failed
      if (result?.status === 'fail') {
        // Signing failed, don't show additional error as it's already shown in signAndSubmitTx
        return false;
      }

      if (result?.preflightResult?.result?.status === 'success') {
        const txKey = result.transactionDescriptor?.requestKey;
        
        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.INIT_LIQUIDITY,
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
            
            // Mark liquidity initialization as done in the backend
            try {
              await markInitLiquidityDone(namespace, moduleName, { transactionKey: txKey });
              console.log('Liquidity initialization status updated in backend');
            } catch (backendError) {
              console.error('Failed to update backend liquidity status:', backendError);
              // Don't fail the whole operation for backend sync issues
            }
            
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
      
      // Don't show duplicate error if it's already a signing failure
      if (!isUserRejectionError(error)) {
        toast.error('Error initializing liquidity');
      }
      
      return false;
    } finally {
      setIsInitializingLiquidity(false);
    }
  }, [namespace, moduleName, supplyChain, salesEnded, submitTransaction, createTransactionMetadata, transactionTypes]);

  return {
    isDistributing,
    isEndingSales,
    isInitializingLiquidity,
    distributionComplete,
    salesEnded,
    liquidityInitialized,
    distributionRoundsNeeded,
    distributionRoundCompleted,
    distributeTokens,
    endSales,
    initLiquidity,
    checkDistributionStatus,
    checkSalesStatus,
    checkLiquidityStatus,
    fetchDistributionRounds,
    checkBackendStatus
  };
};

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import usePresaleStore from '../store/usePresaleStore';
import useWalletStore from '../wallet/walletStore';
import { buyTokensSale, pactCalls } from '../pactcalls/kadena';
import useTransactionManager from '../hooks/useTransactionManager';
import { preciseMultiply, formatDecimal } from '../utils/decimalUtils';

const usePresaleLogic = (namespace, moduleName) => {
  const SALES_MODULE_NAME = `${moduleName}-sales`;
  const { account, pubKey } = useWalletStore();
  const { 
    submitTransaction, 
    createTransactionMetadata, 
    transactionTypes 
  } = useTransactionManager();

  // Presale store
  const {
    balance,
    phase0startTime,
    phase1startTime,
    salesEndTime,
    isWhitelisted,
    amountPerBatch,
    currentPrice,
    kdaInput,
    batchCount,
    tokenSymbol,
    salesAccount,
    availableBatches,
    totalSales,
    supplyChain,
    p0Price,
    p1Price,
    imageUrl,
    totalSupply,
    tokenName,
    contractNamespace,
    totalBatches,
    fetchBalance,
    fetchPhase0StartTime,
    fetchPhase1StartTime,
    fetchSalesEndTime,
    fetchAmountPerBatch,
    fetchTokenSymbol,
    fetchSalesAccount,
    fetchCurrentPrice,
    fetchWlStatus,
    fetchAvailableBatches,
    fetchTotalSales,
    fetchP0Price,
    fetchP1Price,
    fetchAllSalesData,
    startAutoRefresh,
    stopAutoRefresh,
    setBatchCount,
    setKdaInput,
    resetState,
    fetchUserPurchaseData,
    userPurchaseData,
    userBoughtBatches,
    userBoughtTokens,
    setUserBoughtTokens
  } = usePresaleStore();

  // Local state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeployer, setIsDeployer] = useState(false);
  const [isDeployerLoading, setIsDeployerLoading] = useState(false);
  const [showDeployerPanel, setShowDeployerPanel] = useState(false);

  // Helper function to safely render values that might be objects
  const safeRender = (value, fallback = 0) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object' && value !== null) {
      return value.int || value.decimal || value.bool || fallback;
    }
    return value;
  };

  // Calculate phase status
  const now = new Date();
  const isPreWl = phase0startTime ? now < phase0startTime : true;
  const isPhase0 = phase0startTime && phase1startTime ? now >= phase0startTime && now < phase1startTime : false;
  const isPhase1 = phase1startTime && salesEndTime ? now >= phase1startTime && now < salesEndTime : false;
  const isSaleEnded = salesEndTime ? now >= salesEndTime : false;

  // Phase info functions
  const getPhaseInfo = () => {
    if (isPreWl) return { phase: 'Pre-Sale', description: 'Whitelist opens soon', color: 'yellow' };
    if (isPhase0) return { phase: 'Phase 0', description: 'Whitelist Phase Active', color: 'blue' };
    if (isPhase1) return { phase: 'Phase 1', description: 'Public Sale Active', color: 'green' };
    if (isSaleEnded) return { phase: 'Ended', description: 'Sale has concluded', color: 'red' };
    return { phase: 'Loading', description: 'Loading phase data...', color: 'gray' };
  };

  const getCountdownLabel = () => {
    if (isPreWl) return 'Whitelist starts in';
    if (isPhase0) return 'Public sale starts in';
    if (isPhase1) return 'Sale ends in';
    return 'Sale ended';
  };

  // Initialize data on component mount and start auto-refresh
  useEffect(() => {
    if (!namespace || !moduleName) {
      console.log('Missing namespace or moduleName:', { namespace, moduleName });
      return;
    }

    console.log('Starting data fetch with params:', { 
      account, 
      namespace, 
      moduleName, 
      SALES_MODULE_NAME, 
      supplyChain, 
      pubKey 
    });

    const initializeData = async () => {
      try {
        await fetchAllSalesData(namespace, moduleName, SALES_MODULE_NAME, supplyChain);
        console.log('All sales data fetched successfully using consolidated approach');
        
        if (account && pubKey) {
          await Promise.all([
            fetchBalance(account, supplyChain),
            fetchWlStatus(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey),
            fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey),
            fetchUserPurchaseData(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey)
          ]);
          console.log('Account data fetched successfully');
        }

        startAutoRefresh(namespace, moduleName, SALES_MODULE_NAME, supplyChain, account, pubKey, 30000);
        
      } catch (error) {
        console.error('Error fetching consolidated sales data:', error);
        try {
          console.log('Falling back to individual fetch calls...');
          await fetchTokenSymbol(namespace, moduleName, supplyChain);
          await fetchPhase0StartTime(namespace, SALES_MODULE_NAME, supplyChain);
          await fetchPhase1StartTime(namespace, SALES_MODULE_NAME, supplyChain);
          await fetchSalesEndTime(namespace, SALES_MODULE_NAME, supplyChain);
          await fetchAmountPerBatch(namespace, SALES_MODULE_NAME, supplyChain);
          await fetchCurrentPrice(namespace, SALES_MODULE_NAME, supplyChain);
          await fetchSalesAccount(namespace, SALES_MODULE_NAME, supplyChain);
          await fetchP0Price(namespace, SALES_MODULE_NAME, supplyChain);
          await fetchP1Price(namespace, SALES_MODULE_NAME, supplyChain);
          await fetchTotalSales(namespace, SALES_MODULE_NAME, supplyChain);
          
          if (account && pubKey) {
            await fetchBalance(account, supplyChain);
            await fetchWlStatus(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
            await fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
            await fetchUserPurchaseData(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
          }
          
          startAutoRefresh(namespace, moduleName, SALES_MODULE_NAME, supplyChain, account, pubKey, 30000);
          console.log('Fallback data fetched successfully');
        } catch (fallbackError) {
          console.error('Error fetching basic data with fallback:', fallbackError);
        }
      }
    };

    initializeData();

    return () => {
      stopAutoRefresh();
      resetState();
    };
  }, [account, namespace, moduleName, pubKey, supplyChain, SALES_MODULE_NAME,
      fetchAmountPerBatch, fetchAvailableBatches, fetchBalance, fetchCurrentPrice, 
      fetchP0Price, fetchP1Price, fetchPhase0StartTime, fetchPhase1StartTime, 
      fetchSalesAccount, fetchSalesEndTime, fetchTokenSymbol, fetchTotalSales, 
      fetchWlStatus, fetchAllSalesData, startAutoRefresh, stopAutoRefresh, resetState, setBatchCount, fetchUserPurchaseData]);

  // Check deployer status when wallet connects
  useEffect(() => {
    const checkDeployerStatus = async () => {
      if (!pubKey || !namespace) {
        setIsDeployer(false);
        return;
      }

      try {
        setIsDeployerLoading(true);
        const code = `(describe-keyset "${namespace}.gov")`;
        const result = await pactCalls(code, supplyChain);
        
        if (result && result.result && result.result.status === 'success') {
          const keysetData = result.result.data;
          if (keysetData && keysetData.keys && Array.isArray(keysetData.keys)) {
            const isDeployerWallet = keysetData.keys.includes(pubKey);
            setIsDeployer(isDeployerWallet);
          } else {
            setIsDeployer(false);
          }
        } else {
          setIsDeployer(false);
        }
      } catch (error) {
        console.error('Error checking deployer status:', error);
        setIsDeployer(false);
      } finally {
        setIsDeployerLoading(false);
      }
    };

    checkDeployerStatus();
  }, [pubKey, namespace, supplyChain]);

  // Calculate kdaInput based on batchCount and currentPrice
  useEffect(() => {
    const calculatedAmount = preciseMultiply(batchCount || 0, currentPrice || 0);
    setKdaInput(formatDecimal(calculatedAmount));
  }, [batchCount, currentPrice, setKdaInput]);

  // Recalculate user bought tokens when amountPerBatch changes
  useEffect(() => {
    if (userBoughtBatches > 0 && amountPerBatch) {
      const calculatedTokens = preciseMultiply(userBoughtBatches, amountPerBatch);
      const formatted = formatDecimal(calculatedTokens);
      setUserBoughtTokens(formatted);
    }
  }, [userBoughtBatches, amountPerBatch, setUserBoughtTokens]);

  // Computed value for display - always calculate fresh to avoid precision issues
  const userBoughtTokensDisplay = userBoughtBatches > 0 && amountPerBatch 
    ? (() => {
        const calculated = preciseMultiply(userBoughtBatches, amountPerBatch);
        const formatted = formatDecimal(calculated);
        // Remove .0 for whole numbers for display
        return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
      })()
    : userBoughtTokens;

  // Update current price based on phase
  useEffect(() => {
    if (isPhase0 && p0Price) {
      if (currentPrice !== p0Price) {
        console.log('Current phase: Phase 0, using P0 price:', p0Price);
      }
    } else if (isPhase1 && p1Price) {
      if (currentPrice !== p1Price) {
        console.log('Current phase: Phase 1, using P1 price:', p1Price);
      }
    }
  }, [isPhase0, isPhase1, p0Price, p1Price, currentPrice]);

  // Update countdown
  useEffect(() => {
    if (!phase0startTime && !phase1startTime && !salesEndTime) return;

    const updateCountdown = () => {
      const now = new Date();
      let targetTime;

      if (now < phase0startTime) {
        targetTime = phase0startTime;
      } else if (now < phase1startTime) {
        targetTime = phase1startTime;
      } else if (now < salesEndTime) {
        targetTime = salesEndTime;
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const timeDiff = targetTime - now;
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [phase0startTime, phase1startTime, salesEndTime]);

  // Buy tokens handler
  const handleBuy = async () => {
    try {
      setIsLoading(true);
      
      const amount = parseFloat(kdaInput);
      
      if (!amount || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (amount > balance) {
        toast.error('Insufficient KDA balance');
        return;
      }

      toast.info('Submitting transaction...', { position: 'top-center', autoClose: 2000 });
      const code = `(${namespace}.${SALES_MODULE_NAME}.buy "${account}" (read-keyset 'ks) ${batchCount})`;
      const result = await buyTokensSale(code, supplyChain, salesAccount, amount);
      
      if (result?.preflightResult?.result?.status === 'success') {
        const txKey = result.transactionDescriptor?.requestKey;

        const metadata = createTransactionMetadata(
          transactionTypes.BUY_TOKENS,
          `Purchase ${batchCount} batches for ${amount} KDA`,
          {
            amount: amount,
            batchCount: batchCount,
            pricePerBatch: currentPrice,
            token: tokenSymbol,
            buyer: account,
            chainId: supplyChain,
            namespace,
            moduleName,
          }
        );

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
            try {
              await Promise.all([
                fetchUserPurchaseData(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey),
                fetchBalance(account, supplyChain),
                fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey)
              ]);
            } catch (refreshError) {
              console.error('Error refreshing data after purchase:', refreshError);
            }
          }
        } catch (pollError) {
          console.error('Transaction polling error:', pollError);
        }
      } else {
        toast.error('Transaction submission failed', { position: 'top-center' });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(`Purchase failed: ${error.message}`, { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  // Deployer access handler
  const handleDeployerAccess = async () => {
    if (!pubKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isDeployer) {
      toast.error('You are not the deployer of this token. Please use the wallet that deployed this token.');
      return;
    }
    
    setShowDeployerPanel(true);
  };

  return {
    // Store data
    balance,
    phase0startTime,
    phase1startTime,
    salesEndTime,
    isWhitelisted,
    amountPerBatch,
    currentPrice,
    kdaInput,
    batchCount,
    tokenSymbol,
    salesAccount,
    availableBatches,
    totalSales,
    supplyChain,
    p0Price,
    p1Price,
    imageUrl,
    totalSupply,
    tokenName,
    contractNamespace,
    totalBatches,
    userPurchaseData,
    userBoughtBatches,
    userBoughtTokens,
    userBoughtTokensDisplay,
    
    // Local state
    countdown,
    isLoading,
    isDeployer,
    isDeployerLoading,
    showDeployerPanel,
    
    // Computed values
    isPreWl,
    isPhase0,
    isPhase1,
    isSaleEnded,
    
    // Functions
    safeRender,
    getPhaseInfo,
    getCountdownLabel,
    handleBuy,
    handleDeployerAccess,
    setBatchCount,
    setShowDeployerPanel,
    
    // Store functions
    account,
    pubKey
  };
};

export default usePresaleLogic;

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Rocket, Shield, Clock, TrendingUp, Users, DollarSign, Info, Database, Link, Layers, Settings, History } from 'lucide-react';
import usePresaleStore from '../../store/usePresaleStore';
import useWalletStore from '../../wallet/walletStore';
import { useWalletConnectClient } from '../../wallet/providers/ClientContextProvider';
import { buyTokensSale, pactCalls } from '../../pactcalls/kadena';
import useTransactionManager from '../../hooks/useTransactionManager';
import { toast } from 'react-toastify';
import { addComma } from '../../utils/numberUtils';
import WalletConnectButton from '../WalletConnectButton';
import DeployerPanel from './DeployerPanel';
import SalesProgressBar from '../SalesProgressBar';

const PresaleView = ({ namespace, moduleName }) => {
  const SALES_MODULE_NAME = `${moduleName}-sales`;
  const { client, session } = useWalletConnectClient();
  const { account, pubKey } = useWalletStore();
  const { 
    submitTransaction, 
    createTransactionMetadata, 
    transactionTypes 
  } = useTransactionManager();

  // console.log('PresaleView rendering with:', { namespace, moduleName, SALES_MODULE_NAME, account, pubKey });

  // Helper function to safely render values that might be objects
  const safeRender = (value, fallback = 0) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object' && value !== null) {
      // console.warn('Attempted to render object:', value);
      // Try to extract value from Pact object
      return value.int || value.decimal || value.bool || fallback;
    }
    return value;
  };

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

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Deployer panel states
  const [isDeployer, setIsDeployer] = useState(false);
  const [isDeployerLoading, setIsDeployerLoading] = useState(false);
  const [showDeployerPanel, setShowDeployerPanel] = useState(false);

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

    // Initial data fetch using consolidated approach
    const initializeData = async () => {
      try {
        // Use the new consolidated function to get all data in one call
        await fetchAllSalesData(namespace, moduleName, SALES_MODULE_NAME, supplyChain);
        console.log('All sales data fetched successfully using consolidated approach');
        
        // Fetch account-specific data if account and pubKey are available
        if (account && pubKey) {
          await Promise.all([
            fetchBalance(account, supplyChain),
            fetchWlStatus(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey),
            fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey),
            fetchUserPurchaseData(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey)
          ]);
          console.log('Account data fetched successfully');
        }

        // Start auto-refresh after initial data is loaded
        // Refresh every 30 seconds (30000ms) - you can adjust this interval
        startAutoRefresh(namespace, moduleName, SALES_MODULE_NAME, supplyChain, account, pubKey, 30000);
        
      } catch (error) {
        console.error('Error fetching consolidated sales data:', error);
        // Fallback to individual calls if consolidated approach fails
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
          
          // Fetch account-specific data if available
          if (account && pubKey) {
            await fetchBalance(account, supplyChain);
            await fetchWlStatus(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
            await fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
            await fetchUserPurchaseData(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
          }
          
          // Start auto-refresh even with fallback
          startAutoRefresh(namespace, moduleName, SALES_MODULE_NAME, supplyChain, account, pubKey, 30000);
          console.log('Fallback data fetched successfully');
        } catch (fallbackError) {
          console.error('Error fetching basic data with fallback:', fallbackError);
        }
      }
    };

    initializeData();

    return () => {
      // Stop auto-refresh and reset state when component unmounts
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

  // Calculate phase status (needs to be before useEffects that depend on it)
  const now = new Date();
  const isPreWl = phase0startTime ? now < phase0startTime : true;
  const isPhase0 = phase0startTime && phase1startTime ? now >= phase0startTime && now < phase1startTime : false;
  const isPhase1 = phase1startTime && salesEndTime ? now >= phase1startTime && now < salesEndTime : false;
  const isSaleEnded = salesEndTime ? now >= salesEndTime : false;

  // Calculate kdaInput based on batchCount and currentPrice
  useEffect(() => {
    const calculatedAmount = (batchCount || 0) * (currentPrice || 0);
    // Round to 6 decimal places to avoid floating point precision issues
    setKdaInput(Math.round(calculatedAmount * 1000000) / 1000000);
  }, [batchCount, currentPrice, setKdaInput]);

  // Recalculate user bought tokens when amountPerBatch changes
  useEffect(() => {
    if (userBoughtBatches > 0 && amountPerBatch) {
      setUserBoughtTokens(userBoughtBatches * amountPerBatch);
    }
  }, [userBoughtBatches, amountPerBatch, setUserBoughtTokens]);


  // Update current price based on phase
  useEffect(() => {
    if (isPhase0 && p0Price) {
      // Use phase 0 price for whitelist phase
      if (currentPrice !== p0Price) {
        // Would need setCurrentPrice function to update this
        console.log('Current phase: Phase 0, using P0 price:', p0Price);
      }
    } else if (isPhase1 && p1Price) {
      // Use phase 1 price for public phase
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

      // Step 1: Submit transaction
      toast.info('Submitting transaction...', { position: 'top-center', autoClose: 2000 });
      const code = `(${namespace}.${SALES_MODULE_NAME}.buy "${account}" (read-keyset 'ks) ${batchCount})`;
      const result = await buyTokensSale(code, supplyChain, salesAccount, amount, client, session, namespace, moduleName);
      
      if (result?.preflightResult?.result?.status === 'success') {
        const txKey = result.transactionDescriptor?.requestKey;

        // Create transaction metadata
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
            // Manually refresh user purchase data and balance for immediate UI update
            try {
              await Promise.all([
                fetchUserPurchaseData(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey),
                fetchBalance(account, supplyChain),
                fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey)
              ]);
            } catch (refreshError) {
              console.error('Error refreshing data after purchase:', refreshError);
              // Don't show error to user as auto-refresh will handle it
            }
            // The auto-refresh will continue to keep data updated
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

  // Deployer functions
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

  const phaseInfo = getPhaseInfo();

  return (
    <div className="min-h-screen bg-primary-bg pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="w-8 h-8 text-accent-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              {tokenSymbol} Presale
            </h1>
          </div>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Join the {tokenSymbol} token presale and be part of the next generation of token Sales on Kadena.
          </p>
        </div>

        {/* Token Details Card */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Token Logo */}
            <div className="flex-shrink-0">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={`${tokenSymbol} Logo`}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-accent-primary/20"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-accent-primary/20 bg-accent-primary/10 flex items-center justify-center">
                  <span className="text-accent-primary font-bold text-xl">{tokenSymbol?.charAt(0)}</span>
                </div>
              )}
            </div>
            
            {/* Token Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-2">
                {tokenName || moduleName} ({tokenSymbol})
              </h2>
            </div>
          </div>
        </div>

        {/* Phase Status Card */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                phaseInfo.color === 'green' ? 'bg-green-500/20 border border-green-500/30' :
                phaseInfo.color === 'blue' ? 'bg-blue-500/20 border border-blue-500/30' :
                phaseInfo.color === 'yellow' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                phaseInfo.color === 'red' ? 'bg-red-500/20 border border-red-500/30' :
                'bg-gray-500/20 border border-gray-500/30'
              }`}>
                <Clock className={`w-6 h-6 ${
                  phaseInfo.color === 'green' ? 'text-green-400' :
                  phaseInfo.color === 'blue' ? 'text-blue-400' :
                  phaseInfo.color === 'yellow' ? 'text-yellow-400' :
                  phaseInfo.color === 'red' ? 'text-red-400' :
                  'text-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-text">{phaseInfo.phase}</h3>
                <p className="text-secondary">{phaseInfo.description}</p>
              </div>
            </div>
            
            {!isSaleEnded && (
              <div className="text-center">
                <p className="text-sm text-secondary mb-2">{getCountdownLabel()}</p>
                <div className="flex gap-2 text-lg font-mono">
                  <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                    {countdown.days}d
                  </span>
                  <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                    {countdown.hours}h
                  </span>
                  <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                    {countdown.minutes}m
                  </span>
                  <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                    {countdown.seconds}s
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Token Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Stats */}
            <div className="card">
              <h3 className="text-xl font-semibold text-primary-text mb-6">Token Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-accent-primary mx-auto mb-2" />
                  <p className="text-sm text-secondary">Current Price</p>
                  <p className="text-lg font-semibold text-primary-text">
                    {currentPrice ? `${safeRender(currentPrice)} KDA` : 'Loading...'}
                  </p>
                </div>
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary">Total Batches Sold</p>
                  <p className="text-lg font-semibold text-primary-text">
                    {totalSales ? `${addComma(safeRender(totalSales))}` : 'Loading...'}
                  </p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary">Tokens per Batch</p>
                  <p className="text-lg font-semibold text-primary-text">
                    {amountPerBatch ? addComma(safeRender(amountPerBatch)) : 'Loading...'}
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary">Available Batches</p>
                  <p className="text-lg font-semibold text-primary-text">
                    {availableBatches !== null ? safeRender(availableBatches) : 'Loading...'}
                  </p>
                </div>
              </div>
              
              {/* Additional Token Information */}
              <div className="mt-8 pt-6 border-t border-border-color">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Database className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary">Total Supply</p>
                    <p className="text-lg font-semibold text-primary-text">
                      {totalSupply ? `${addComma(safeRender(totalSupply))} ${tokenSymbol}` : 'Loading...'}
                    </p>
                  </div>
                  <div className="text-center">
                    <Link className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary">Contract Address</p>
                    <p className="text-sm font-mono text-primary-text break-all">
                      {contractNamespace || namespace}.{moduleName}
                    </p>
                  </div>
                  <div className="text-center">
                    <Layers className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary">Supply Chain</p>
                    <p className="text-lg font-semibold text-primary-text">
                      Chain {supplyChain}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Progress */}
            <div className="card">
              <h3 className="text-xl font-semibold text-primary-text mb-6">Sales Progress</h3>
              
              {/* Tokens Progress */}
              {amountPerBatch && totalBatches > 0 && (
                <SalesProgressBar 
                  soldTokens={(totalSales || 0) * amountPerBatch}
                  totalTokens={totalBatches * amountPerBatch}
                  size="large"
                  title="Tokens Sold"
                />
              )}
              
              {/* Fallback message if no data */}
              {(!totalBatches || totalBatches <= 0 || !amountPerBatch) && (
                <div className="text-center py-8">
                  <p className="text-secondary">Sales progress data will appear here once the presale begins.</p>
                </div>
              )}
            </div>

            {/* Phase Pricing */}
            <div className="card">
              <h3 className="text-xl font-semibold text-primary-text mb-6">Phase Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">Phase 0 (Whitelist)</h4>
                  <p className="text-2xl font-bold text-primary-text">
                    {p0Price ? `${safeRender(p0Price)} KDA` : 'Loading...'}
                  </p>
                  <p className="text-sm text-secondary">per batch</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">Phase 1 (Public)</h4>
                  <p className="text-2xl font-bold text-primary-text">
                    {p1Price ? `${safeRender(p1Price)} KDA` : 'Loading...'}
                  </p>
                  <p className="text-sm text-secondary">per batch</p>
                </div>
              </div>
            </div>

            {/* Whitelist Status */}
            {isPhase0 && (
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-primary-text">Whitelist Status</h3>
                </div>
                <div className={`p-4 rounded-lg border ${
                  isWhitelisted 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-yellow-500/10 border-yellow-500/20'
                }`}>
                  <p className={`font-semibold ${
                    isWhitelisted ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {isWhitelisted ? '✅ You are whitelisted!' : '⏳ Not whitelisted'}
                  </p>
                  <p className="text-sm text-secondary mt-1">
                    {isWhitelisted 
                      ? 'You can participate in the Phase 0 presale at the discounted price.'
                      : 'You can participate in Phase 1 public sale.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Purchase & Actions */}
          <div className="space-y-6">
            {/* Purchase Card */}
            {(isPhase0 || isPhase1) && !isSaleEnded && (
              <div className="card border-2 border-accent-primary/30 bg-accent-primary/5">
                <h3 className="text-2xl font-bold text-accent-primary mb-6 text-center">Purchase Tokens</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Your KDA Balance
                    </label>
                    <p className="text-lg font-semibold text-primary-text">
                      {balance ? `${addComma(safeRender(balance))} KDA` : !account ? 'Connect Wallet' : 'Loading...'}
                    </p>
                  </div>

                  {/* Enhanced Batch Input */}
                  <div className="p-4 bg-accent-primary/10 border-2 border-accent-primary/40 rounded-lg">
                    <label className="block text-lg font-bold text-accent-primary mb-3 text-center">
                      Batches to Buy
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={safeRender(availableBatches)}
                      value={batchCount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        
                        if (value === '') {
                          setBatchCount(0);
                        } else {
                          const numValue = parseInt(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setBatchCount(numValue);
                          }
                        }
                      }}
                      className="w-full px-4 py-3 text-xl font-bold text-center bg-white/10 border-2 border-accent-primary/50 rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
                      placeholder="Number of batches"
                    />
                    <p className="text-sm text-secondary text-center mt-2">
                      Available: <span className="text-accent-primary font-semibold">{safeRender(availableBatches)} batches</span>
                    </p>
                  </div>

                  <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary">Total Cost:</span>
                      <span className="text-primary-text font-semibold">
                        {addComma(safeRender(kdaInput))} KDA
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">You&apos;ll receive:</span>
                      <span className="text-accent-primary font-semibold">
                        {addComma(safeRender(amountPerBatch) * batchCount)} {tokenSymbol}
                      </span>
                    </div>
                  </div>

                  {!account ? (
                    <div className="w-full">
                      <WalletConnectButton />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuy()}
                      disabled={isLoading || availableBatches <= 0 || !batchCount || batchCount <= 0}
                      className="w-full btn btn-primary"
                    >
                      {isLoading ? 'Processing...' : `Buy ${tokenSymbol} Tokens`}
                    </button>
                  )}

                  {/* Whitelist status messages */}
                  {isPhase0 && (
                    <>
                      {/* User has bought all their whitelist allocation */}
                      {!isWhitelisted && userBoughtBatches > 0 && availableBatches === 0 && (
                        <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <Info className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-green-400 font-semibold mb-1">
                              ✅ Whitelist Allocation Complete!
                            </p>
                            <p className="text-sm text-green-400/80">
                              You have bought all your whitelisted tokens. You can now participate in Phase 1 public sale.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* User is not whitelisted and hasn't bought any tokens */}
                      {!isWhitelisted && userBoughtBatches === 0 && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-400">
                            You&apos;re not whitelisted for Phase 0. Wait for Phase 1 public sale.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Purchase History Card */}
            {account && (
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <History className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-primary-text">Your Purchases</h3>
                </div>
                
                {userBoughtBatches > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-secondary mb-1">Batches Bought</p>
                          <p className="text-xl font-bold text-blue-400">
                            {addComma(safeRender(userBoughtBatches))}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-secondary mb-1">Tokens Purchased</p>
                          <p className="text-xl font-bold text-primary-text">
                            {addComma(safeRender(userBoughtTokens))} {tokenSymbol}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Info className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-400">
                        Tokens will be distributed after presale ends.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
                    <p className="text-secondary mb-2">No purchases yet</p>
                    <p className="text-sm text-secondary">
                      {(isPhase0 || isPhase1) && !isSaleEnded 
                        ? 'Purchase tokens to see history here.'
                        : 'Presale not currently active.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Deployer Dashboard Access */}
            {account && isDeployer && (
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-primary-text">Deployer Access</h3>
                </div>
                <p className="text-secondary text-sm mb-4">
                  Access deployer panel to manage sales and treasury functions.
                </p>
                <button
                  onClick={handleDeployerAccess}
                  disabled={isDeployerLoading}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  {isDeployerLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Access Deployer Panel
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deployer Panel Modal */}
      {showDeployerPanel && (
        <DeployerPanel
          setDeployerPanel={setShowDeployerPanel}
          tokenSymbol={tokenSymbol}
          countdown={countdown}
          namespace={namespace}
          moduleName={moduleName}
          supplyChain={supplyChain}
        />
      )}
    </div>
  );
};

PresaleView.propTypes = {
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
};

export default PresaleView;

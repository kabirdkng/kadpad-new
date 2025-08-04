import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Rocket, Shield, Clock, TrendingUp, Users, DollarSign, Info } from 'lucide-react';
import usePresaleStore from '../../store/usePresaleStore';
import useWalletStore from '../../wallet/walletStore';
import { useWalletConnectClient } from '../../wallet/providers/ClientContextProvider';
import { buyTokensSale } from '../../pactcalls/kadena';
import { toast } from 'react-toastify';
import { addComma } from '../../utils/numberUtils';
import BuyModal from './BuyModal';

const PresaleView = ({ namespace, moduleName }) => {
  const SALES_MODULE_NAME = `${moduleName}-sales`;
  const { client, session } = useWalletConnectClient();
  const { account, pubKey } = useWalletStore();

  console.log('PresaleView rendering with:', { namespace, moduleName, SALES_MODULE_NAME, account, pubKey });

  // Helper function to safely render values that might be objects
  const safeRender = (value, fallback = 0) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object' && value !== null) {
      console.warn('Attempted to render object:', value);
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
    setBatchCount,
    setKdaInput,
    resetState
  } = usePresaleStore();

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [reqKey, setReqKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize data on component mount
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

    // Fetch basic public data first (doesn't need pubKey or account)
    const fetchBasicData = async () => {
      try {
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
        
        console.log('Basic data fetched successfully');
      } catch (error) {
        console.error('Error fetching basic data:', error);
      }
    };

    // Fetch account-specific data only if account and pubKey are available
    const fetchAccountData = async () => {
      if (account && pubKey) {
        try {
          await fetchBalance(account, supplyChain);
          await fetchWlStatus(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
          await fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
          
          console.log('Account data fetched successfully');
        } catch (error) {
          console.error('Error fetching account data:', error);
        }
      }
    };

    fetchBasicData();
    fetchAccountData();

    return () => {
      resetState();
    };
  }, [account, namespace, moduleName, pubKey, supplyChain, SALES_MODULE_NAME,
      fetchAmountPerBatch, fetchAvailableBatches, fetchBalance, fetchCurrentPrice, 
      fetchP0Price, fetchP1Price, fetchPhase0StartTime, fetchPhase1StartTime, 
      fetchSalesAccount, fetchSalesEndTime, fetchTokenSymbol, fetchTotalSales, 
      fetchWlStatus, resetState, setBatchCount]);

  // Calculate phase status (needs to be before useEffects that depend on it)
  const now = new Date();
  const isPreWl = phase0startTime ? now < phase0startTime : true;
  const isPhase0 = phase0startTime && phase1startTime ? now >= phase0startTime && now < phase1startTime : false;
  const isPhase1 = phase1startTime && salesEndTime ? now >= phase1startTime && now < salesEndTime : false;
  const isSaleEnded = salesEndTime ? now >= salesEndTime : false;

  // Calculate kdaInput based on batchCount and currentPrice
  useEffect(() => {
    setKdaInput((batchCount || 1) * (currentPrice || 0));
  }, [batchCount, currentPrice, setKdaInput]);

  // Initialize batchCount to 1 if it's 0
  useEffect(() => {
    if (batchCount === 0) {
      setBatchCount(1);
    }
  }, [batchCount, setBatchCount]);

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

      const code = `(${namespace}.${SALES_MODULE_NAME}.buy "${account}" (read-keyset 'ks) ${batchCount})`;
      const result = await buyTokensSale(code, supplyChain, salesAccount, amount, client, session);
      
      if (result?.preflightResult?.result?.status === 'success') {
        setReqKey(result.txKey);
        toast.success('Purchase successful!');
        setShowBuyModal(false);
        // Refresh data
        await fetchBalance(account, supplyChain);
        await fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
        await fetchTotalSales(namespace, SALES_MODULE_NAME, supplyChain);
      } else {
        toast.error('Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(`Purchase failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
            Join the {tokenSymbol} token presale and be part of the next generation of DeFi innovation on Kadena.
          </p>
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
                  <p className="text-sm text-secondary">Total Raised</p>
                  <p className="text-lg font-semibold text-primary-text">
                    {totalSales ? `${addComma(safeRender(totalSales))} KDA` : 'Loading...'}
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
              <div className="card">
                <h3 className="text-xl font-semibold text-primary-text mb-6">Purchase Tokens</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Your KDA Balance
                    </label>
                    <p className="text-lg font-semibold text-primary-text">
                      {balance ? `${addComma(safeRender(balance))} KDA` : 'Loading...'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Batches to Buy
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={safeRender(availableBatches)}
                      value={batchCount}
                      onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
                    />
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

                  <button
                    onClick={() => handleBuy()}
                    disabled={isLoading || !account || availableBatches <= 0}
                    className="w-full btn btn-primary"
                  >
                    {isLoading ? 'Processing...' : `Buy ${tokenSymbol} Tokens`}
                  </button>

                  {(!isPhase0 || !isWhitelisted) && isPhase0 && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-400">
                        You&apos;re not whitelisted for Phase 0. Wait for Phase 1 public sale.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deployer Dashboard Access */}

            {/* Transaction Status */}
            {reqKey && (
              <div className="card">
                <h3 className="text-lg font-semibold text-primary-text mb-4">Recent Transaction</h3>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 mb-2">Transaction submitted!</p>
                  <a
                    href={`https://explorer.chainweb.com/testnet/tx/${reqKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 break-all"
                  >
                    View on Explorer →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showBuyModal && (
          <BuyModal
            tokenSymbol={tokenSymbol}
            batchCount={batchCount}
            amountPerBatch={amountPerBatch}
            kdaInput={kdaInput}
            handleBuy={handleBuy}
            setShowBuyModal={setShowBuyModal}
            availableBatches={availableBatches}
          />
        )}
      </div>
    </div>
  );
};

PresaleView.propTypes = {
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
};

export default PresaleView;

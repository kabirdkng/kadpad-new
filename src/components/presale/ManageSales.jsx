import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Users, Plus, RefreshCw, Clipboard, Settings, DollarSign } from 'lucide-react';
import usePresaleStore from '../../store/usePresaleStore';
import useWalletStore from '../../wallet/walletStore';
import { pactCalls, pactCallsSales, pollForTransactionResult } from '../../pactcalls/kadena';
import { toast } from 'react-toastify';
import { useWalletConnectClient } from '../../wallet/providers/ClientContextProvider';
import { addComma } from '../../utils/numberUtils';

const ManageSales = ({ 
  tokenSymbol, 
  namespace, 
  moduleName, 
  supplyChain,
  reqKey,
  setReqKey,
  transactionStatus,
  setTransactionStatus,
  transactionMessage,
  setTransactionMessage
}) => {
  const SALES_MODULE_NAME = `${moduleName}-sales`;
  const { pubKey } = useWalletStore();
  const { client, session } = useWalletConnectClient();
  const { 
    salesEndTime, 
    phase0startTime, 
    phase1startTime, 
    p0Price, 
    p1Price,
    fetchP0Price,
    fetchP1Price
  } = usePresaleStore();

  // Helper function to safely render values
  const safeRender = (value, fallback = 0) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object' && value !== null) {
      return value.int || value.decimal || value.bool || fallback;
    }
    return value;
  };

  const [showPriceChange, setShowPriceChange] = useState(false);
  const [newP0Price, setNewP0Price] = useState(safeRender(p0Price));
  const [newP1Price, setNewP1Price] = useState(safeRender(p1Price));
  const [priceResult, setPriceResult] = useState(null);
  const [availableToWhitelist, setAvailableToWhitelist] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [counters, setCounters] = useState({ sold: null, reserved: null });
  const [reservations, setReservations] = useState([]);
  const [whitelistForm, setWhitelistForm] = useState(false);
  const [reservationList, setReservationList] = useState(false);
  const [walletsToWhitelist, setWalletsToWhitelist] = useState([]);
  const [newWallet, setNewWallet] = useState('');
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [isWhitelisting, setIsWhitelisting] = useState(false);

  const now = new Date();
  const isPreWl = now < phase0startTime;
  const isPhase0 = now >= phase0startTime && now < phase1startTime;
  const isPhase1 = now >= phase1startTime && now < salesEndTime;

  const handlePrices = () => {
    setPriceResult(null);
    setShowPriceChange(true);
  };

  const showWhiteListForm = () => {
    setWhitelistForm(true);
    setReservationList(false);
  };

  const showReservationList = () => {
    setReservationList(true);
    setWhitelistForm(false);
  };

  const updatePrices = async () => {
    try {
      setIsUpdatingPrices(true);
      if (setTransactionStatus) {
        setTransactionStatus('');
        setTransactionMessage('');
        setReqKey && setReqKey('');
      }
      
      // Convert prices to decimal format for the module
      const formatPriceForPact = (price) => {
        const numPrice = parseFloat(price);
        // Ensure it has at least one decimal place
        return numPrice % 1 === 0 ? `${numPrice}.0` : numPrice.toString();
      };
      
      const formattedP0Price = formatPriceForPact(newP0Price);
      const formattedP1Price = formatPriceForPact(newP1Price);
      
      toast.info('Submitting price update...', { position: 'top-center', autoClose: 2000 });
      const code = `(${namespace}.${SALES_MODULE_NAME}.set-price "phase-0" ${formattedP0Price}) (${namespace}.${SALES_MODULE_NAME}.set-price "phase-1" ${formattedP1Price})`;
      const res = await pactCallsSales(code, supplyChain, client, session, namespace, moduleName);
      
      if (res?.preflightResult?.result?.status === 'success') {
        const txKey = res.transactionDescriptor?.requestKey;
        if (setReqKey && txKey) {
          setReqKey(txKey);
          setTransactionStatus && setTransactionStatus('pending');
          setTransactionMessage && setTransactionMessage('Price update submitted, waiting for confirmation...');
        }
        
        setPriceResult('Prices updated successfully!');
        setShowPriceChange(false);
        
        toast.info('Transaction submitted! Waiting for confirmation...', { 
          position: 'top-center', 
          autoClose: 3000 
        });

        try {
          // Poll for the transaction result
          const finalResult = await pollForTransactionResult(
            res.pactClient, 
            res.transactionDescriptor,
            30, // maxRetries
            3000 // retryInterval (3 seconds)
          );

          if (finalResult?.result?.status === 'success') {
            setTransactionStatus && setTransactionStatus('success');
            setTransactionMessage && setTransactionMessage('Prices updated successfully!');
            toast.success('Prices updated successfully!', { 
              position: 'top-center',
              autoClose: 5000 
            });
            
            // Refresh prices
            await fetchP0Price(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
            await fetchP1Price(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
          } else {
            setTransactionStatus && setTransactionStatus('error');
            setTransactionMessage && setTransactionMessage(finalResult?.result?.error?.message || 'Price update failed');
            toast.error(`Price update failed: ${finalResult?.result?.error?.message || 'Unknown error'}`, {
              position: 'top-center',
              autoClose: 5000
            });
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
          setTransactionStatus && setTransactionStatus('error');
          setTransactionMessage && setTransactionMessage('Transaction status unknown - please check explorer');
          toast.warning('Transaction submitted but confirmation timed out. Please check the explorer for status.', {
            position: 'top-center',
            autoClose: 7000
          });
        }
      } else {
        setTransactionStatus && setTransactionStatus('error');
        setTransactionMessage && setTransactionMessage('Price update submission failed');
        toast.error('Price update submission failed');
      }
    } catch (error) {
      console.error('Error updating prices:', error);
      setTransactionStatus && setTransactionStatus('error');
      setTransactionMessage && setTransactionMessage(`Price update failed: ${error.message}`);
      toast.error('Failed to update prices');
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const WhitelistAddresses = async () => {
    try {
      setIsWhitelisting(true);
      if (setTransactionStatus) {
        setTransactionStatus('');
        setTransactionMessage('');
        setReqKey && setReqKey('');
      }
      
      const walletList = walletsToWhitelist.map(
        (wallet) => `(reserve-batch "${wallet}")`
      );
      
      toast.info('Submitting whitelist transaction...', { position: 'top-center', autoClose: 2000 });
      const code = `(use ${namespace}.${SALES_MODULE_NAME}) ${walletList.join(' ')}`;
      const res = await pactCallsSales(code, supplyChain, client, session, namespace, moduleName);
      
      if (res?.preflightResult?.result?.status === 'success') {
        const txKey = res.transactionDescriptor?.requestKey;
        if (setReqKey && txKey) {
          setReqKey(txKey);
          setTransactionStatus && setTransactionStatus('pending');
          setTransactionMessage && setTransactionMessage('Whitelist transaction submitted, waiting for confirmation...');
        }
        
        toast.info('Transaction submitted! Waiting for confirmation...', { 
          position: 'top-center', 
          autoClose: 3000 
        });

        try {
          // Poll for the transaction result
          const finalResult = await pollForTransactionResult(
            res.pactClient, 
            res.transactionDescriptor,
            30, // maxRetries
            3000 // retryInterval (3 seconds)
          );

          if (finalResult?.result?.status === 'success') {
            setTransactionStatus && setTransactionStatus('success');
            setTransactionMessage && setTransactionMessage('Addresses whitelisted successfully!');
            toast.success('Addresses whitelisted successfully!', { 
              position: 'top-center',
              autoClose: 5000 
            });
            
            setWalletsToWhitelist([]);
            await getCounters();
          } else {
            setTransactionStatus && setTransactionStatus('error');
            setTransactionMessage && setTransactionMessage(finalResult?.result?.error?.message || 'Whitelist failed');
            toast.error(`Whitelist failed: ${finalResult?.result?.error?.message || 'Unknown error'}`, {
              position: 'top-center',
              autoClose: 5000
            });
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
          setTransactionStatus && setTransactionStatus('error');
          setTransactionMessage && setTransactionMessage('Transaction status unknown - please check explorer');
          toast.warning('Transaction submitted but confirmation timed out. Please check the explorer for status.', {
            position: 'top-center',
            autoClose: 7000
          });
        }
      } else {
        setTransactionStatus && setTransactionStatus('error');
        setTransactionMessage && setTransactionMessage('Whitelist submission failed');
        toast.error('Failed to whitelist addresses');
      }
    } catch (error) {
      console.error('Error whitelisting addresses:', error);
      setTransactionStatus && setTransactionStatus('error');
      setTransactionMessage && setTransactionMessage(`Whitelist failed: ${error.message}`);
      toast.error('Failed to whitelist addresses');
    } finally {
      setIsWhitelisting(false);
    }
  };

  const getTotalBatches = useCallback(async () => {
    try {
      const code = `(use ${namespace}.${SALES_MODULE_NAME}) TOTAL-BATCHES`;
      const res = await pactCalls(code, supplyChain, pubKey);
      
      const data = res.result?.data || res.result || 0;
      let value = 0;
      if (data?.int !== undefined) {
        value = data.int;
      } else if (data?.decimal !== undefined) {
        value = parseFloat(data.decimal);
      } else if (typeof data === 'number') {
        value = data;
      } else if (typeof data === 'string') {
        value = parseFloat(data);
      }
      
      setTotalBatches(Number(value) || 0);
    } catch (error) {
      console.error('Error fetching total batches:', error);
    }
  }, [namespace, SALES_MODULE_NAME, supplyChain, pubKey]);

  const getCounters = useCallback(async () => {
    try {
      const code = `(${namespace}.${SALES_MODULE_NAME}.get-counters)`;
      const res = await pactCalls(code, supplyChain, pubKey);
      
      const data = res.result?.data || res.result || {};
      
      let soldValue = 0;
      if (data.sold !== undefined) {
        soldValue = data.sold?.int ?? data.sold?.decimal ?? data.sold ?? 0;
      }
      
      let reservedValue = 0;
      if (data.reserved !== undefined) {
        reservedValue = data.reserved?.int ?? data.reserved?.decimal ?? data.reserved ?? 0;
      }
      
      const sold = typeof soldValue === 'string' ? parseFloat(soldValue) : Number(soldValue) || 0;
      const reserved = typeof reservedValue === 'string' ? parseFloat(reservedValue) : Number(reservedValue) || 0;
      
      setCounters({ sold, reserved });
      
      const available = Math.max(0, totalBatches - (sold + reserved));
      setAvailableToWhitelist(available);
    } catch (error) {
      console.error('Error fetching counters:', error);
    }
  }, [namespace, SALES_MODULE_NAME, supplyChain, pubKey, totalBatches]);

  const getReservations = useCallback(async () => {
    try {
      const code = `(${namespace}.${SALES_MODULE_NAME}.get-reservations)`;
      const res = await pactCalls(code, supplyChain, pubKey);
      setReservations(res.result.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  }, [namespace, SALES_MODULE_NAME, supplyChain, pubKey]);

  const validateAddress = (address) => {
    const slicedAddress = address.slice(2);
    return slicedAddress.length === 64;
  };

  const handleAddToWhitelist = () => {
    if (validateAddress(newWallet)) {
      if (walletsToWhitelist.includes(newWallet)) {
        toast.error('Wallet address already in whitelist');
      } else {
        setWalletsToWhitelist([...walletsToWhitelist, newWallet]);
        setNewWallet('');
        toast.success('Address added to whitelist');
      }
    } else {
      toast.error('Invalid wallet address');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (validateAddress(text)) {
        setNewWallet(text);
      } else {
        toast.error('Invalid address from clipboard');
      }
    } catch (error) {
      console.error('Error reading from clipboard:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchP0Price(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
        await fetchP1Price(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
        await getTotalBatches();
        
        setTimeout(async () => {
          await getCounters();
          await getReservations();
        }, 100);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (supplyChain && pubKey) {
      fetchData();
    }
  }, [supplyChain, pubKey, namespace, SALES_MODULE_NAME, fetchP0Price, fetchP1Price, getTotalBatches, getCounters, getReservations]);

  return (
    <div className="space-y-6">
      <div className="card">
        <h4 className="text-lg font-semibold text-primary-text mb-4">Token: ${tokenSymbol}</h4>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-secondary">Whitelist Price:</span>
            <span className="text-blue-400 font-semibold">{safeRender(p0Price)} KDA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-secondary">Public Sale Price:</span>
            <span className="text-green-400 font-semibold">{safeRender(p1Price)} KDA</span>
          </div>
        </div>

        {isPreWl && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-yellow-400">Current Phase: Pre-Whitelist</h3>
            {!showPriceChange && (
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={handlePrices}
              >
                <Settings className="w-4 h-4" />
                Update Prices
              </button>
            )}
            {priceResult && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400">{priceResult}</p>
              </div>
            )}
            {showPriceChange && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      New Whitelist Price (Per Batch)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newP0Price}
                      onChange={(e) => setNewP0Price(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      New Public Sale Price (Per Batch)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newP1Price}
                      onChange={(e) => setNewP1Price(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={updatePrices}
                  disabled={isUpdatingPrices}
                >
                  {isUpdatingPrices ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Prices'
                  )}
                </button>
              </div>
            )}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400">You can whitelist users after Phase 0 starts</p>
            </div>
          </div>
        )}

        {isPhase0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-400">Current Phase: Phase 0 (Whitelist)</h3>
            <p className="text-secondary">Phase 0 is live, you can whitelist users now</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-secondary">Total to Sale</p>
                <p className="text-lg font-semibold text-primary-text">{addComma(safeRender(totalBatches))} Batches</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-secondary">Available</p>
                <p className="text-lg font-semibold text-primary-text">{addComma(safeRender(availableToWhitelist))} Batches</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-secondary">Reserved</p>
                <p className="text-lg font-semibold text-accent-primary">{addComma(safeRender(counters.reserved))} Batches</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-secondary">Sold</p>
                <p className="text-lg font-semibold text-green-400">{addComma(safeRender(counters.sold))} Batches</p>
              </div>
            </div>

            {!whitelistForm && !reservationList && (
              <div className="flex gap-4">
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={showWhiteListForm}
                >
                  <Users className="w-4 h-4" />
                  Whitelist Wallets
                </button>
                <button 
                  className="btn btn-secondary flex items-center gap-2"
                  onClick={showReservationList}
                >
                  <DollarSign className="w-4 h-4" />
                  Current Sales
                </button>
              </div>
            )}

            {whitelistForm && (
              <div className="space-y-4">
                <button
                  onClick={() => setWhitelistForm(false)}
                  className="text-accent-primary hover:text-accent-primary/80 transition-colors"
                >
                  ← Back to options
                </button>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Enter Wallet Address
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Address"
                      value={newWallet}
                      onChange={(e) => setNewWallet(e.target.value)}
                      className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
                    />
                    <button
                      onClick={handlePasteFromClipboard}
                      className="px-3 py-2 bg-secondary-bg border border-border-color rounded-lg hover:bg-hover-bg transition-colors"
                    >
                      <Clipboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button 
                  className="btn btn-primary flex items-center gap-2"
                  onClick={handleAddToWhitelist}
                >
                  <Plus className="w-4 h-4" />
                  Add Wallet
                </button>

                {walletsToWhitelist.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-primary-text">Addresses To Whitelist</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {walletsToWhitelist.map((address, index) => (
                        <div key={index} className="p-2 bg-secondary-bg rounded border break-all text-sm">
                          {index + 1}. {address}
                        </div>
                      ))}
                    </div>
                    <button 
                      className="btn btn-primary w-full"
                      onClick={WhitelistAddresses}
                      disabled={isWhitelisting}
                    >
                      {isWhitelisting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Whitelisting...
                        </>
                      ) : (
                        'Whitelist All Addresses'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {reservationList && (
              <div className="space-y-4">
                <button
                  onClick={() => setReservationList(false)}
                  className="text-accent-primary hover:text-accent-primary/80 transition-colors"
                >
                  ← Back to options
                </button>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary-text">Reservation List</h3>
                  <button
                    onClick={getReservations}
                    className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {reservations.map((account, index) => (
                    <div key={index} className="p-4 bg-secondary-bg border border-border-color rounded-lg">
                      <div className="break-all text-sm mb-2">{index + 1}. {account.account}</div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-accent-primary">
                          Reserved: {safeRender(account.reserved) - safeRender(account.bought)} Batches
                        </span>
                        <span className="text-green-400">
                          Bought: {safeRender(account.bought)} Batches
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isPhase1 && (
          <h3 className="text-xl font-semibold text-green-400">Current Phase: Phase 1 (Public Sale)</h3>
        )}
        
        {now > salesEndTime && (
          <h3 className="text-xl font-semibold text-red-400">Current Phase: Sales Ended</h3>
        )}
      </div>
    </div>
  );
};

ManageSales.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.string.isRequired,
  reqKey: PropTypes.string,
  setReqKey: PropTypes.func,
  transactionStatus: PropTypes.string,
  setTransactionStatus: PropTypes.func,
  transactionMessage: PropTypes.string,
  setTransactionMessage: PropTypes.func,
};

export default ManageSales;

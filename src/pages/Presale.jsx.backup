import React, { useEffect, useState } from 'react';
import usePresaleStore from '../store/usePresaleStore';
import useWalletStore from '../wallet/walletStore';
import { pactCalls, buyTokensSale } from '../pactcalls/kadena';
import BuyModal from './BuyModal';
import { toast } from 'react-toastify';
import { useWalletConnectClient } from '../wallet/providers/ClientContextProvider';
import { useParams } from 'react-router-dom';
import { addComma } from '../utils/numberUtils';

const truncateAccount = (account) => {
  if (!account) return '';
  const parts = account.split(':');
  if (parts.length !== 2) return account;
  return `${parts[0]}:${parts[1].slice(0, 4)}...${parts[1].slice(-4)}`;
};

const Presale = () => {
  const { namespace, moduleName } = useParams();
  const SALES_MODULE_NAME = `${moduleName}-sales`;

  const { client, session } = useWalletConnectClient();
  const { account, pubKey } = useWalletStore();


  const {
    balance,
    phase0startTime,
    phase1startTime,
    salesEndTime,
    isWhitelisted,
    p0Reserved,
    amountPerBatch,
    currentPrice,
    kdaInput,
    batchCount,
    tokenSymbol,
    imageUrl,
    salesAccount,
    availableBatches,
    totalSales,
    supplyChain,
    fetchBalance,
    fetchPhase0StartTime,
    fetchPhase1StartTime,
    fetchSalesEndTime,
    fetchP0Reserved,
    fetchAmountPerBatch,
    fetchSupplyChain,
    fetchTokenSymbol,
    fetchSalesAccount,
    fetchCurrentPrice,
    fetchWlStatus,
    fetchAvailableBatches,
    setKdaInput,
    setBatchCount,
    setAvailableBatches,
    setBalance,
    settotalSales,
    fetchTokenImage
  } = usePresaleStore();

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [reqKey, setReqKey] = useState('');
  const [showWcMessage, setShowWcMessage] = useState(false);

  useEffect(() => {
    console.log("Image URL:", imageUrl); // Debugging line to check the image URL
    fetchBalance(account, supplyChain);
    fetchPhase0StartTime(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
    fetchPhase1StartTime(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
    fetchSalesEndTime(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
    fetchWlStatus(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
    fetchP0Reserved(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
    fetchAmountPerBatch(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
    fetchCurrentPrice(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
    fetchTokenSymbol(namespace, moduleName, supplyChain, pubKey);
    fetchSalesAccount(namespace, SALES_MODULE_NAME, supplyChain, pubKey);
    fetchAvailableBatches(namespace, SALES_MODULE_NAME, account, supplyChain, pubKey);
    fetchSupplyChain(namespace, moduleName, supplyChain, pubKey);
    fetchTokenImage(namespace, moduleName, supplyChain, pubKey);
  }, [account, supplyChain, namespace, moduleName, imageUrl]);

  
  useEffect(() => {
    const now = new Date().getTime();
    let intervalId;
    if (phase0startTime && now < phase0startTime.getTime()) {
      intervalId = setInterval(() => {
        setCountdown(calculateCountdown(phase0startTime.getTime()));
      }, 1000);
    } else if (phase1startTime && now >= phase0startTime?.getTime() && now < phase1startTime?.getTime()) {
      intervalId = setInterval(() => {
        setCountdown(calculateCountdown(phase1startTime.getTime()));
      }, 1000);
    } else if (salesEndTime && now >= phase1startTime?.getTime() && now < salesEndTime?.getTime()) {
      intervalId = setInterval(() => {
        setCountdown(calculateCountdown(salesEndTime.getTime()));
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [phase0startTime, phase1startTime, salesEndTime]);

  const calculateCountdown = (endTime) => {
    const now = new Date().getTime();
    const remainingTime = endTime - now;
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const handleBuy = async () => {
    if (kdaInput > balance) {
      setShowBuyModal(false);
      toast.error(`Insufficient balance on Chain: ${supplyChain}`);
      return;
    }

    try {
      const code = `
        (${namespace}.${SALES_MODULE_NAME}.buy "${account}" (read-keyset 'ks) ${batchCount})
      `;
      const res = await buyTokensSale(code, supplyChain, salesAccount, kdaInput, client, session, namespace, moduleName);
        
      const { reqKey, result } = res.preflightResult;
      setKdaInput(0);
      setReqKey(reqKey);

      if (result.status === "success") {
        setShowBuyModal(false);
        setAvailableBatches(availableBatches - batchCount);
        setBalance(balance - kdaInput);
        settotalSales(totalSales - batchCount);
        toast.success(`Success: ${result.data}`, { position: 'top-center' });
        toast.success(`Request Key: ${reqKey}`, { position: 'bottom-right' });
      } else {
        toast.error(`Error: ${result.error?.message}`);
      }
    } catch (error) {
      console.error("Error in handleBuy:", error);
    }
  };

  const handleBuyPublicSale = () => {
    if (currentPrice > balance) {
      toast.error(`Insufficient balance on Chain: ${supplyChain}`);
      return;
    }
    setShowBuyModal(true);
  };

  useEffect(() => {
    setKdaInput(batchCount * currentPrice);
  }, [batchCount, currentPrice]);

  const now = new Date();
  const isPreWl = now < phase0startTime;
  const isPhase0 = now >= phase0startTime && now < phase1startTime;
  const isPhase1 = now >= phase1startTime && now < salesEndTime;

  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-15 text-white py-12">
      <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mb-12 text-white">${tokenSymbol} Presale</h1>
        
        {/* Token Info Container */}
        <div className="bg-gray-800 bg-opacity-85 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4">
            {imageUrl ? (
              <img src={imageUrl} alt={`${tokenSymbol} logo`} className="w-16 h-16 object-contain" />
            ) : (
              <p>Loading image...</p>
            )}
            <div>
              <h2 className="text-2xl font-bold">{tokenSymbol} Token</h2>
              <p className="text-sm">Ticker: {tokenSymbol.toUpperCase()}</p>
              <p className="text-sm">Supply: {/* Add supply info here */}</p>
              <p className="text-sm">DEX Launch: {/* Add DEX launch info here */}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 bg-opacity-85 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Presale Info</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>1 Batch</span>
                <span className="text-lime-400">{addComma(amountPerBatch)} ${tokenSymbol.toUpperCase()}</span>
              </div>
              {isPhase0 && (
                <div className="flex justify-between">
                  <span>Per WL</span>
                  <span className="text-lime-400">{p0Reserved} {p0Reserved > 1 ? "Batches" : "Batch"}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{isPhase0 ? "WL" : ""} Price</span>
                <span className="text-lime-400">{currentPrice} KDA</span>
              </div>
              {account && isPhase0 && (
                <div className="flex justify-between">
                  <span>Reserved</span>
                  <span className="text-lime-400">{availableBatches} {availableBatches > 1 ? "Batches" : "Batch"}</span>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">
                {isPreWl ? "Whitelist Starts in" : 
                 isPhase0 && !isWhitelisted ? "Public Sale Starts In" : 
                 isPhase0 && isWhitelisted ? "Presale Ends In" : 
                 isPhase1 ? "Public Sale Ends in" : "Sale Ended"}
              </h3>
              <div className="text-3xl font-bold text-lime-400">
                {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 bg-opacity-85 rounded-lg shadow-lg p-8">
            {account ? (
              <>
                <h2 className="text-2xl font-bold mb-6">Your Account</h2>
                <p className="text-lg mb-2 font-mono">{truncateAccount(account)}</p>
                <div className="mb-4">
                  <p>Chain: <span className="text-lime-400">{supplyChain}</span></p>
                  <p>Balance: <span className="text-lime-400">{balance?.toFixed(8)} KDA</span></p>
                </div>
                
                {isPhase0 && isWhitelisted && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Batch Count</label>
                      <input
                        className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                        value={batchCount}
                        type="number"
                        min='1'
                        step='1'
                        max={availableBatches}
                        onChange={(e) => setBatchCount(e.target.value)}
                      />
                    </div>
                    <div>
                      <p>You Give: <span className="text-lime-400">{kdaInput} KDA</span></p>
                      <p>You Get: <span className="text-lime-400">{addComma(batchCount * amountPerBatch)} {tokenSymbol.toUpperCase()}</span></p>
                    </div>
                    <button 
                      className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                      onClick={handleBuy}
                    >
                      Buy
                    </button>
                    {showWcMessage && <p className="text-sm text-gray-400">Check your Wallet and sign transaction</p>}
                    {reqKey !== '' && (
                      <div className="text-sm">
                        <p>Transaction Hash: <span className="text-lime-400">{reqKey}</span></p>
                        <p>You will get <span className="text-lime-400">{addComma((p0Reserved - availableBatches) * amountPerBatch)} {tokenSymbol.toUpperCase()}</span> tokens after public sale ends</p>
                        <p>Total bought: <span className="text-lime-400">{p0Reserved - availableBatches} {(p0Reserved - availableBatches) > 1 ? "batches" : "batch"}</span> of {tokenSymbol.toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {isPhase1 && (
                  <>
                    <button 
                      className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                      onClick={handleBuyPublicSale}
                    >
                      Buy Tokens
                    </button>
                    {showBuyModal && (
                      <BuyModal 
                        tokenSymbol={tokenSymbol} 
                        batchCount={batchCount}
                        setBatchCount={setBatchCount}
                        amountPerBatch={amountPerBatch}
                        kdaInput={kdaInput}
                        handleBuy={handleBuy}
                        setShowBuyModal={setShowBuyModal}
                        availableBatches={availableBatches}
                      />
                    )}
                    {showWcMessage && <p className="text-sm text-gray-400 mt-2">Check your Wallet and sign transaction</p>}
                    {reqKey !== '' && (
                      <p className="text-sm mt-2">Transaction Hash: <span className="text-lime-400">{reqKey}</span></p>
                    )}
                  </>
                )}
              </>
            ) : (
              <p className="text-center text-lg">Please connect your wallet to participate in the presale.</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <h4 className="text-xl font-semibold text-lime-400">
            {isPreWl ? "Waiting for White Listed Presale to start" : 
             isPhase0 ? "White Listed Presale is Live" : 
             isPhase1 ? "Public Sale is Live" : "Sales Ended"}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Presale;

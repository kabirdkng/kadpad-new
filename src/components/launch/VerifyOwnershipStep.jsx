import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import useWalletStore from '../../wallet/walletStore';
import config from '../../wallet/config';
import { useWalletConnectClient } from '../../wallet/providers/ClientContextProvider';
import { toast } from 'react-toastify';
import { pactCalls, pactCallsSig } from '../../wallet/kadena';

const VerifyOwnershipStep = ({ isVerified, setIsVerified, setTokenDetails }) => {
  const { pubkey, provider } = useWalletStore();
  const { client, session } = useWalletConnectClient();

  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (provider === null) {
      toast.error('Please connect your wallet');
      return;
    }
    setIsLoading(true);
    try {
      const ns = contractAddress.split('.')[0];
      const code = `(describe-keyset "${ns}.gov")`;
      const chain = config.chainId;
      const { preflightResult } = await pactCallsSig(code, chain, client, session);
      console.log(preflightResult);
      if (preflightResult.result.status === 'success') {
        toast.success('Ownership verified');
        setIsVerified(true);
        await fetchTokenDetails();
        await fetchSalesDetails();
      } else {
        toast.error('Ownership not verified');
        setIsVerified(false);
      }
    } catch (error) {
      console.error('Error verifying ownership:', error);
      toast.error('Error verifying ownership');
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokenDetails = async () => {
    const code = `(use ${contractAddress}) DETAILS`;
    const chain = config.chainId;
    try {
      const res = await pactCalls(code, chain, pubkey);
      console.log(res);
      if (res.result.status === 'success') {
        setTokenDetails({
          name: contractAddress.split('.')[1],
          symbol: res.result.data.symbol,
          imageUrl: res.result.data.imageUrl,
          supply: res.result.data.supply,
          contractAddress: contractAddress
        });
      } else {
        throw new Error('Failed to fetch token details');
      }
    } catch (error) {
      console.error('Error fetching token details:', error);
      toast.error('Failed to fetch token details');
    }
  };

  const fetchSalesDetails = async () => {
    const chain = config.chainId;
    const NS = contractAddress.split('.')[0];
    const MODULE_NAME = contractAddress.split('.')[1];
    const SALES_MODULE_NAME = `${MODULE_NAME}-sales`;
    
    try {
      const salesDetailsPromises = [
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) PHASE-0-START`, chain),
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) PHASE-1-START`, chain),
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) END-OF-PRESALES`, chain),
        pactCalls(`(use ${NS}.${SALES_MODULE_NAME}) AMOUNT-PER-BATCH`, chain),
        pactCalls(`(${NS}.${SALES_MODULE_NAME}.get-p0-price)`, chain),
        pactCalls(`(${NS}.${SALES_MODULE_NAME}.get-p1-price)`, chain),
        pactCalls(`(${NS}.${SALES_MODULE_NAME}.get-sales)`, chain),
      ];

      const [
        phase0Start,
        phase1Start,
        salesEnd,
        amountPerBatch,
        p0Price,
        p1Price,
        totalSales
      ] = await Promise.all(salesDetailsPromises);

      setTokenDetails(prevDetails => ({
        ...prevDetails,
        salesDetails: {
          phase0startDate: new Date(phase0Start.result.data.time),
          phase1StartDate: new Date(phase1Start.result.data.time),
          salesEndDate: new Date(salesEnd.result.data.time),
          tokensPerBatch: amountPerBatch.result.data,
          phase0price: p0Price.result.data,
          phase1Price: p1Price.result.data,
          totalTokensToSale: totalSales.result.data
        }
      }));
    } catch (error) {
      console.error('Error fetching sales details:', error);
      toast.error('Failed to fetch sales details');
    }
  };

  return (
    <div className="text-center">
      <Lock className="w-16 h-16 text-lime-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">Verify Ownership</h2>
      <p className="mb-6">We need to make sure that your account is the creator/owner of the token you want to launch.</p>
      <div className="mb-4">
        <label htmlFor="contract-address" className="block text-sm font-medium text-gray-300 mb-2">
          Enter Contract Address:
        </label>
        <input
          type="text"
          id="contract-address"
          value={contractAddress}
          className="w-3/4 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm placeholder:text-xs"
          placeholder="n_e923e3cfd7a34ddf356fc1a6eb6085c9b80a3e52.Kadena2"
          onChange={(e) => {
            setContractAddress(e.target.value);
          }}
        />
      </div>
      <button 
        className="w-3/4 bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        onClick={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? 'Verifying...' : 'Verify'}
      </button>
      {isVerified && (
        <p className="mt-4 text-lime-500 font-bold">Verification successful! You can now proceed to the next step.</p>
      )}
    </div>
  );
}

export default VerifyOwnershipStep;
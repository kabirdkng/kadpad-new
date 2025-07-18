import React, { useState } from 'react';
import { Lock, Shield, CheckCircle, AlertCircle, Copy, Wallet } from 'lucide-react';
import useWalletStore from '../../wallet/walletStore';
import config from '../../wallet/config';
import { useWalletConnectClient } from '../../wallet/providers/ClientContextProvider';
import { toast } from 'react-toastify';
import { pactCalls, pactCallsSig } from '../../wallet/kadena';

const VerifyOwnershipStep = ({ isVerified, setIsVerified, setTokenDetails }) => {
  const { pubkey, provider, account } = useWalletStore();
  const { client, session } = useWalletConnectClient();

  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    if (provider === null) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!contractAddress.trim()) {
      toast.error('Please enter a contract address');
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
        toast.success('Ownership verified successfully!');
        setIsVerified(true);
        await fetchTokenDetails();
        await fetchSalesDetails();
      } else {
        toast.error('Ownership verification failed');
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const exampleAddress = "n_e923e3cfd7a34ddf356fc1a6eb6085c9b80a3e52.Kadena2";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
          Verify Token Ownership
        </h2>
        <p className="text-secondary max-w-2xl mx-auto">
          We need to verify that your connected wallet is the owner/creator of the token you want to launch. 
          This ensures you have the authority to manage the token sale.
        </p>
      </div>

      {/* Wallet Status */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${
            account ? 'bg-green-500/20 border-green-500/30' : 'bg-gray-500/20 border-gray-500/30'
          }`}>
            <Wallet className={`w-6 h-6 ${account ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary-text">Wallet Connection</h3>
            {account ? (
              <div className="space-y-1">
                <p className="text-sm text-green-400">✓ Wallet Connected</p>
                <p className="text-xs text-secondary font-mono">{account}</p>
              </div>
            ) : (
              <p className="text-sm text-secondary">Please connect your wallet to continue</p>
            )}
          </div>
          {account && (
            <CheckCircle className="w-6 h-6 text-green-400" />
          )}
        </div>
      </div>

      {/* Contract Address Input */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-primary" />
          Enter Contract Address
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Token Contract Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Enter your token contract address"
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              {contractAddress && (
                <button
                  onClick={() => setContractAddress('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary-text"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Example */}
          <div className="p-4 bg-secondary-bg rounded-xl border border-border-color">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary">Example format:</span>
              <button
                onClick={() => copyToClipboard(exampleAddress)}
                className="btn btn-ghost text-xs flex items-center gap-1"
              >
                <Copy size={12} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <code className="text-sm text-accent-primary font-mono break-all">
              {exampleAddress}
            </code>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!account || !contractAddress.trim() || isLoading}
            className={`btn w-full flex items-center justify-center gap-2 ${
              !account || !contractAddress.trim() 
                ? 'btn-ghost opacity-50 cursor-not-allowed' 
                : 'btn-primary'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-current"></div>
                Verifying...
              </>
            ) : (
              <>
                <Shield size={16} />
                Verify Ownership
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Status */}
      {isVerified && (
        <div className="card bg-green-500/5 border-green-500/20 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-400 mb-1">Verification Successful!</h4>
              <p className="text-sm text-secondary">
                You have been verified as the owner of this token contract. You can now proceed to the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How it Works */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
          <span className="text-xl">🔍</span>
          How Verification Works
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5">
              1
            </div>
            <div>
              <p className="text-sm text-primary-text font-medium">Check Governance Keys</p>
              <p className="text-xs text-secondary">We verify that your wallet controls the token's governance keyset</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5">
              2
            </div>
            <div>
              <p className="text-sm text-primary-text font-medium">Fetch Token Details</p>
              <p className="text-xs text-secondary">We retrieve your token's information and presale configuration</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5">
              3
            </div>
            <div>
              <p className="text-sm text-primary-text font-medium">Validate Requirements</p>
              <p className="text-xs text-secondary">We ensure your token meets KadPad's launch requirements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="card border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">Security Notice</h4>
            <p className="text-sm text-secondary mb-3">
              This verification process only checks that you control the governance keys. 
              No tokens will be transferred, and no permanent changes will be made to your contract.
            </p>
            <ul className="text-xs text-secondary space-y-1">
              <li>• We only read your contract's public information</li>
              <li>• Your private keys never leave your wallet</li>
              <li>• No tokens or funds are at risk during verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOwnershipStep;
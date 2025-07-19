import React, { useState } from 'react';
import { Lock, Shield, CheckCircle, AlertCircle, Copy, Wallet } from 'lucide-react';
import useWalletStore from '../../wallet/walletStore';
import config from '../../wallet/config';
import { useWalletConnectClient } from '../../wallet/providers/ClientContextProvider';
import { toast } from 'react-toastify';
import { pactCalls, pactCallsSig } from '../../wallet/kadena';

const VerifyOwnershipStep = ({ isVerified, setIsVerified, setTokenDetails }) => {
  const { pubKey, provider, account } = useWalletStore();
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
      const res = await pactCalls(code, chain, pubKey);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const exampleAddress = "n_b9880e372b7ec49d21ef4afe82ece29c3a536bde.sweet-token";

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 md:mb-6">
          <Lock className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-text mb-3 md:mb-4 px-2">
          Verify Token Ownership
        </h2>
        <p className="text-sm md:text-base text-secondary max-w-2xl mx-auto px-2">
          We need to verify that your connected wallet is the owner/creator of the token you want to launch. 
          This ensures you have the authority to manage the token.
        </p>
      </div>

      {/* Wallet Status */}
      <div className="card">
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${
            account ? 'bg-green-500/20 border-green-500/30' : 'bg-gray-500/20 border-gray-500/30'
          }`}>
            <Wallet className={`w-5 h-5 md:w-6 md:h-6 ${account ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-primary-text">Wallet Connection</h3>
            {account ? (
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-green-400">✓ Wallet Connected</p>
                <p className="text-xs text-secondary font-mono break-all">{account}</p>
              </div>
            ) : (
              <p className="text-xs md:text-sm text-secondary">Please connect your wallet to continue</p>
            )}
          </div>
          {account && (
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Contract Address Input */}
      <div className="card">
        <h3 className="text-base md:text-lg font-semibold text-primary-text mb-3 md:mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-accent-primary" />
          Enter Contract Address
        </h3>
        
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-secondary mb-2">
              Token Contract Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Enter your token contract address"
                className="w-full px-3 py-2 md:px-4 md:py-3 bg-secondary-bg border border-border-color rounded-xl text-sm md:text-base text-primary-text placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              {contractAddress && (
                <button
                  onClick={() => setContractAddress('')}
                  className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary-text text-sm md:text-base"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Example */}
          <div className="p-3 md:p-4 bg-secondary-bg rounded-xl border border-border-color">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-xs md:text-sm font-medium text-secondary">Example format:</span>
              <button
                onClick={() => copyToClipboard(exampleAddress)}
                className="btn btn-ghost text-xs flex items-center gap-1 px-2 py-1"
              >
                <Copy size={12} />
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <code className="text-xs md:text-sm text-accent-primary font-mono break-all block">
              {exampleAddress}
            </code>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!account || !contractAddress.trim() || isLoading}
            className={`btn w-full flex items-center justify-center gap-2 py-3 text-sm md:text-base ${
              !account || !contractAddress.trim() 
                ? 'btn-ghost opacity-50 cursor-not-allowed' 
                : 'btn-primary'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-t-2 border-current"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Shield size={16} />
                <span>Verify Ownership</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Verification Status */}
      {isVerified && (
        <div className="card bg-green-500/5 border-green-500/20 animate-fade-in">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm md:text-base font-semibold text-green-400 mb-1">Verification Successful!</h4>
              <p className="text-xs md:text-sm text-secondary">
                You have been verified as the owner of this token contract. You can now proceed to the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How it Works */}
      <div className="card">
        <h3 className="text-base md:text-lg font-semibold text-primary-text mb-3 md:mb-4 flex items-center gap-2">
          <span className="text-lg md:text-xl">🔍</span>
          <span>How Verification Works</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5 flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-xs md:text-sm text-primary-text font-medium">Check Governance Keys</p>
              <p className="text-xs text-secondary">We verify that your wallet controls the token's governance keyset</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5 flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-xs md:text-sm text-primary-text font-medium">Fetch Token Details</p>
              <p className="text-xs text-secondary">We retrieve your token's basic information (name, symbol, supply)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5 flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-xs md:text-sm text-primary-text font-medium">Ready for Review</p>
              <p className="text-xs text-secondary">Token details are ready for team information and submission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="card border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-semibold text-yellow-400 mb-2">Security Notice</h4>
            <p className="text-xs md:text-sm text-secondary mb-3">
              This verification process only checks that you control the governance keys. 
              No tokens will be transferred, and no permanent changes will be made to your contract.
            </p>
            <ul className="text-xs text-secondary space-y-1">
              <li>• We only read your contract's public information</li>
              <li>• Your private keys never leave your wallet</li>
              <li>• No tokens or funds are at risk during verification</li>
              <li>• Sales contract details will be configured later in the process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOwnershipStep;
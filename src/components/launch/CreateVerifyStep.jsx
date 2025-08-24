import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Coins, ExternalLink, Shield, 
  CheckCircle, AlertCircle, Copy, Wallet 
} from 'lucide-react';
import useWalletStore from '../../wallet/walletStore';
import config from '../../wallet/config';
import { toast } from 'react-toastify';
import { pactCalls } from '../../pactcalls/kadena';
import WalletConnectButton from '../WalletConnectButton';
import tokenGoLogo from '../../assets/tokengo-logo.png';

const CreateVerifyStep = ({ isVerified, setIsVerified, setTokenDetails }) => {
  const { pubKey, provider, account } = useWalletStore();

  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tokenGoTool = {
    name: "TokenGo",
    description: "Create tokens on Kadena with no coding required",
    url: "https://tokengo.fun",
    features: ["No coding required", "Built-in Kadpad contracts", "Instant deployment"]
  };

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
      const res = await pactCalls(code, chain);
      console.log('Keyset result:', res);

      if (res && res.result && res.result.status === 'success') {
        const keysetData = res.result.data;
        console.log('Keyset data:', keysetData);
        
        // Check if the wallet's public key is in the keyset keys array
        if (keysetData && keysetData.keys && Array.isArray(keysetData.keys)) {
          const isOwner = keysetData.keys.includes(pubKey);
          
          if (isOwner) {
            toast.success('Ownership verified successfully!');
            setIsVerified(true);
            await fetchTokenDetails();
          } else {
            toast.error('Ownership verification failed: Your wallet key is not authorized for this token');
            setIsVerified(false);
          }
        } else {
          toast.error('Invalid keyset format received');
          setIsVerified(false);
        }
      } else {
        const errorMessage = res?.result?.error?.message || 'Unknown error occurred';
        toast.error(`Ownership verification failed: ${errorMessage}`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-6">
          <Coins className="w-8 h-8 text-accent-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
          Create & Verify Your Token
        </h2>
        <p className="text-secondary max-w-2xl mx-auto">
          Create your token using TokenGo, then verify ownership with your wallet.
        </p>
      </div>

      {/* TokenGo Tool */}
      <div className="card glow border-accent-primary/30">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-bg border border-border-color flex items-center justify-center overflow-hidden">
            <img 
              src={tokenGoLogo} 
              alt="TokenGo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-primary-text mb-1">{tokenGoTool.name}</h4>
            <p className="text-sm text-secondary">{tokenGoTool.description}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {tokenGoTool.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-primary"></div>
              <span className="text-secondary">{feature}</span>
            </div>
          ))}
        </div>

        <a
          href={tokenGoTool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary w-full group/btn flex items-center justify-center gap-2"
        >
          Create Token on {tokenGoTool.name}
          <ExternalLink size={16} className="transition-transform group-hover/btn:translate-x-1" />
        </a>
      </div>

      {/* Wallet Status */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${
            account ? 'bg-green-500/20 border-green-500/30' : 'bg-gray-500/20 border-gray-500/30'
          }`}>
            <Wallet className={`w-6 h-6 ${account ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-primary-text">Wallet Connection</h4>
            {account ? (
              <div className="space-y-1">
                <p className="text-sm text-green-400">✓ Wallet Connected</p>
                <p className="text-xs text-secondary font-mono break-all">{account}</p>
              </div>
            ) : (
              <p className="text-sm text-secondary">Connect your wallet to verify ownership</p>
            )}
          </div>
          {account && (
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
          )}
        </div>
        {!account && (
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
        )}
      </div>

      {/* Contract Address Input */}
      <div className="card">
        <h4 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-primary" />
          Verify Token Ownership
        </h4>
        
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
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-base text-primary-text placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
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
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-sm font-medium text-secondary">Example:</span>
              <button
                onClick={() => copyToClipboard(exampleAddress)}
                className="btn btn-ghost text-xs flex items-center gap-1 px-2 py-1"
              >
                <Copy size={12} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <code className="text-sm text-accent-primary font-mono break-all block">
              {exampleAddress}
            </code>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!account || !contractAddress.trim() || isLoading}
            className={`btn w-full flex items-center justify-center gap-2 py-3 ${
              !account || !contractAddress.trim() 
                ? 'btn-ghost opacity-50 cursor-not-allowed' 
                : 'btn-primary'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-current"></div>
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
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-green-400 mb-1">Verification Successful!</h4>
              <p className="text-sm text-secondary">
                Token ownership verified. You can now proceed to the next step.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="card border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-blue-400 mb-2">Security Notice</h4>
            <p className="text-sm text-secondary">
              We only verify governance keys. No tokens are transferred and no changes are made to your contract.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

CreateVerifyStep.propTypes = {
  isVerified: PropTypes.bool.isRequired,
  setIsVerified: PropTypes.func.isRequired,
  setTokenDetails: PropTypes.func.isRequired
};

export default CreateVerifyStep;
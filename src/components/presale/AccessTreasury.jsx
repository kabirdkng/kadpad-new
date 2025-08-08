import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Vault, Send, RefreshCw } from 'lucide-react';
import { fetchBalance, pactCalls, transferCoinTreasury } from '../../pactcalls/kadena';
import { useWalletConnectClient } from '../../wallet/providers/ClientContextProvider';
import useWalletStore from '../../wallet/walletStore';
import useTransactionManager from '../../hooks/useTransactionManager';
import { addComma } from '../../utils/numberUtils';
import { toast } from 'react-toastify';

const AccessTreasury = ({ 
  tokenSymbol, 
  namespace, 
  moduleName, 
  supplyChain
}) => {
  const TREASURY_MODULE_NAME = `${moduleName}-treasury`;
  const { pubKey, account } = useWalletStore();
  const { client, session } = useWalletConnectClient();
  const { 
    submitTransaction, 
    createTransactionMetadata, 
    transactionTypes 
  } = useTransactionManager();
  
  const [treasuryTokenBalance, setTreasuryTokenBalance] = useState(0);
  const [treasuryContractAccount, setTreasuryContractAccount] = useState('');
  const [transferAccount, setTransferAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getTreasuryContractAccount = useCallback(async () => {
    try {
      const code = `(use ${namespace}.${TREASURY_MODULE_NAME}) TREASURY-ACCOUNT`;
      const res = await pactCalls(code, supplyChain, pubKey);
      setTreasuryContractAccount(res.result.data);
    } catch (error) {
      console.error('Error fetching treasury account:', error);
      toast.error('Failed to fetch treasury account');
    }
  }, [namespace, TREASURY_MODULE_NAME, supplyChain, pubKey]);

const getTreasuryTokenBalance = useCallback(async () => {
    try {
        if (!treasuryContractAccount) return;
        const code = `(${namespace}.${moduleName}.get-balance "${treasuryContractAccount}")`;
        const res = await fetchBalance(code, supplyChain);
        setTreasuryTokenBalance(res);
    } catch (error) {
        console.error('Error fetching treasury balance:', error);
        toast.error('Failed to fetch treasury balance');
    }
}, [namespace, moduleName, supplyChain, treasuryContractAccount]);

  const transferTokens = async () => {
    if (!transferAccount || !transferAmount) {
      toast.error('Please enter both account and amount');
      return;
    }

    // Format amount for Pact (same as price formatting)
  const formatAmountForPact = (amount) => {
    const numAmount = parseFloat(amount);
    return numAmount % 1 === 0 ? `${numAmount}.0` : numAmount.toString();
  };

  const formattedAmount = formatAmountForPact(transferAmount);

    // Validate account format (should be k:account or account name)
    const isValidAccount = transferAccount.startsWith('k:') ? 
      transferAccount.slice(2).length === 64 : 
      transferAccount.length > 0;
    
    if (!isValidAccount) {
      toast.error('Invalid account format');
      return;
    }

    try {
      setIsLoading(true);
      
      const token = `${namespace}.${moduleName}`;
      const code = `(${token}-treasury.transfer-funds "${transferAccount}" (read-keyset 'ks) ${formattedAmount})`;

      toast.info('Submitting transfer...', { position: 'top-center', autoClose: 2000 });
      const res = await transferCoinTreasury(
        token, 
        code, 
        supplyChain, 
        pubKey, 
        account, 
        client, 
        session
      );
      
      if (res?.preflightResult?.result?.status === 'success') {
        const txKey = res.transactionDescriptor?.requestKey;

        // Create transaction metadata
        const metadata = createTransactionMetadata(
          transactionTypes.TRANSFER_TREASURY,
          `Transfer ${transferAmount} ${tokenSymbol} from treasury to ${transferAccount}`,
          {
            amount: transferAmount,
            token: tokenSymbol,
            from: treasuryContractAccount,
            to: transferAccount,
            chainId: supplyChain,
            namespace,
            moduleName,
          }
        );

        // Submit transaction using the new manager
        try {
          const finalResult = await submitTransaction({
            txId: txKey,
            pactClient: res.pactClient,
            transactionDescriptor: res.transactionDescriptor,
            metadata,
            pollingConfig: {
              enableToasts: true,
            }
          });

          if (finalResult?.result?.status === 'success') {
            // Clear form and refresh balance
            setTransferAccount('');
            setTransferAmount('');
            await getTreasuryTokenBalance();
          }
        } catch (pollError) {
          console.error('Transaction polling error:', pollError);
        }
      } else {
        toast.error('Transfer failed');
      }
    } catch (error) {
      console.error('Error transferring tokens:', error);
      toast.error('Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      await getTreasuryContractAccount();
      await getTreasuryTokenBalance();
    };
    
    if (namespace && moduleName && supplyChain) {
      fetchDetails();
    }
  }, [namespace, moduleName, supplyChain, getTreasuryContractAccount, getTreasuryTokenBalance]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Vault className="w-6 h-6 text-accent-primary" />
          <h1 className="text-2xl font-bold text-primary-text">${tokenSymbol} Treasury</h1>
        </div>

        <div className="space-y-6">
          {/* Treasury Balance */}
          <div className="p-6 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary-text">Treasury Balance</h2>
              <button
                onClick={getTreasuryTokenBalance}
                className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-primary mb-2">
                {addComma(treasuryTokenBalance)} ${tokenSymbol}
              </p>
              <p className="text-sm text-secondary break-all">
                Account: {treasuryContractAccount || 'Loading...'}
              </p>
            </div>
          </div>

          {/* Transfer Tokens */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Send className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold text-primary-text">Transfer Tokens</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Recipient Account
                </label>
                <input
                  type="text"
                  placeholder="Enter account address"
                  value={transferAccount}
                  onChange={(e) => setTransferAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Enter amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
                />
              </div>

              <button
                onClick={transferTokens}
                disabled={isLoading || !transferAccount || !transferAmount}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Tokens
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AccessTreasury.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.string.isRequired,
};

export default AccessTreasury;

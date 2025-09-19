import { toast } from 'react-toastify';
import useTransactionStore from '../store/useTransactionStore';
import transactionPollingService from '../services/transactionPollingService';

/**
 * Utility functions for common transaction patterns
 * These functions work with the transaction manager but don't use hooks directly
 */

/**
 * Show signing transaction toast
 */
export const showSigningToast = () => {
  toast.info('Signing transaction...', { position: 'top-center', autoClose: 3000 });
};

/**
 * Check if error is from user cancellation/rejection
 */
export const isUserRejectionError = (error) => {
  const message = error.message || '';
  return message.includes('rejected') || 
         message.includes('cancelled') || 
         message.includes('denied') ||
         message.includes('User rejected') ||
         message.includes('User canceled') ||
         message.includes('signing was cancelled') ||
         message.includes('signing failed');
};

/**
 * Create transaction metadata helper
 */
export const createTransactionMetadata = (type, description, additionalData = {}) => {
  return {
    type,
    description,
    timestamp: Date.now(),
    ...additionalData,
  };
};

/**
 * Transaction types enum
 */
export const transactionTypes = {
  BUY_TOKENS: 'buy-tokens',
  TRANSFER_TREASURY: 'transfer-treasury',
  WHITELIST_ADDRESS: 'whitelist-address',
  UPDATE_PRICE: 'update-price',
  DEPLOY_CONTRACT: 'deploy-contract',
  MINT_TOKENS: 'mint-tokens',
  STAKE_TOKENS: 'stake-tokens',
  UNSTAKE_TOKENS: 'unstake-tokens',
  DISTRIBUTE_TOKENS: 'distribute-tokens',
  END_SALES: 'end-sales',
  INIT_LIQUIDITY: 'init-liquidity',
  OTHER: 'other',
};

/**
 * Submit and track a transaction
 */
export const submitTransaction = async ({
  txId,
  pactClient,
  transactionDescriptor,
  metadata = {},
  pollingConfig = {}
}) => {
  const { addTransaction, updateTransaction } = useTransactionStore.getState();

  try {
    // Add transaction to store
    addTransaction(txId, {
      ...metadata,
      requestKey: transactionDescriptor.requestKey,
      submittedAt: Date.now(),
    });

    // Update status to pending
    updateTransaction(txId, {
      status: 'pending',
      message: 'Transaction submitted, waiting for confirmation...',
    });

    // Start polling
    const result = await transactionPollingService.startPolling(
      txId,
      pactClient,
      transactionDescriptor,
      {
        enableToasts: true,
        ...pollingConfig,
      }
    );

    return result;
  } catch (error) {
    // Update transaction with error
    updateTransaction(txId, {
      status: 'error',
      error: error.message,
      message: `Transaction failed: ${error.message}`,
    });
    
    throw error;
  }
};

/**
 * Handle token purchase with centralized transaction management
 */
export const handleTokenPurchase = async ({
  code,
  supplyChain,
  salesAccount,
  amount,
  batchCount,
  client,
  session,
  namespace,
  moduleName,
  tokenSymbol,
  account,
  currentPrice,
  buyTokensSale,
  onSuccess,
  onError,
}) => {
  try {
    const result = await buyTokensSale(
      code, 
      supplyChain, 
      salesAccount, 
      amount, 
      client, 
      session, 
      namespace, 
      moduleName
    );
    
    // Check if signing failed
    if (result?.status === 'fail') {
      // Signing failed, don't show additional error as it's already shown in signAndSubmitTx
      onError && onError('Transaction was cancelled');
      return { success: false, error: 'Transaction was cancelled' };
    }
    
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

      // Submit transaction using the centralized manager
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
        onSuccess && onSuccess(finalResult);
        return { success: true, result: finalResult, txKey };
      } else {
        const errorMessage = finalResult?.result?.error?.message || 'Transaction failed';
        onError && onError(errorMessage);
        return { success: false, error: errorMessage, txKey };
      }
    } else {
      const errorMessage = 'Transaction submission failed';
      toast.error(errorMessage, { position: 'top-center' });
      onError && onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('Purchase error:', error);
    
    // Don't show duplicate error if it's already a signing failure
    if (!isUserRejectionError(error)) {
      const errorMessage = `Purchase failed: ${error.message}`;
      toast.error(errorMessage, { position: 'top-center' });
      onError && onError(errorMessage);
    } else {
      // For signing failures, just call onError without showing another toast
      onError && onError('Transaction was cancelled');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Handle treasury transfer with centralized transaction management
 */
export const handleTreasuryTransfer = async ({
  token,
  code,
  supplyChain,
  pubKey,
  treasuryContractAccount,
  transferAccount,
  keysetGuard,
  transferAmount,
  client,
  session,
  tokenSymbol,
  namespace,
  moduleName,
  transferCoinTreasury,
  onSuccess,
  onError,
}) => {
  try {
    const res = await transferCoinTreasury(
      token, 
      code, 
      supplyChain, 
      pubKey, 
      treasuryContractAccount, 
      transferAccount, 
      keysetGuard,
      parseFloat(transferAmount), 
      client, 
      session
    );
    
    // Check if signing failed
    if (res?.status === 'fail') {
      // Signing failed, don't show additional error as it's already shown in signAndSubmitTx
      onError && onError('Transaction was cancelled');
      return { success: false, error: 'Transaction was cancelled' };
    }
    
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

      // Submit transaction using the centralized manager
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
        onSuccess && onSuccess(finalResult);
        return { success: true, result: finalResult, txKey };
      } else {
        const errorMessage = finalResult?.result?.error?.message || 'Transfer failed';
        onError && onError(errorMessage);
        return { success: false, error: errorMessage, txKey };
      }
    } else {
      const errorMessage = 'Transfer submission failed';
      toast.error(errorMessage);
      onError && onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('Transfer error:', error);
    
    // Don't show duplicate error if it's already a signing failure
    if (!isUserRejectionError(error)) {
      const errorMessage = `Transfer failed: ${error.message}`;
      toast.error(errorMessage);
      onError && onError(errorMessage);
    } else {
      // For signing failures, just call onError without showing another toast
      onError && onError('Transaction was cancelled');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Handle whitelist operation with centralized transaction management
 */
export const handleWhitelistOperation = async ({
  code,
  supplyChain,
  client,
  session,
  namespace,
  moduleName,
  addresses,
  operation, // 'add' or 'remove'
  pactCallsSales,
  onSuccess,
  onError,
}) => {
  try {
    toast.info(`${operation === 'add' ? 'Adding to' : 'Removing from'} whitelist...`, { 
      position: 'top-center', 
      autoClose: 2000 
    });
    
    const result = await pactCallsSales(
      code, 
      supplyChain, 
      client, 
      session, 
      namespace, 
      moduleName
    );
    
    // Check if signing failed
    if (result?.status === 'fail') {
      // Signing failed, don't show additional error as it's already shown in signAndSubmitTx
      onError && onError('Transaction was cancelled');
      return { success: false, error: 'Transaction was cancelled' };
    }
    
    if (result?.preflightResult?.result?.status === 'success') {
      const txKey = result.transactionDescriptor?.requestKey;
      
      // Create transaction metadata
      const metadata = createTransactionMetadata(
        transactionTypes.WHITELIST_ADDRESS,
        `${operation === 'add' ? 'Add' : 'Remove'} ${addresses.length} address(es) ${operation === 'add' ? 'to' : 'from'} whitelist`,
        {
          operation,
          addresses,
          count: addresses.length,
          chainId: supplyChain,
          namespace,
          moduleName,
        }
      );

      // Submit transaction using the centralized manager
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
        onSuccess && onSuccess(finalResult);
        return { success: true, result: finalResult, txKey };
      } else {
        const errorMessage = finalResult?.result?.error?.message || 'Whitelist operation failed';
        onError && onError(errorMessage);
        return { success: false, error: errorMessage, txKey };
      }
    } else {
      const errorMessage = 'Whitelist operation submission failed';
      toast.error(errorMessage);
      onError && onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('Whitelist operation error:', error);
    
    // Don't show duplicate error if it's already a signing failure
    if (!isUserRejectionError(error)) {
      const errorMessage = `Whitelist operation failed: ${error.message}`;
      toast.error(errorMessage);
      onError && onError(errorMessage);
    } else {
      // For signing failures, just call onError without showing another toast
      onError && onError('Transaction was cancelled');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Handle token staking with centralized transaction management
 */
export const handleTokenStaking = async ({
  code,
  chainId,
  namespace,
  tokenModule,
  amount,
  lockerAccount,
  account,
  pactCallsStakeTokens,
  onSuccess,
  onError,
}) => {
  try {
    const result = await pactCallsStakeTokens(
      code,
      chainId,
      namespace,
      tokenModule,
      amount,
      lockerAccount
    );
    
    // Check if signing failed
    if (result?.status === 'fail') {
      // Signing failed, don't show additional error as it's already shown in signAndSubmitTx
      onError && onError('Transaction was cancelled');
      return { success: false, error: 'Transaction was cancelled' };
    }
    
    if (result?.preflightResult?.result?.status === 'success' || result?.result?.status === 'success') {
      const txKey = result.transactionDescriptor?.requestKey || result.requestKey;
      
      // Create transaction metadata
      const metadata = createTransactionMetadata(
        transactionTypes.STAKE_TOKENS,
        `Stake ${amount} KADPAD tokens`,
        {
          amount: amount,
          account: account,
          lockerAccount: lockerAccount,
          chainId: chainId,
          namespace: namespace,
          tokenModule: tokenModule,
          operation: 'stake',
        }
      );

      // Submit transaction using the centralized manager
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
        onSuccess && onSuccess(finalResult);
        return { success: true, result: finalResult, txKey };
      } else {
        const errorMessage = finalResult?.result?.error?.message || 'Staking transaction failed';
        onError && onError(errorMessage);
        return { success: false, error: errorMessage, txKey };
      }
    } else {
      const errorMessage = 'Staking transaction submission failed';
      toast.error(errorMessage, { position: 'top-center' });
      onError && onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('Staking error:', error);
    
    // Don't show duplicate error if it's already a signing failure
    if (!isUserRejectionError(error)) {
      const errorMessage = `Staking failed: ${error.message}`;
      toast.error(errorMessage, { position: 'top-center' });
      onError && onError(errorMessage);
    } else {
      // For signing failures, just call onError without showing another toast
      onError && onError('Transaction was cancelled');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Handle token unstaking with centralized transaction management
 */
export const handleTokenUnstaking = async ({
  code,
  chainId,
  namespace,
  stakingModule,
  tokenModule,
  account,
  lockerAccount,
  amount,
  pactCallsUnstakeTokens,
  onSuccess,
  onError,
}) => {
  try {
    const result = await pactCallsUnstakeTokens(
      code,
      chainId,
      namespace,
      stakingModule,
      tokenModule,
      account,
      lockerAccount,
      amount
    );
    
    // Check if signing failed
    if (result?.status === 'fail') {
      // Signing failed, don't show additional error as it's already shown in signAndSubmitTx
      onError && onError('Transaction was cancelled');
      return { success: false, error: 'Transaction was cancelled' };
    }
    
    if (result?.preflightResult?.result?.status === 'success' || result?.result?.status === 'success') {
      const txKey = result.transactionDescriptor?.requestKey || result.requestKey;
      
      // Create transaction metadata
      const metadata = createTransactionMetadata(
        transactionTypes.UNSTAKE_TOKENS,
        `Unstake ${amount} KADPAD tokens`,
        {
          amount: amount,
          account: account,
          lockerAccount: lockerAccount,
          chainId: chainId,
          namespace: namespace,
          stakingModule: stakingModule,
          tokenModule: tokenModule,
          operation: 'unstake',
        }
      );

      // Submit transaction using the centralized manager
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
        onSuccess && onSuccess(finalResult);
        return { success: true, result: finalResult, txKey };
      } else {
        const errorMessage = finalResult?.result?.error?.message || 'Unstaking transaction failed';
        onError && onError(errorMessage);
        return { success: false, error: errorMessage, txKey };
      }
    } else {
      const errorMessage = 'Unstaking transaction submission failed';
      toast.error(errorMessage, { position: 'top-center' });
      onError && onError(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('Unstaking error:', error);
    
    // Don't show duplicate error if it's already a signing failure
    if (!isUserRejectionError(error)) {
      const errorMessage = `Unstaking failed: ${error.message}`;
      toast.error(errorMessage, { position: 'top-center' });
      onError && onError(errorMessage);
    } else {
      // For signing failures, just call onError without showing another toast
      onError && onError('Transaction was cancelled');
    }
    
    return { success: false, error: error.message };
  }
};

export default {
  handleTokenPurchase,
  handleTreasuryTransfer,
  handleWhitelistOperation,
  handleTokenStaking,
  handleTokenUnstaking,
  createTransactionMetadata,
  transactionTypes,
  submitTransaction,
  showSigningToast,
  isUserRejectionError,
};

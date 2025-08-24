import { toast } from 'react-toastify';
import useTransactionStore from '../store/useTransactionStore';
import transactionPollingService from '../services/transactionPollingService';

/**
 * Utility functions for common transaction patterns
 * These functions work with the transaction manager but don't use hooks directly
 */

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
    toast.info('Submitting transaction...', { position: 'top-center', autoClose: 2000 });
    
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
    const errorMessage = `Purchase failed: ${error.message}`;
    toast.error(errorMessage, { position: 'top-center' });
    onError && onError(errorMessage);
    return { success: false, error: errorMessage };
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
    toast.info('Submitting transfer...', { position: 'top-center', autoClose: 2000 });
    
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
    const errorMessage = `Transfer failed: ${error.message}`;
    toast.error(errorMessage);
    onError && onError(errorMessage);
    return { success: false, error: errorMessage };
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
    const errorMessage = `Whitelist operation failed: ${error.message}`;
    toast.error(errorMessage);
    onError && onError(errorMessage);
    return { success: false, error: errorMessage };
  }
};

export default {
  handleTokenPurchase,
  handleTreasuryTransfer,
  handleWhitelistOperation,
  createTransactionMetadata,
  transactionTypes,
  submitTransaction,
};

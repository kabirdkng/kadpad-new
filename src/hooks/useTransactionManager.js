import { useCallback } from 'react';
import useTransactionStore from '../store/useTransactionStore';
import transactionPollingService from '../services/transactionPollingService';

/**
 * Custom hook for centralized transaction management
 * Provides a unified interface for transaction tracking, polling, and persistence
 */
const useTransactionManager = () => {
  const {
    addTransaction,
    updateTransaction,
    getTransaction,
    getAllTransactions,
    getActiveTransactions,
    removeTransaction,
  } = useTransactionStore();

  /**
   * Submit and track a transaction
   * @param {Object} params - Transaction parameters
   * @param {string} params.txId - Transaction ID (request key)
   * @param {Object} params.pactClient - Pact client instance
   * @param {Object} params.transactionDescriptor - Transaction descriptor
   * @param {Object} params.metadata - Additional transaction metadata
   * @param {Object} params.pollingConfig - Polling configuration
   * @returns {Promise} - Resolves with transaction result
   */
  const submitTransaction = useCallback(async ({
    txId,
    pactClient,
    transactionDescriptor,
    metadata = {},
    pollingConfig = {}
  }) => {
    try {
      // Add transaction to store
      addTransaction(txId, {
        ...metadata,
        requestKey: transactionDescriptor.requestKey,
        chainId: metadata.chainId,
        sender: metadata.sender,
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
  }, [addTransaction, updateTransaction]);

  /**
   * Stop tracking a transaction
   * @param {string} txId - Transaction ID
   */
  const stopTransaction = useCallback((txId) => {
    transactionPollingService.stopPolling(txId);
    updateTransaction(txId, {
      status: 'cancelled',
      message: 'Transaction polling stopped by user',
    });
  }, [updateTransaction]);

  /**
   * Retry a failed transaction polling
   * @param {string} txId - Transaction ID
   * @param {Object} pactClient - Pact client instance
   * @param {Object} transactionDescriptor - Transaction descriptor
   * @param {Object} pollingConfig - Polling configuration
   */
  const retryTransaction = useCallback(async (txId, pactClient, transactionDescriptor, pollingConfig = {}) => {
    const transaction = getTransaction(txId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    try {
      updateTransaction(txId, {
        status: 'pending',
        message: 'Retrying transaction confirmation...',
        retryAttempt: (transaction.retryAttempt || 0) + 1,
      });

      const result = await transactionPollingService.startPolling(
        txId,
        pactClient,
        transactionDescriptor,
        pollingConfig
      );

      return result;
    } catch (error) {
      updateTransaction(txId, {
        status: 'error',
        error: error.message,
        message: `Retry failed: ${error.message}`,
      });
      
      throw error;
    }
  }, [getTransaction, updateTransaction]);

  /**
   * Get transaction statistics
   */
  const getStats = useCallback(() => {
    const allTransactions = getAllTransactions();
    const activeTransactions = getActiveTransactions();
    
    return {
      total: allTransactions.length,
      active: activeTransactions.length,
      pending: allTransactions.filter(tx => tx.status === 'pending').length,
      success: allTransactions.filter(tx => tx.status === 'success').length,
      error: allTransactions.filter(tx => tx.status === 'error').length,
      pollingStats: transactionPollingService.getStats(),
    };
  }, [getAllTransactions, getActiveTransactions]);

  /**
   * Create transaction metadata helper
   */
  const createTransactionMetadata = useCallback((type, description, additionalData = {}) => {
    return {
      type,
      description,
      timestamp: Date.now(),
      ...additionalData,
    };
  }, []);

  /**
   * Utility functions for different transaction types
   */
  const transactionTypes = {
    BUY_TOKENS: 'buy-tokens',
    TRANSFER_TREASURY: 'transfer-treasury',
    TREASURY_WITHDRAW: 'treasury-withdraw',
    WHITELIST_ADDRESS: 'whitelist-address',
    WHITELIST_ADDRESSES: 'whitelist-addresses',
    UPDATE_PRICE: 'update-price',
    PRICE_UPDATE: 'price-update',
    DEPLOY_CONTRACT: 'deploy-contract',
    MINT_TOKENS: 'mint-tokens',
    OTHER: 'other',
  };

  return {
    // Core functions
    submitTransaction,
    stopTransaction,
    retryTransaction,
    
    // Store functions
    addTransaction,
    updateTransaction,
    getTransaction,
    removeTransaction,
    getAllTransactions,
    getActiveTransactions,
    
    // Utilities
    getStats,
    createTransactionMetadata,
    transactionTypes,
    
    // Service functions
    isPolling: transactionPollingService.isPolling.bind(transactionPollingService),
    stopAllPolling: transactionPollingService.stopAllPolling.bind(transactionPollingService),
  };
};

export default useTransactionManager;

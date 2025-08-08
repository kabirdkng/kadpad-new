import useTransactionStore from '../store/useTransactionStore';
import { toast } from 'react-toastify';

class TransactionPollingService {
  constructor() {
    this.activePolls = new Map(); // txId -> { controller, promise }
    this.defaultConfig = {
      maxRetries: 30,
      retryInterval: 3000, // 3 seconds
      enableToasts: true,
    };
  }

  /**
   * Start polling for a transaction
   * @param {string} txId - Transaction ID (request key)
   * @param {Object} pactClient - Pact client instance
   * @param {Object} transactionDescriptor - Transaction descriptor
   * @param {Object} config - Polling configuration
   * @returns {Promise} - Resolves with transaction result
   */
  async startPolling(txId, pactClient, transactionDescriptor, config = {}) {
    const pollConfig = { ...this.defaultConfig, ...config };
    const { updateTransaction } = useTransactionStore.getState();

    // Check if already polling this transaction
    if (this.activePolls.has(txId)) {
      console.warn(`Already polling transaction: ${txId}`);
      return this.activePolls.get(txId).promise;
    }

    // Create abort controller for this poll
    const controller = new AbortController();
    
    const pollPromise = this._poll(
      txId,
      pactClient,
      transactionDescriptor,
      pollConfig,
      controller.signal
    );

    // Store the poll reference
    this.activePolls.set(txId, { controller, promise: pollPromise });

    try {
      const result = await pollPromise;
      
      // Update transaction store with result
      if (result?.result?.status === 'success') {
        updateTransaction(txId, {
          status: 'success',
          result: result,
          message: 'Transaction completed successfully',
        });

        if (pollConfig.enableToasts) {
          toast.success('Transaction completed successfully!', {
            position: 'top-center',
            autoClose: 5000,
          });
        }
      } else {
        updateTransaction(txId, {
          status: 'error',
          result: result,
          message: result?.result?.error?.message || 'Transaction failed',
        });

        if (pollConfig.enableToasts) {
          toast.error(`Transaction failed: ${result?.result?.error?.message || 'Unknown error'}`, {
            position: 'top-center',
            autoClose: 8000,
          });
        }
      }

      return result;
    } catch (error) {
      // Update transaction store with error
      updateTransaction(txId, {
        status: 'error',
        error: error.message,
        message: `Polling failed: ${error.message}`,
      });

      if (pollConfig.enableToasts && !controller.signal.aborted) {
        toast.error(`Transaction polling failed: ${error.message}`, {
          position: 'top-center',
          autoClose: 8000,
        });
      }

      throw error;
    } finally {
      // Clean up
      this.activePolls.delete(txId);
    }
  }

  /**
   * Internal polling method
   */
  async _poll(txId, pactClient, transactionDescriptor, config, signal) {
    const { updateTransaction } = useTransactionStore.getState();
    
    console.log(`Starting poll for transaction: ${txId}`);
    
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      // Check if aborted
      if (signal.aborted) {
        throw new Error('Transaction polling was cancelled');
      }

      try {
        console.log(`Poll attempt ${attempt}/${config.maxRetries} for transaction: ${txId}`);
        
        // Update transaction with current attempt
        updateTransaction(txId, {
          pollAttempt: attempt,
          maxRetries: config.maxRetries,
          message: `Confirming transaction... (${attempt}/${config.maxRetries})`,
        });

        const result = await pactClient.listen({
          requestKey: transactionDescriptor.requestKey
        });
        
        console.log(`Poll attempt ${attempt} result:`, result);
        
        if (result && result.result) {
          console.log('Transaction confirmed:', result);
          return result;
        }
        
        // Wait before next retry (if not the last attempt)
        if (attempt < config.maxRetries) {
          console.log(`Waiting ${config.retryInterval}ms before next poll attempt...`);
          await this._delay(config.retryInterval, signal);
        }
      } catch (error) {
        console.error(`Error polling for transaction result (attempt ${attempt}):`, error);
        
        // Update transaction with error info
        updateTransaction(txId, {
          pollAttempt: attempt,
          lastError: error.message,
          message: `Polling error on attempt ${attempt}: ${error.message}`,
        });
        
        if (attempt === config.maxRetries) {
          throw new Error(`Transaction polling failed after ${config.maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry
        await this._delay(config.retryInterval, signal);
      }
    }
    
    throw new Error(`Transaction did not complete after ${config.maxRetries} attempts`);
  }

  /**
   * Stop polling for a specific transaction
   */
  stopPolling(txId) {
    const pollData = this.activePolls.get(txId);
    if (pollData) {
      pollData.controller.abort();
      this.activePolls.delete(txId);
      console.log(`Stopped polling for transaction: ${txId}`);
    }
  }

  /**
   * Stop all active polling
   */
  stopAllPolling() {
    // eslint-disable-next-line no-unused-vars
    for (const [txId, pollData] of this.activePolls) {
      pollData.controller.abort();
    }
    this.activePolls.clear();
    console.log('Stopped all transaction polling');
  }

  /**
   * Get active polling status
   */
  getActivePolls() {
    return Array.from(this.activePolls.keys());
  }

  /**
   * Check if a transaction is being polled
   */
  isPolling(txId) {
    return this.activePolls.has(txId);
  }

  /**
   * Delay helper that respects abort signal
   */
  _delay(ms, signal) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Polling was cancelled'));
        });
      }
    });
  }

  /**
   * Get polling statistics
   */
  getStats() {
    return {
      activePolls: this.activePolls.size,
      activeTxIds: Array.from(this.activePolls.keys()),
    };
  }
}

// Create singleton instance
const transactionPollingService = new TransactionPollingService();

export default transactionPollingService;

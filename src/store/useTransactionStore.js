import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateExplorerUrl, isValidTransactionKey } from '../utils/explorerUtils';

const useTransactionStore = create(
  persist(
    (set, get) => ({
      // Transaction state
      transactions: {},
      activeTransactions: new Set(),
      
      // Add a new transaction
      addTransaction: (txId, txData) => {
        const explorerUrl = isValidTransactionKey(txId) ? generateExplorerUrl(txId) : null;
        
        set((state) => ({
          transactions: {
            ...state.transactions,
            [txId]: {
              id: txId,
              status: 'pending',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              explorerUrl,
              ...txData,
            },
          },
          activeTransactions: new Set([...state.activeTransactions, txId]),
        }));
      },

      // Update transaction status
      updateTransaction: (txId, updates) => {
        set((state) => {
          const transaction = state.transactions[txId];
          if (!transaction) return state;

          // Preserve or generate explorer URL if not already set
          const explorerUrl = transaction.explorerUrl || 
            (isValidTransactionKey(txId) ? generateExplorerUrl(txId) : null);

          const updatedTransaction = {
            ...transaction,
            ...updates,
            explorerUrl,
            updatedAt: Date.now(),
          };

          const newActiveTransactions = new Set(state.activeTransactions);
          
          // Remove from active if completed (success/error)
          if (updates.status === 'success' || updates.status === 'error') {
            newActiveTransactions.delete(txId);
          }

          return {
            transactions: {
              ...state.transactions,
              [txId]: updatedTransaction,
            },
            activeTransactions: newActiveTransactions,
          };
        });
      },

      // Remove transaction
      removeTransaction: (txId) => {
        set((state) => {
          // eslint-disable-next-line no-unused-vars
          const { [txId]: _, ...remaining } = state.transactions;
          const newActiveTransactions = new Set(state.activeTransactions);
          newActiveTransactions.delete(txId);
          
          return {
            transactions: remaining,
            activeTransactions: newActiveTransactions,
          };
        });
      },

      // Get transaction by ID
      getTransaction: (txId) => {
        const transaction = get().transactions[txId] || null;
        if (!transaction) return null;
        
        return {
          ...transaction,
          explorerUrl: transaction.explorerUrl || (isValidTransactionKey(txId) ? generateExplorerUrl(txId) : null)
        };
      },

      // Get all transactions
      getAllTransactions: () => {
        const transactions = Object.values(get().transactions);
        // Ensure all transactions have explorer URLs if they don't already
        return transactions.map(tx => ({
          ...tx,
          explorerUrl: tx.explorerUrl || (isValidTransactionKey(tx.id) ? generateExplorerUrl(tx.id) : null)
        })).sort((a, b) => b.createdAt - a.createdAt);
      },

      // Get active transactions
      getActiveTransactions: () => {
        const { transactions, activeTransactions } = get();
        return Array.from(activeTransactions)
          .map(id => transactions[id])
          .filter(Boolean)
          .map(tx => ({
            ...tx,
            explorerUrl: tx.explorerUrl || (isValidTransactionKey(tx.id) ? generateExplorerUrl(tx.id) : null)
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
      },

      // Get transactions by status
      getTransactionsByStatus: (status) => {
        return Object.values(get().transactions)
          .filter(tx => tx.status === status)
          .map(tx => ({
            ...tx,
            explorerUrl: tx.explorerUrl || (isValidTransactionKey(tx.id) ? generateExplorerUrl(tx.id) : null)
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
      },

      // Get transactions by type
      getTransactionsByType: (type) => {
        return Object.values(get().transactions)
          .filter(tx => tx.type === type)
          .map(tx => ({
            ...tx,
            explorerUrl: tx.explorerUrl || (isValidTransactionKey(tx.id) ? generateExplorerUrl(tx.id) : null)
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
      },

      // Clear old transactions (older than 7 days)
      clearOldTransactions: () => {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        set((state) => {
          const filteredTransactions = Object.fromEntries(
            Object.entries(state.transactions).filter(
              // eslint-disable-next-line no-unused-vars
              ([_, tx]) => tx.createdAt > sevenDaysAgo
            )
          );
          
          return {
            transactions: filteredTransactions,
            activeTransactions: new Set(
              Array.from(state.activeTransactions).filter(
                id => filteredTransactions[id]
              )
            ),
          };
        });
      },

      // Clear all transactions
      clearAllTransactions: () => {
        set({
          transactions: {},
          activeTransactions: new Set(),
        });
      },

      // Get transaction statistics
      getTransactionStats: () => {
        const transactions = Object.values(get().transactions);
        return {
          total: transactions.length,
          pending: transactions.filter(tx => tx.status === 'pending').length,
          success: transactions.filter(tx => tx.status === 'success').length,
          error: transactions.filter(tx => tx.status === 'error').length,
          active: get().activeTransactions.size,
        };
      },

      // Get pending transactions that need status checking
      getPendingTransactions: () => {
        return Object.values(get().transactions)
          .filter(tx => tx.status === 'pending')
          .map(tx => ({
            ...tx,
            explorerUrl: tx.explorerUrl || (isValidTransactionKey(tx.id) ? generateExplorerUrl(tx.id) : null)
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
      },
    }),
    {
      name: 'kadpad-transactions', // localStorage key
      partialize: (state) => ({
        transactions: state.transactions,
        // Don't persist activeTransactions as they should be reset on app restart
      }),
    }
  )
);

export default useTransactionStore;

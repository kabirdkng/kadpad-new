/**
 * Explorer URL utilities for Kadena blockchain
 * Provides functions to generate explorer links for transactions
 */

import config from '../wallet/config.js';

/**
 * Generate an explorer URL for a transaction
 * @param {string} transactionKey - The transaction request key
 * @param {string} networkName - Optional network name (defaults to current config.name)
 * @returns {string} - Complete explorer URL
 */
export const generateExplorerUrl = (transactionKey, networkName = null) => {
  if (!transactionKey) {
    return null;
  }

  const currentNetworkName = networkName || config.name;
  return `https://explorer.kadena.io/${currentNetworkName}/transaction/${transactionKey}`;
};

/**
 * Generate an explorer URL for a block
 * @param {string} blockHash - The block hash
 * @param {string} chainId - The chain ID
 * @param {string} networkName - Optional network name (defaults to current config.name)
 * @returns {string} - Complete explorer URL
 */
export const generateBlockExplorerUrl = (blockHash, chainId, networkName = null) => {
  if (!blockHash || !chainId) {
    return null;
  }

  const currentNetworkName = networkName || config.name;
  return `https://explorer.kadena.io/${currentNetworkName}/chain/${chainId}/block/${blockHash}`;
};

/**
 * Generate an explorer URL for an account
 * @param {string} account - The account name
 * @param {string} chainId - The chain ID
 * @param {string} networkName - Optional network name (defaults to current config.name)
 * @returns {string} - Complete explorer URL
 */
export const generateAccountExplorerUrl = (account, chainId, networkName = null) => {
  if (!account || !chainId) {
    return null;
  }

  const currentNetworkName = networkName || config.name;
  return `https://explorer.kadena.io/${currentNetworkName}/chain/${chainId}/account/${encodeURIComponent(account)}`;
};

/**
 * Check if an explorer URL is valid (has transaction key)
 * @param {string} transactionKey - The transaction request key
 * @returns {boolean} - True if the transaction key is valid for generating URLs
 */
export const isValidTransactionKey = (transactionKey) => {
  return Boolean(transactionKey && typeof transactionKey === 'string' && transactionKey.trim().length > 0);
};

/**
 * Network Configuration Utilities
 * Provides centralized network configuration management
 */

import config from '../wallet/config.js';
import { getDexConfiguration } from './dexUtils.js';

/**
 * Get current network configuration
 * @returns {Object} Network configuration with networkId, chainId, and environment info
 */
export const getNetworkConfig = () => {
  return {
    networkId: config.networkId, 
    chainId: config.chainId,
    apiUrl: config.apiUrl,
    client: config.client,
    isMainnet: config.networkId === 'mainnet01',
    isTestnet: config.networkId === 'testnet04'
  };
};

/**
 * Get network-specific DEX configuration
 * @param {string} supplyChain Supply chain identifier
 * @returns {Object} DEX configuration for the current network
 */
export const getNetworkDexConfig = (supplyChain) => {
  const networkConfig = getNetworkConfig();
  
  return getDexConfiguration(supplyChain, networkConfig.networkId);
};

/**
 * Check if running on mainnet
 * @returns {boolean} True if on mainnet
 */
export const isMainnet = () => {
  const networkConfig = getNetworkConfig();
  return networkConfig.isMainnet;
};

/**
 * Check if running on testnet
 * @returns {boolean} True if on testnet
 */
export const isTestnet = () => {
  const networkConfig = getNetworkConfig();
  return networkConfig.isTestnet;
};

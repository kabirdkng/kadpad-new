import config from "../../wallet/config";
import providers from "../../wallet/providers/providers";
import { 
  isWalletRejectionError, 
  waitForContractToBeAvailable 
} from "./transactionHelpers.js";
import { 
  initiateDeployContract, 
  signAndProcessDeployTransactions, 
  processPreSignedTransactions 
} from "./contractDeployment.js";

/**
 * Deploys sales and treasury contracts with batch signing optimization
 */
export const deploySalesAndTreasuryContracts = async (
  salesContract,
  treasuryContract,
  namespace,
  moduleName,
  account,
  pubKey,
  providerName,
  client,
  session,
  chain = config.chainId,
  progressCallback = null
) => {
  try {
    const networkApi = config.apiUrl;
    const network = config.networkId;
    const provider = providers[providerName];
    
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
    }

    // Check if treasury contract is already available
    if (progressCallback) progressCallback('Checking existing contracts...');
    
    let treasuryExists = false;
    try {
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury', 1, 0);
      treasuryExists = true;
      if (progressCallback) progressCallback('Treasury exists, deploying sales...');
    } catch (error) {
      if (progressCallback) progressCallback('Treasury needed, preparing batch deployment...');
    }

    let treasuryResults = [];
    let salesResults = [];
    let allTransactionKeys = [];
    
    if (!treasuryExists) {
      // Deploy both treasury and sales contracts
      if (progressCallback) progressCallback('Creating transaction batches...');
      
      const treasuryTransactions = await initiateDeployContract(
        networkApi, network, account, pubKey, providerName, treasuryContract, [chain], 'treasury'
      );

      const salesTransactions = await initiateDeployContract(
        networkApi, network, account, pubKey, providerName, salesContract, [chain], 'sales'
      );

      // Batch sign both transactions at once
      if (progressCallback) progressCallback('Signing transaction batch...');
      
      const allCommands = [
        ...treasuryTransactions.map(tx => tx.command),
        ...salesTransactions.map(tx => tx.command)
      ];

      let signedBatch;
      if (providerName === "WC") {
        signedBatch = await provider.quickSignAll(allCommands, client, session);
      } else {
        signedBatch = await provider.quickSignAll(allCommands);
      }

      // Check if signing was successful
      if (!signedBatch || !signedBatch.responses || signedBatch.responses.length === 0) {
        throw new Error('Transaction signing was rejected by user');
      }

      if (signedBatch.status === 'fail' || signedBatch.error) {
        throw new Error(signedBatch.error || signedBatch.message || 'Transaction signing was rejected by user');
      }

      if (progressCallback) progressCallback('Deploying treasury contract...');

      // Process treasury deployment first
      treasuryResults = await processPreSignedTransactions(
        treasuryTransactions,
        signedBatch.responses.slice(0, treasuryTransactions.length),
        provider
      );

      if (treasuryResults.length === 0) {
        return {
          success: false,
          error: 'Treasury contract deployment failed',
          transactions: [],
          salesContractAddress: null,
          treasuryContractAddress: null,
          transactionKeys: []
        };
      }

      // Collect treasury transaction keys
      const treasuryKeys = treasuryResults.map(tx => tx.requestKey || tx.transactionDescriptor?.requestKey).filter(key => key);
      allTransactionKeys.push(...treasuryKeys);
      console.log('Treasury transaction keys:', treasuryKeys);
      
      // Wait for treasury contract to be available
      if (progressCallback) progressCallback('Waiting for treasury confirmation...');
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury');
      
      if (progressCallback) progressCallback('Deploying sales contract...');

      // Process sales deployment
      salesResults = await processPreSignedTransactions(
        salesTransactions,
        signedBatch.responses.slice(treasuryTransactions.length),
        provider
      );

      if (salesResults.length > 0) {
        allTransactionKeys.push(...salesResults.map(tx => tx.requestKey));
      }

    } else {
      // Only deploy sales contract
      if (progressCallback) progressCallback('Signing sales transaction...');
      
      const salesTransactions = await initiateDeployContract(
        networkApi, network, account, pubKey, providerName, salesContract, [chain], 'sales'
      );
      
      if (progressCallback) progressCallback('Deploying sales contract...');
      
      try {
        salesResults = await signAndProcessDeployTransactions(
          networkApi, network, null, namespace, moduleName,
          salesTransactions, providerName, client, session
        );
      } catch (error) {
        if (isWalletRejectionError(error)) {
          throw new Error('Transaction signing was rejected by user');
        }
        throw error;
      }

      if (salesResults.length > 0) {
        // Collect sales transaction keys
        const salesKeys = salesResults.map(tx => tx.requestKey || tx.transactionDescriptor?.requestKey).filter(key => key);
        allTransactionKeys.push(...salesKeys);
        console.log('Sales transaction keys:', salesKeys);
      } else {
        return {
          success: false,
          error: 'Sales contract deployment failed',
          transactions: [],
          salesContractAddress: null,
          treasuryContractAddress: `${namespace}.${moduleName}-treasury`,
          transactionKeys: []
        };
      }
    }

    // Wait for sales contract to be available
    if (salesResults.length > 0) {
      if (progressCallback) progressCallback('Waiting for sales contract confirmation...');
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'sales');
    }

    // Remove duplicates from all transaction keys
    allTransactionKeys = [...new Set(allTransactionKeys)];
    console.log('All collected transaction keys:', allTransactionKeys);

    const processedTransactions = [...treasuryResults, ...salesResults];

    return {
      success: true,
      transactions: processedTransactions,
      salesContractAddress: `${namespace}.${moduleName}-sales`,
      treasuryContractAddress: `${namespace}.${moduleName}-treasury`,
      transactionKeys: allTransactionKeys
    };

  } catch (error) {
    console.error('Deployment failed:', error);
    
    if (isWalletRejectionError(error)) {
      throw new Error('Transaction signing was rejected by user');
    }
    
    throw error;
  }
};

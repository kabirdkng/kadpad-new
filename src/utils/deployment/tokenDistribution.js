import { createClient } from "@kadena/client";
import providers from "../../wallet/providers/providers";
import { 
  createTx, 
  isWalletRejectionError, 
  extractSignedTransactionData
} from "./transactionHelpers.js";
import { pollForTransactionResult } from "../../pactcalls/kadena";

/**
 * Creates a token transfer transaction for contract accounts
 */
export const createTokenTransferTransaction = async (
  networkApi, 
  network, 
  account, 
  pubKey, 
  providerName, 
  namespace, 
  moduleName, 
  transferType, 
  amount, 
  chain
) => {
  let transferCode;
  let toAccount;
  
  // Use the correct pattern for each contract account type
  if (transferType === 'reserve') {
    transferCode = `(namespace '${namespace}) 
                     (use ${namespace}.${moduleName}-sales)
                     (install-capability (${namespace}.${moduleName}.TRANSFER) "${account}" RESERVE-ACCOUNT ${amount}.0})
                     (${namespace}.${moduleName}.transfer-create "${account}" RESERVE-ACCOUNT RESERVE-GUARD ${amount}.0)`;
    toAccount = 'RESERVE-ACCOUNT';
  } else if (transferType === 'liquidity') {
    transferCode = `(namespace '${namespace}) 
                     (use ${namespace}.${moduleName}-treasury) 
                     (install-capability (${namespace}.${moduleName}.TRANSFER) "${account}" LIQUIDITY-ACCOUNT ${amount}.0)
                     (${namespace}.${moduleName}.transfer-create "${account}" LIQUIDITY-ACCOUNT LIQUIDITY-GUARD ${amount}.0)`;
    toAccount = 'LIQUIDITY-ACCOUNT';
  } else if (transferType === 'treasury') {
    transferCode = `(namespace '${namespace}) 
                     (use ${namespace}.${moduleName}-treasury) 
                     (install-capability (${namespace}.${moduleName}.TRANSFER) "${account}" TREASURY-ACCOUNT ${amount}.0)
                     (${namespace}.${moduleName}.transfer-create "${account}" TREASURY-ACCOUNT TREASURY-GUARD ${amount}.0)`;
    toAccount = 'TREASURY-ACCOUNT';
  } else {
    throw new Error(`Invalid transfer type: ${transferType}`);
  }
  
  const capabilities = [
    { name: `${namespace}.${moduleName}.TRANSFER`, values: [account, toAccount, amount] },
    { name: 'coin.GAS', values: [] }
  ];

  return await createTx(transferCode, chain, account, pubKey, providerName, networkApi, network, capabilities);
};

/**
 * Transfers tokens to contract accounts after deployment
 */
export const transferTokensToContracts = async (
  namespace,
  moduleName,
  account,
  pubKey,
  providerName,
  client,
  session,
  tokenDistribution,
  chain,
  progressCallback = null
) => {
  try {
    const networkApi = import.meta.env.VITE_API_URL;
    const network = import.meta.env.VITE_NETWORK_ID;
    const provider = providers[providerName];
    
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
    }

    if (progressCallback) progressCallback('Preparing token transfers...');

    const transfers = [];
    const transactions = [];
    
    // Define the transfers based on token distribution using contract constants
    if (tokenDistribution.presalesAmount && tokenDistribution.presalesAmount > 0) {
      transfers.push({
        transferType: 'reserve',
        amount: tokenDistribution.presalesAmount,
        description: "Presale allocation"
      });
    }

    if (tokenDistribution.liquidityAmount && tokenDistribution.liquidityAmount > 0) {
      transfers.push({
        transferType: 'liquidity',
        amount: tokenDistribution.liquidityAmount,
        description: "DEX liquidity allocation"
      });
    }

    if (tokenDistribution.treasuryAmount && tokenDistribution.treasuryAmount > 0) {
      transfers.push({
        transferType: 'treasury',
        amount: tokenDistribution.treasuryAmount,
        description: "Treasury allocation"
      });
    }

    if (transfers.length === 0) {
      console.log('No token transfers needed');
      return {
        success: true,
        transfers: [],
        transactionKeys: []
      };
    }

    // Create transfer transactions
    for (const transfer of transfers) {
      console.log(`Creating transfer transaction: ${transfer.amount} tokens to ${transfer.transferType} account`);
      
      const tx = await createTokenTransferTransaction(
        networkApi,
        network,
        account,
        pubKey,
        providerName,
        namespace,
        moduleName,
        transfer.transferType,
        transfer.amount,
        chain
      );

      transactions.push({
        ...tx,
        transfer: transfer,
        pactClient: createClient(`${networkApi}/chainweb/0.0/${network}/chain/${chain}/pact`)
      });
    }

    if (progressCallback) progressCallback('Signing token transfer transactions...');

    // Sign all transfer transactions at once
    const commands = transactions.map(tx => tx.command);
    let signedBatch;

    if (providerName === "WC") {
      signedBatch = await provider.quickSignAll(commands, client, session);
    } else {
      signedBatch = await provider.quickSignAll(commands);
    }

    // Check if signing was successful
    if (!signedBatch || !signedBatch.responses || signedBatch.responses.length === 0) {
      throw new Error('Token transfer transaction signing was rejected by user');
    }

    if (signedBatch.status === 'fail' || signedBatch.error) {
      throw new Error(signedBatch.error || signedBatch.message || 'Token transfer transaction signing failed');
    }

    if (progressCallback) progressCallback('Processing token transfers...');

    const transferResults = [];
    const transferKeys = [];

    // Submit all transfer transactions in parallel
    const transferPromises = transactions.map(async (tx, i) => {
      const signedTx = signedBatch.responses[i];
      
      try {
        const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
        
        // Submit transaction (don't wait for confirmation yet)
        const bodyPayload = { cmd, sigs, hash: outcomeHash };
        
        // Preflight check
        const preflightResult = await tx.pactClient.dirtyRead(bodyPayload);
        
        if (preflightResult.result.status === 'failure') {
          console.error(`Transfer to ${tx.transfer.transferType} account preflight failed:`, preflightResult.result.error);
          // Following tokengen pattern: return null for preflight failures
          return null;
        }

        // Submit transaction
        const transactionDescriptor = await tx.pactClient.submit(bodyPayload);
        
        return {
          transfer: tx.transfer,
          transactionDescriptor,
          pactClient: tx.pactClient,
          requestKey: transactionDescriptor.requestKey
        };
      } catch (error) {
        console.error(`Error submitting transfer to ${tx.transfer.transferType} account:`, error);
        throw error;
      }
    });

    // Wait for all submissions to complete
    const submittedTransfers = (await Promise.all(transferPromises)).filter(Boolean);
    
    // Collect all request keys
    submittedTransfers.forEach(transfer => {
      transferKeys.push(transfer.requestKey);
    });

    if (progressCallback) progressCallback('All token transfers submitted, waiting for confirmations...');

    // Now wait for all transactions to be mined in parallel
    const confirmationPromises = submittedTransfers.map(async (transfer) => {
      try {
        const result = await pollForTransactionResult(transfer.pactClient, transfer.transactionDescriptor);
        
        if (result.result.status === 'success') {
          console.log(`Successfully transferred ${transfer.transfer.amount} tokens to ${transfer.transfer.transferType} account`);
          if (progressCallback) {
            progressCallback(`Confirmed: ${transfer.transfer.amount} tokens to ${transfer.transfer.description}`);
          }
          
          return {
            transfer: transfer.transfer,
            result: result,
            requestKey: transfer.requestKey
          };
        } else {
          throw new Error(`Transfer to ${transfer.transfer.transferType} account failed: ${result.result.error.message}`);
        }
      } catch (error) {
        console.error(`Error confirming transfer to ${transfer.transfer.transferType} account:`, error);
        throw error;
      }
    });

    // Wait for all confirmations
    const confirmedTransfers = await Promise.all(confirmationPromises);
    transferResults.push(...confirmedTransfers);

    console.log('All token transfers completed successfully');
    console.log('Transfer transaction keys:', transferKeys);

    return {
      success: true,
      transfers: transferResults,
      transactionKeys: transferKeys
    };

  } catch (error) {
    console.error('Token transfer failed:', error);
    
    if (isWalletRejectionError(error)) {
      throw new Error('Token transfer transaction signing was rejected by user');
    }
    
    throw error;
  }
};

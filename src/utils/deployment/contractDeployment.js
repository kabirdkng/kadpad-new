import { createClient } from "@kadena/client";
import providers from "../../wallet/providers/providers";
import { 
  createTx, 
  isWalletRejectionError, 
  extractSignedTransactionData, 
  submitAndWaitForTransaction 
} from "./transactionHelpers.js";

/**
 * Initiates deployment contract transactions
 */
export const initiateDeployContract = async (networkApi, network, account, pubKey, providerName, contractCode, chains, suffix) => {
  const transactions = [];

  for (const chain of chains) {
    const transactionId = `${chain}-${suffix}`;
    try {
      const pactClient = createClient(`${networkApi}/chainweb/0.0/${network}/chain/${chain}/pact`);
      const { command, txHash } = await createTx(contractCode, chain, account, pubKey, providerName, networkApi, network);
      
      transactions.push({
        transactionId,
        command,
        txHash,
        chain,
        suffix,
        pactClient
      });
    } catch (error) {
      console.error(`Error creating transaction for chain ${chain}:`, error);
      throw error;
    }
  }

  return transactions;
};

/**
 * Signs and processes deployment transactions
 */
export const signAndProcessDeployTransactions = async (
  networkApi, 
  network, 
  contract, 
  namespace, 
  moduleName, 
  transactions, 
  providerName
) => {
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Provider not found: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
  }

  // Sign all transactions at once
  const commands = transactions.map(tx => tx.command);

  let signedBatch;
  try {
    console.log("Signing transactions with provider:", providerName);
    signedBatch = await provider.quickSignAll(commands);
  } catch (error) {
    if (isWalletRejectionError(error)) {
      throw new Error('Transaction signing was rejected by user');
    }
    throw new Error(`Signing failed: ${error.message}`);
  }

  // Check if signing was successful
  if (!signedBatch || !signedBatch.responses || signedBatch.responses.length === 0) {
    throw new Error('Transaction signing was rejected or failed');
  }

  if (signedBatch.status === 'fail' || signedBatch.error) {
    throw new Error(signedBatch.error || signedBatch.message || 'Transaction signing failed');
  }

  let signedTransactions = [];

  // Process each signed transaction
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const signedTx = signedBatch.responses[i];
    
    try {
      const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
      const processedTx = await submitAndWaitForTransaction(tx, cmd, sigs, outcomeHash);
      
      if (processedTx) {
        signedTransactions.push(processedTx);
      } else {
        return; // Following tokengen pattern: return for table already exists
      }
    } catch (error) {
      console.error(`Error processing transaction for chain ${tx.chain}:`, error);
      throw error;
    }
  }

  return signedTransactions;
};

/**
 * Processes pre-signed transactions
 */
export const processPreSignedTransactions = async (transactions, signedResponses, provider) => {
  const signedTransactions = [];

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const signedTx = signedResponses[i];
    
    try {
      const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
      const processedTx = await submitAndWaitForTransaction(tx, cmd, sigs, outcomeHash);
      
      if (processedTx) {
        signedTransactions.push(processedTx);
      } else {
        return []; // Return empty array to indicate failure
      }
    } catch (error) {
      console.error(`Error processing pre-signed transaction for chain ${tx.chain}:`, error);
      throw error;
    }
  }

  return signedTransactions;
};

import { Pact, createClient } from "@kadena/client";
import providers from "../wallet/providers/providers";
import config from "../wallet/config";
import { pollForTransactionResult } from "../pactcalls/kadena";

const createTx = async (code, chain, account, pubKey, providerName, networkApi, network, capabilities = []) => {
  let provider = providers[providerName];

  if (!provider) {
    throw new Error(`Provider not found: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
  }

  let builder = Pact.builder
    .execution(code)
    .setMeta({
      chainId: String(chain),
      gasLimit: 90000,
      gasPrice: 0.00000001,
      sender: account,
      ttl: 28800,
    })
    .addKeyset("ks", "keys-all", pubKey)
    .setNetworkId(network);

  builder = builder.addSigner(pubKey, (signFor) => {
    return capabilities.flatMap((cap) => {
      const { name, values } = cap;
      return signFor(name, ...values);
    });
  });
  
  const command = builder.createTransaction();
  return { command, txHash: command.hash };
};

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

// Helper function to check if error is a wallet rejection
const isWalletRejectionError = (error) => {
  return error.message && (
    error.message.includes('rejected') || 
    error.message.includes('cancelled') || 
    error.message.includes('denied') ||
    error.message.includes('User rejected') ||
    error.message.includes('User canceled')
  );
};

// Helper function to process signed transaction response
const extractSignedTransactionData = (signedTx, provider) => {
  if (provider.name === "wc" || provider.name === "WC") {
    return {
      cmd: signedTx.cmd,
      sigs: signedTx.sigs,
      outcomeHash: signedTx.hash
    };
  } else {
    const commandSigData = signedTx.commandSigData;
    return {
      cmd: commandSigData.cmd,
      sigs: commandSigData.sigs,
      outcomeHash: signedTx.outcome.hash
    };
  }
};

// Helper function to submit and wait for transaction
const submitAndWaitForTransaction = async (tx, cmd, sigs, outcomeHash) => {
  const bodyPayload = { cmd, sigs, hash: outcomeHash };

  // Preflight check
  const preflightResult = await tx.pactClient.dirtyRead(bodyPayload);
  
  if (preflightResult.result.status === 'failure') {
    console.error(`Deployment failed for chain ${tx.chain}:`, preflightResult.result.error);
    return null;
  }

  // Submit transaction
  const transactionDescriptor = await tx.pactClient.submit(bodyPayload);

  // Wait for transaction to be mined
  const result = await pollForTransactionResult(tx.pactClient, transactionDescriptor);
  
  if (result.result.status === 'success') {
    return {
      ...tx,
      requestKey: transactionDescriptor.requestKey,
      pactClient: tx.pactClient,
      transactionDescriptor,
      result
    };
  } else {
    throw new Error(`Transaction failed: ${result.result.error.message}`);
  }
};

export const signAndProcessDeployTransactions = async (
  networkApi, 
  network, 
  contract, 
  namespace, 
  moduleName, 
  transactions, 
  providerName, 
  client, 
  session
) => {
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Provider not found: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
  }

  // Sign all transactions at once
  const commands = transactions.map(tx => tx.command);

  let signedBatch;
  try {
    if (providerName === "WC") {
      signedBatch = await provider.quickSignAll(commands, client, session);
    } else {
      signedBatch = await provider.quickSignAll(commands);
    }
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

// Helper function to wait for contract to be available on blockchain
const waitForContractToBeAvailable = async (networkApi, network, chain, namespace, moduleName, contractType, maxRetries = 30, delayMs = 5000) => {
  const pactClient = createClient(`${networkApi}/chainweb/0.0/${network}/chain/${chain}/pact`);
  const contractName = `${namespace}.${moduleName}-${contractType}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const checkCommand = Pact.builder
        .execution(`(describe-module "${contractName}")`)
        .setMeta({
          chainId: String(chain),
          gasLimit: 1000,
          gasPrice: 0.00000001,
          sender: "",
          ttl: 600,
        })
        .setNetworkId(network)
        .createTransaction();

      const result = await pactClient.dirtyRead(checkCommand);
      
      if (result.result.status === 'success') {
        return true;
      }
    } catch (error) {
      // Contract not available yet, continue waiting
    }
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error(`Contract ${contractName} did not become available after ${maxRetries} attempts`);
};

// Helper function to process pre-signed transactions
const processPreSignedTransactions = async (transactions, signedResponses, provider, namespace, moduleName) => {
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

// Function to deploy sales and treasury contracts with batch signing optimization
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
        provider,
        namespace,
        moduleName
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
        provider,
        namespace,
        moduleName
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

    // Remove duplicates from all transaction keys
    allTransactionKeys = [...new Set(allTransactionKeys)];
    console.log('All collected transaction keys:', allTransactionKeys);

    const processedTransactions = [...treasuryResults, ...salesResults];

    return {
      success: true,
      transactions: processedTransactions,
      salesContractAddress: `${namespace}.${moduleName}-sales`,
      treasuryContractAddress: `${namespace}.${moduleName}-treasury`,
      transactionKeys: allTransactionKeys // Ensure keys are returned
    };

  } catch (error) {
    console.error('Deployment failed:', error);
    
    if (isWalletRejectionError(error)) {
      throw new Error('Transaction signing was rejected by user');
    }
    
    throw error;
  }
};

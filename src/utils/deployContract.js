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

// Function to deploy sales and treasury contracts with batch signing optimization (internal use only)
const deploySalesAndTreasuryContracts = async (
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

// Function to create token transfer transactions
const createTokenTransferTransaction = async (
  networkApi, 
  network, 
  account, 
  pubKey, 
  providerName, 
  namespace, 
  moduleName, 
  toAccount, 
  amount, 
  chain = config.chainId
) => {
  const transferCode = `(${namespace}.${moduleName}.transfer-create "${account}" "${toAccount}" (read-keyset "ks") ${amount}.0)`;
  
  const capabilities = [
    { name: `${namespace}.${moduleName}.TRANSFER`, values: [account, toAccount, amount] },
    { name: 'coin.GAS', values: [] }
  ];

  return await createTx(transferCode, chain, account, pubKey, providerName, networkApi, network, capabilities);
};

// Function to transfer tokens after contract deployment (internal use only)
const transferTokensToContracts = async (
  namespace,
  moduleName,
  account,
  pubKey,
  providerName,
  client,
  session,
  tokenDistribution,
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

    if (progressCallback) progressCallback('Preparing token transfers...');

    const transfers = [];
    const transactions = [];
    
    // Define the transfers based on token distribution
    if (tokenDistribution.presalesAmount && tokenDistribution.presalesAmount > 0) {
      transfers.push({
        contractAccount: `${namespace}.${moduleName}-sales.RESERVE-ACCOUNT`,
        amount: tokenDistribution.presalesAmount,
        description: "Presale allocation"
      });
    }

    if (tokenDistribution.liquidityAmount && tokenDistribution.liquidityAmount > 0) {
      transfers.push({
        contractAccount: `${namespace}.${moduleName}-treasury.LIQUIDITY-ACCOUNT`,
        amount: tokenDistribution.liquidityAmount,
        description: "DEX liquidity allocation"
      });
    }

    if (tokenDistribution.treasuryAmount && tokenDistribution.treasuryAmount > 0) {
      transfers.push({
        contractAccount: `${namespace}.${moduleName}-treasury.TREASURY-ACCOUNT`,
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
      console.log(`Creating transfer transaction: ${transfer.amount} tokens to ${transfer.contractAccount}`);
      
      const tx = await createTokenTransferTransaction(
        networkApi,
        network,
        account,
        pubKey,
        providerName,
        namespace,
        moduleName,
        transfer.contractAccount,
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
          throw new Error(`Transfer to ${tx.transfer.contractAccount} preflight failed: ${preflightResult.result.error.message}`);
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
        console.error(`Error submitting transfer to ${tx.transfer.contractAccount}:`, error);
        throw error;
      }
    });

    // Wait for all submissions to complete
    const submittedTransfers = await Promise.all(transferPromises);
    
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
          console.log(`Successfully transferred ${transfer.transfer.amount} tokens to ${transfer.transfer.contractAccount}`);
          if (progressCallback) {
            progressCallback(`Confirmed: ${transfer.transfer.amount} tokens to ${transfer.transfer.description}`);
          }
          
          return {
            transfer: transfer.transfer,
            result: result,
            requestKey: transfer.requestKey
          };
        } else {
          throw new Error(`Transfer to ${transfer.transfer.contractAccount} failed: ${result.result.error.message}`);
        }
      } catch (error) {
        console.error(`Error confirming transfer to ${transfer.transfer.contractAccount}:`, error);
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

// Combined function to deploy contracts and transfer tokens with single batch signing
export const deploySalesAndTreasuryWithTokenDistribution = async (
  salesContract,
  treasuryContract,
  namespace,
  moduleName,
  account,
  pubKey,
  providerName,
  client,
  session,
  tokenDistribution,
  chain = config.chainId,
  progressCallback = null
) => {
  try {
    console.log('=== Starting Smart Deployment with Token Distribution ===');
    console.log('Token distribution:', tokenDistribution);

    const networkApi = config.apiUrl;
    const network = config.networkId;
    const provider = providers[providerName];
    
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
    }

    // Step 1: Check what contracts exist
    if (progressCallback) progressCallback('Checking existing contracts...');
    
    let treasuryExists = false;
    let salesExists = false;

    try {
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury', 1, 0);
      treasuryExists = true;
      console.log('Treasury contract exists');
    } catch (error) {
      console.log('Treasury contract not found');
    }

    try {
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'sales', 1, 0);
      salesExists = true;
      console.log('Sales contract exists');
    } catch (error) {
      console.log('Sales contract not found');
    }

    // Step 2: Prepare all transactions (deployment + distribution) for single batch signing
    let allTransactions = [];
    let deploymentTransactions = [];
    let transferTransactions = [];
    let allTransactionKeys = [];

    // Prepare deployment transactions based on what exists
    if (!treasuryExists) {
      if (progressCallback) progressCallback('Preparing treasury deployment transaction...');
      const treasuryTxs = await initiateDeployContract(
        networkApi, network, account, pubKey, providerName, treasuryContract, [chain], 'treasury'
      );
      deploymentTransactions.push(...treasuryTxs);
    }

    if (!salesExists) {
      if (progressCallback) progressCallback('Preparing sales deployment transaction...');
      const salesTxs = await initiateDeployContract(
        networkApi, network, account, pubKey, providerName, salesContract, [chain], 'sales'
      );
      deploymentTransactions.push(...salesTxs);
    }

    // Step 3: Prepare token transfer transactions
    if (progressCallback) progressCallback('Preparing token transfer transactions...');
    
    const transfers = [];
    
    // Define the transfers based on token distribution
    if (tokenDistribution.presalesAmount && tokenDistribution.presalesAmount > 0) {
      transfers.push({
        contractAccount: `${namespace}.${moduleName}-sales.RESERVE-ACCOUNT`,
        amount: tokenDistribution.presalesAmount,
        description: "Presale allocation"
      });
    }

    if (tokenDistribution.liquidityAmount && tokenDistribution.liquidityAmount > 0) {
      transfers.push({
        contractAccount: `${namespace}.${moduleName}-treasury.LIQUIDITY-ACCOUNT`,
        amount: tokenDistribution.liquidityAmount,
        description: "DEX liquidity allocation"
      });
    }

    if (tokenDistribution.treasuryAmount && tokenDistribution.treasuryAmount > 0) {
      transfers.push({
        contractAccount: `${namespace}.${moduleName}-treasury.TREASURY-ACCOUNT`,
        amount: tokenDistribution.treasuryAmount,
        description: "Treasury allocation"
      });
    }

    // Create transfer transactions
    for (const transfer of transfers) {
      console.log(`Preparing transfer transaction: ${transfer.amount} tokens to ${transfer.contractAccount}`);
      
      const tx = await createTokenTransferTransaction(
        networkApi,
        network,
        account,
        pubKey,
        providerName,
        namespace,
        moduleName,
        transfer.contractAccount,
        transfer.amount,
        chain
      );

      transferTransactions.push({
        ...tx,
        transfer: transfer,
        pactClient: createClient(`${networkApi}/chainweb/0.0/${network}/chain/${chain}/pact`)
      });
    }

    // Step 4: Combine all transactions for single batch signing
    allTransactions = [...deploymentTransactions, ...transferTransactions];
    
    if (allTransactions.length === 0) {
      // Both contracts exist and no transfers needed
      if (progressCallback) progressCallback('All contracts exist and no transfers needed...');
      
      return {
        success: true,
        salesContractAddress: `${namespace}.${moduleName}-sales`,
        treasuryContractAddress: `${namespace}.${moduleName}-treasury`,
        transactionKeys: [],
        transfers: []
      };
    }

    // Step 5: Sign all transactions in a single batch
    if (progressCallback) progressCallback(`Signing all ${allTransactions.length} transactions in single batch...`);
    
    const allCommands = allTransactions.map(tx => tx.command);
    console.log(`Preparing to sign ${allCommands.length} transactions in single batch`);
    console.log(`- Deployment transactions: ${deploymentTransactions.length}`);
    console.log(`- Transfer transactions: ${transferTransactions.length}`);

    let signedBatch;
    try {
      if (providerName === "WC") {
        signedBatch = await provider.quickSignAll(allCommands, client, session);
      } else {
        signedBatch = await provider.quickSignAll(allCommands);
      }
    } catch (error) {
      if (isWalletRejectionError(error)) {
        throw new Error('Transaction signing was rejected by user');
      }
      throw new Error(`Batch signing failed: ${error.message}`);
    }

    // Check if signing was successful
    if (!signedBatch || !signedBatch.responses || signedBatch.responses.length === 0) {
      throw new Error('Transaction signing was rejected or failed');
    }

    if (signedBatch.status === 'fail' || signedBatch.error) {
      throw new Error(signedBatch.error || signedBatch.message || 'Transaction signing failed');
    }

    console.log(`Successfully signed ${signedBatch.responses.length} transactions`);

    // Step 6: Process deployment transactions first
    let deploymentResults = [];
    if (deploymentTransactions.length > 0) {
      if (progressCallback) progressCallback('Processing deployment transactions...');
      
      for (let i = 0; i < deploymentTransactions.length; i++) {
        const tx = deploymentTransactions[i];
        const signedTx = signedBatch.responses[i];
        
        try {
          const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
          const processedTx = await submitAndWaitForTransaction(tx, cmd, sigs, outcomeHash);
          
          if (processedTx) {
            deploymentResults.push(processedTx);
            const key = processedTx.requestKey || processedTx.transactionDescriptor?.requestKey;
            if (key) allTransactionKeys.push(key);
          }
        } catch (error) {
          console.error(`Error processing deployment transaction:`, error);
          throw error;
        }
      }

      // Wait for contracts to be available before processing transfers
      if (deploymentResults.length > 0) {
        if (!treasuryExists && deploymentResults.some(tx => tx.suffix === 'treasury')) {
          if (progressCallback) progressCallback('Waiting for treasury contract confirmation...');
          await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury');
        }
        
        if (!salesExists && deploymentResults.some(tx => tx.suffix === 'sales')) {
          if (progressCallback) progressCallback('Waiting for sales contract confirmation...');
          await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'sales');
        }
      }
    }

    // Step 7: Process transfer transactions
    let transferResults = [];
    if (transferTransactions.length > 0) {
      if (progressCallback) progressCallback('Processing token transfer transactions...');
      
      const transferSubmissions = [];
      
      // Submit all transfer transactions
      for (let i = 0; i < transferTransactions.length; i++) {
        const tx = transferTransactions[i];
        const signedTx = signedBatch.responses[deploymentTransactions.length + i];
        
        try {
          const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
          
          // Submit transaction (don't wait for confirmation yet)
          const bodyPayload = { cmd, sigs, hash: outcomeHash };
          
          // Preflight check
          const preflightResult = await tx.pactClient.dirtyRead(bodyPayload);
          
          if (preflightResult.result.status === 'failure') {
            throw new Error(`Transfer to ${tx.transfer.contractAccount} preflight failed: ${preflightResult.result.error.message}`);
          }

          // Submit transaction
          const transactionDescriptor = await tx.pactClient.submit(bodyPayload);
          
          transferSubmissions.push({
            transfer: tx.transfer,
            transactionDescriptor,
            pactClient: tx.pactClient,
            requestKey: transactionDescriptor.requestKey
          });

          allTransactionKeys.push(transactionDescriptor.requestKey);
        } catch (error) {
          console.error(`Error submitting transfer to ${tx.transfer.contractAccount}:`, error);
          throw error;
        }
      }

      if (progressCallback) progressCallback('Waiting for transfer confirmations...');

      // Wait for all transfer confirmations
      for (const submission of transferSubmissions) {
        try {
          const result = await pollForTransactionResult(submission.pactClient, submission.transactionDescriptor);
          
          if (result.result.status === 'success') {
            console.log(`Successfully transferred ${submission.transfer.amount} tokens to ${submission.transfer.contractAccount}`);
            transferResults.push({
              transfer: submission.transfer,
              result: result,
              requestKey: submission.requestKey
            });
          } else {
            throw new Error(`Transfer to ${submission.transfer.contractAccount} failed: ${result.result.error.message}`);
          }
        } catch (error) {
          console.error(`Error confirming transfer to ${submission.transfer.contractAccount}:`, error);
          throw error;
        }
      }
    }

    // Combine all transaction keys
    allTransactionKeys = [...new Set(allTransactionKeys)];

    // Step 8: Mark project as deployed after successful distribution
    if (progressCallback) progressCallback('Updating project status...');
    
    try {
      const { markProjectAsDeployed } = await import('../api.js');
      
      const deploymentData = {
        salesContractAddress: `${namespace}.${moduleName}-sales`,
        treasuryContractAddress: `${namespace}.${moduleName}-treasury`,
        deploymentTransactionKeys: allTransactionKeys,
        deployedAt: new Date().toISOString(),
        tokenDistribution: {
          presalesAmount: tokenDistribution.presalesAmount,
          liquidityAmount: tokenDistribution.liquidityAmount,
          treasuryAmount: tokenDistribution.treasuryAmount
        }
      };

      await markProjectAsDeployed(namespace, moduleName, deploymentData);
      console.log('Project marked as deployed successfully');
    } catch (error) {
      console.warn('Failed to mark project as deployed:', error.message);
      // Don't fail the entire deployment for this
    }

    if (progressCallback) progressCallback('Deployment and distribution completed successfully!');

    console.log('=== Complete Deployment and Distribution Successful ===');
    console.log('All transaction keys:', allTransactionKeys);
    console.log(`Batch signed ${allTransactions.length} transactions total`);

    return {
      success: true,
      deployment: {
        success: true,
        transactions: deploymentResults,
        salesContractAddress: `${namespace}.${moduleName}-sales`,
        treasuryContractAddress: `${namespace}.${moduleName}-treasury`,
        transactionKeys: allTransactionKeys
      },
      tokenDistribution: {
        success: true,
        transfers: transferResults,
        transactionKeys: allTransactionKeys
      },
      salesContractAddress: `${namespace}.${moduleName}-sales`,
      treasuryContractAddress: `${namespace}.${moduleName}-treasury`,
      transactionKeys: allTransactionKeys,
      transfers: transferResults
    };

  } catch (error) {
    console.error('Complete deployment failed:', error);
    
    if (isWalletRejectionError(error)) {
      throw new Error('Transaction signing was rejected by user');
    }
    
    throw error;
  }
};

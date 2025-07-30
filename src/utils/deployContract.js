import { Pact, createClient } from "@kadena/client";
import providers from "../wallet/providers/providers";
import config from "../wallet/config";
import { pollForTransactionResult } from "../pactcalls/kadena";

const createTx = async (code, chain, account, pubKey, providerName, networkApi, network, capabilities = []) => {
  let provider = providers[providerName];

  if (!provider) {
    throw new Error(`Provider not found: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
  }

  console.log('Creating transaction with:');
  console.log('- Chain:', chain);
  console.log('- Account:', account);
  console.log('- PubKey:', pubKey);
  console.log('- Provider:', providerName);
  console.log('- PubKey type:', typeof pubKey);
  console.log('- PubKey length:', pubKey?.length);

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

  console.log('=== Starting batch signing process ===');
  console.log('Provider:', providerName);
  console.log('Provider object:', provider);
  console.log('Provider name property:', provider.name);
  console.log('Transactions to sign:', transactions.length);
  console.log('Client available:', !!client);
  console.log('Session available:', !!session);

  // Sign all transactions at once using quickSignAll (like tokengen)
  console.log('Signing all transactions in batch...');
  const commands = transactions.map(tx => tx.command);
  console.log('Commands to sign:', commands.length);

  let signedBatch;
  
  if (providerName === "WC") {
    console.log('Using WalletConnect batch signing...');
    signedBatch = await provider.quickSignAll(commands, client, session);
  } else {
    console.log('Using standard provider batch signing...');
    signedBatch = await provider.quickSignAll(commands);
  }

  console.log('Batch signing result:', signedBatch);

  let signedTransactions = [];

  // Process each signed transaction
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const signedTx = signedBatch.responses[i];
    
    try {
      console.log(`Processing signed transaction for chain ${tx.chain}...`);
      
      let cmd, sigs, outcomeHash;

      if (provider.name === "wc" || provider.name === "WC") {
        cmd = signedTx.cmd;
        sigs = signedTx.sigs;
        outcomeHash = signedTx.hash;
      } else {
        const commandSigData = signedTx.commandSigData;
        cmd = commandSigData.cmd;
        sigs = commandSigData.sigs;
        outcomeHash = signedTx.outcome.hash;
      }

      const bodyPayload = {
        cmd,
        sigs,
        hash: outcomeHash,
      };

      console.log('Body payload for preflight:', bodyPayload);

      // Preflight check
      const preflightResult = await tx.pactClient.dirtyRead(bodyPayload);
      console.log(`Preflight result for chain ${tx.chain}:`, preflightResult);
      
      if (preflightResult.result.status === 'failure') {
        console.error(`Deployment failed for chain ${tx.chain}:`, preflightResult.result.error);
        // Following tokengen pattern: return instead of throwing error for table already exists
        return;
      }

      // Submit transaction
      const transactionDescriptor = await tx.pactClient.submit(bodyPayload);
      console.log(`Contract deployment TX Key for chain ${tx.chain}:`, transactionDescriptor.requestKey);

      // Wait for transaction to be mined using existing polling function
      console.log(`Waiting for transaction to be mined on chain ${tx.chain}...`);
      const result = await pollForTransactionResult(tx.pactClient, transactionDescriptor);
      
      if (result.result.status === 'success') {
        console.log(`✅ Transaction successfully mined on chain ${tx.chain}`);
      } else {
        console.error(`❌ Transaction failed on chain ${tx.chain}:`, result.result.error);
        throw new Error(`Transaction failed: ${result.result.error.message}`);
      }

      signedTransactions.push({
        ...tx,
        requestKey: transactionDescriptor.requestKey,
        pactClient: tx.pactClient,
        transactionDescriptor,
        result
      });

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
  
  console.log(`Polling for contract availability: ${contractName}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}: Checking if ${contractName} exists...`);
      
      // Try to describe the module to see if it exists
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
        console.log(`✅ Contract ${contractName} is available on blockchain`);
        return true;
      } else {
        console.log(`❌ Contract ${contractName} not yet available, waiting...`);
      }
    } catch (error) {
      console.log(`⏳ Contract ${contractName} not available yet (attempt ${attempt}), waiting ${delayMs}ms...`);
    }
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error(`Contract ${contractName} did not become available after ${maxRetries} attempts`);
};

// Function to deploy sales and treasury contracts following tokengen's pattern
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
  chain = config.chainId
) => {
  try {
    console.log('=== Starting tokengen-style deployment ===');
    console.log('Chain:', chain);
    console.log('Namespace:', namespace);
    console.log('Module:', moduleName);

    const networkApi = config.apiUrl;
    const network = config.networkId;

    // Check if treasury contract is already available
    console.log('Checking if treasury contract already exists...');
    let treasuryExists = false;
    try {
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury', 1, 0);
      treasuryExists = true;
      console.log('✅ Treasury contract already exists, skipping treasury deployment');
    } catch (error) {
      console.log('ℹ️ Treasury contract does not exist, will deploy it first');
    }

    let treasuryResults = [];
    
    if (!treasuryExists) {
      // Create treasury deployment transaction
      console.log('Creating treasury deployment transaction...');
      const treasuryTransactions = await initiateDeployContract(
        networkApi,
        network,
        account,
        pubKey,
        providerName,
        treasuryContract,
        [chain],
        'treasury'
      );

      // Process treasury first
      console.log('Step 1: Processing treasury deployment...');
      treasuryResults = await signAndProcessDeployTransactions(
        networkApi,
        network,
        null, // not used in this context
        namespace,
        moduleName,
        treasuryTransactions,
        providerName,
        client,
        session
      );

      console.log('Treasury deployment completed, waiting for contract availability...');
      
      // Wait for treasury contract to be available on blockchain before deploying sales
      console.log('Step 1.5: Waiting for treasury contract to be available on blockchain...');
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury');
      
      console.log('Treasury contract confirmed available, now processing sales...');
    } else {
      console.log('Treasury contract already available, proceeding directly to sales deployment...');
    }

    // Create sales deployment transaction
    console.log('Creating sales deployment transaction...');
    const salesTransactions = await initiateDeployContract(
      networkApi,
      network,
      account,
      pubKey,
      providerName,
      salesContract,
      [chain],
      'sales'
    );
    
    // Process sales deployment
    console.log('Step 2: Processing sales deployment...');
    const salesResults = await signAndProcessDeployTransactions(
      networkApi,
      network,
      null, // not used in this context
      namespace,
      moduleName,
      salesTransactions,
      providerName,
      client,
      session
    );

    const processedTransactions = [...treasuryResults, ...salesResults];

    console.log('=== Deployment transactions completed ===');
    console.log('Processed transactions:', processedTransactions.length);

    return {
      success: true,
      transactions: processedTransactions,
      salesContractAddress: `${namespace}.${moduleName}-sales`,
      treasuryContractAddress: `${namespace}.${moduleName}-treasury`
    };

  } catch (error) {
    console.error('=== Deployment failed ===', error);
    throw error;
  }
};

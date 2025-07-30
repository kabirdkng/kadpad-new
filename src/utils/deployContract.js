import { Pact, createClient } from "@kadena/client";
import providers from "../wallet/providers/providers";
import config from "../wallet/config";

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

      signedTransactions.push({
        ...tx,
        requestKey: transactionDescriptor.requestKey,
        pactClient: tx.pactClient,
        transactionDescriptor
      });

    } catch (error) {
      console.error(`Error processing transaction for chain ${tx.chain}:`, error);
      throw error;
    }
  }

  return signedTransactions;
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

    // Combine all transactions
    const allTransactions = [...treasuryTransactions, ...salesTransactions];

    // Sign and process all transactions
    console.log('Signing and processing all transactions...');
    const processedTransactions = await signAndProcessDeployTransactions(
      networkApi,
      network,
      null, // not used in this context
      namespace,
      moduleName,
      allTransactions,
      providerName,
      client,
      session
    );

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

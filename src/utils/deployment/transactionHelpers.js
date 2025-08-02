import { Pact, createClient } from "@kadena/client";
import providers from "../../wallet/providers/providers";
import { pollForTransactionResult } from "../../pactcalls/kadena";

/**
 * Creates a Pact transaction with the given parameters
 */
export const createTx = async (code, chain, account, pubKey, providerName, networkApi, network, capabilities = []) => {
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

/**
 * Checks if an error is a wallet rejection error
 */
export const isWalletRejectionError = (error) => {
  return error.message && (
    error.message.includes('rejected') || 
    error.message.includes('cancelled') || 
    error.message.includes('denied') ||
    error.message.includes('User rejected') ||
    error.message.includes('User canceled')
  );
};

/**
 * Extracts signed transaction data based on provider type
 */
export const extractSignedTransactionData = (signedTx, provider) => {
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

/**
 * Submits a transaction and waits for mining confirmation
 */
export const submitAndWaitForTransaction = async (tx, cmd, sigs, outcomeHash) => {
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

/**
 * Waits for a contract to become available on the blockchain
 */
export const waitForContractToBeAvailable = async (networkApi, network, chain, namespace, moduleName, contractType, maxRetries = 30, delayMs = 5000) => {
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

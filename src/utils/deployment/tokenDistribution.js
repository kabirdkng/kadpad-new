import { createClient } from "@kadena/client";
import { Pact } from "@kadena/client";
import providers from "../../wallet/providers/providers";
import { formatAmountForPact } from "../decimalUtils.js";
import { 
  createTx, 
  createTxWithKeyset,
  isWalletRejectionError, 
  extractSignedTransactionData
} from "./transactionHelpers.js";
import { pollForTransactionResult } from "../../pactcalls/kadena";

/**
 * Checks if an account already has sufficient token balance
 */
export const checkAccountBalance = async (networkApi, network, chain, namespace, moduleName, accountName, requiredAmount) => {
  const pactClient = createClient(`${networkApi}/chainweb/0.0/${network}/chain/${chain}/pact`);
  
  try {
    console.log(`🔍 Checking balance for account: ${accountName}, required: ${requiredAmount}`);
    
    const pactCode = `(${namespace}.${moduleName}.get-balance "${accountName}")`;
    console.log(`Executing Pact code: ${pactCode}`);
    
    const balanceCommand = Pact.builder
      .execution(pactCode)
      .setMeta({
        chainId: String(chain),
        gasLimit: 1000,
        gasPrice: 0.00000001,
        sender: "",
        ttl: 600,
      })
      .setNetworkId(network)
      .createTransaction();

    const balanceResult = await pactClient.dirtyRead(balanceCommand);
    console.log(`Balance check result for ${accountName}:`, JSON.stringify(balanceResult, null, 2));
    
    if (balanceResult.result.status === 'success') {
      const currentBalance = parseFloat(balanceResult.result.data);
      const required = parseFloat(requiredAmount);
      
      console.log(`Current balance: ${currentBalance}, Required: ${required}`);
      
      // If current balance is greater than or equal to required amount, skip transfer
      const shouldSkip = currentBalance >= required;
      console.log(`Should skip transfer for ${accountName}: ${shouldSkip}`);
      return shouldSkip;
    } else if (balanceResult.result.status === 'failure') {
      console.log(`Balance check failed for ${accountName}, error:`, balanceResult.result.error);
      
      // Try alternative balance check approach - maybe account doesn't exist yet
      if (balanceResult.result.error && balanceResult.result.error.message) {
        const errorMsg = balanceResult.result.error.message.toLowerCase();
        if (errorMsg.includes('account does not exist') || errorMsg.includes('row not found') || errorMsg.includes('no such key')) {
          console.log(`Account ${accountName} does not exist, proceeding with transfer`);
          return false; // Account doesn't exist, need to create it with transfer
        }
      }
    }
    
    console.log(`Balance check inconclusive for ${accountName}, proceeding with transfer`);
    // If we can't get balance (account doesn't exist or other error), proceed with transfer
    return false;
  } catch (error) {
    console.log(`Could not check balance for ${accountName}, proceeding with transfer:`, error.message);
    return false;
  }
};

/**
 * Fetches contract account addresses after deployment
 */
export const fetchContractAccounts = async (networkApi, network, chain, namespace, moduleName) => {
  const pactClient = createClient(`${networkApi}/chainweb/0.0/${network}/chain/${chain}/pact`);
  
  try {
    // Fetch RESERVE-ACCOUNT from sales contract
    const reserveCommand = Pact.builder
      .execution(`(use ${namespace}.${moduleName}-sales) RESERVE-ACCOUNT`)
      .setMeta({
        chainId: String(chain),
        gasLimit: 1000,
        gasPrice: 0.00000001,
        sender: "",
        ttl: 600,
      })
      .setNetworkId(network)
      .createTransaction();

    const reserveResult = await pactClient.dirtyRead(reserveCommand);
    
    // Fetch LIQUIDITY-ACCOUNT from treasury contract
    const liquidityCommand = Pact.builder
      .execution(`(use ${namespace}.${moduleName}-treasury) LIQUIDITY-ACCOUNT`)
      .setMeta({
        chainId: String(chain),
        gasLimit: 1000,
        gasPrice: 0.00000001,
        sender: "",
        ttl: 600,
      })
      .setNetworkId(network)
      .createTransaction();

    const liquidityResult = await pactClient.dirtyRead(liquidityCommand);

    // Fetch TREASURY-ACCOUNT from treasury contract
    const treasuryCommand = Pact.builder
      .execution(`(use ${namespace}.${moduleName}-treasury) TREASURY-ACCOUNT`)
      .setMeta({
        chainId: String(chain),
        gasLimit: 1000,
        gasPrice: 0.00000001,
        sender: "",
        ttl: 600,
      })
      .setNetworkId(network)
      .createTransaction();

    const treasuryResult = await pactClient.dirtyRead(treasuryCommand);

    if (reserveResult.result.status !== 'success' || 
        liquidityResult.result.status !== 'success' || 
        treasuryResult.result.status !== 'success') {
      throw new Error('Failed to fetch contract account addresses');
    }

    return {
      reserveAccount: reserveResult.result.data,
      liquidityAccount: liquidityResult.result.data,
      treasuryAccount: treasuryResult.result.data
    };
  } catch (error) {
    console.error('Error fetching contract accounts:', error);
    throw new Error(`Failed to fetch contract accounts: ${error.message}`);
  }
};

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
  chain,
  contractAccounts
) => {
  let transferCode;
  let toAccount;
  
  // Format amount for Pact using Decimal.js utility
  const formattedAmount = formatAmountForPact(amount);
  
  // Use the actual contract account addresses fetched from the blockchain
  if (transferType === 'reserve') {
    transferCode = `(namespace '${namespace}) 
                     (use ${moduleName}-sales)
                     (${namespace}.${moduleName}.transfer-create 
                        "${account}" 
                        "${contractAccounts.reserveAccount}"
                        RESERVE-GUARD
                        ${formattedAmount})`;
    toAccount = contractAccounts.reserveAccount;
  } else if (transferType === 'platform') {
    // Platform share goes to a predefined platform account
    const platformAccount = import.meta.env.VITE_PLATFORM_ACCOUNT
    transferCode = `(${namespace}.${moduleName}.transfer-create 
                     "${account}"
                     "${platformAccount}"
                      (read-keyset "platformGuard")
                     ${formattedAmount})`;
    toAccount = platformAccount;
  } else if (transferType === 'liquidity') {
    transferCode = `(namespace '${namespace}) 
                     (use ${moduleName}-treasury)
                     (${namespace}.${moduleName}.transfer-create 
                     "${account}"
                     "${contractAccounts.liquidityAccount}"
                     LIQUIDITY-GUARD
                     ${formattedAmount})`;
    toAccount = contractAccounts.liquidityAccount;
  } else if (transferType === 'treasury') {
    transferCode = `(namespace '${namespace}) 
                     (use ${moduleName}-treasury)
                     (${namespace}.${moduleName}.transfer-create 
                     "${account}"
                     "${contractAccounts.treasuryAccount}"
                     TREASURY-GUARD
                     ${formattedAmount})`;
    toAccount = contractAccounts.treasuryAccount;
  } else {
    throw new Error(`Invalid transfer type: ${transferType}`);
  }
  
  const capabilities = [
    { name: `${namespace}.${moduleName}.TRANSFER`, values: [account, toAccount, { decimal: String(formattedAmount) }] },
    { name: 'coin.GAS', values: [] }
  ];

  // For platform transfers, we need to add the platform keyset
  if (transferType === 'platform') {
    const platformGuard = import.meta.env.VITE_PLATFORM_GUARD;
    return await createTxWithKeyset(transferCode, chain, account, pubKey, providerName, networkApi, network, capabilities, platformGuard);
  }

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

    if (progressCallback) progressCallback('Fetching contract account addresses...');

    // First, fetch the actual contract account addresses
    const contractAccounts = await fetchContractAccounts(networkApi, network, chain, namespace, moduleName);
    console.log('Fetched contract accounts:', contractAccounts);

    if (progressCallback) progressCallback('Preparing token transfers...');

    const transfers = [];
    const transactions = [];
    
    // Check balances and define the transfers based on token distribution
    if (tokenDistribution.presalesAmount && tokenDistribution.presalesAmount > 0) {
      const hasBalance = await checkAccountBalance(networkApi, network, chain, namespace, moduleName, contractAccounts.reserveAccount, tokenDistribution.presalesAmount);
      if (!hasBalance) {
        transfers.push({
          transferType: 'reserve',
          amount: tokenDistribution.presalesAmount,
          description: "Presale allocation",
          toAccount: contractAccounts.reserveAccount
        });
      } else {
        console.log(`Reserve account ${contractAccounts.reserveAccount} already has sufficient balance, skipping transfer`);
      }
    }

    if (tokenDistribution.platformAmount && tokenDistribution.platformAmount > 0) {
      const platformAccount = import.meta.env.VITE_PLATFORM_ACCOUNT;
      const hasBalance = await checkAccountBalance(networkApi, network, chain, namespace, moduleName, platformAccount, tokenDistribution.platformAmount);
      if (!hasBalance) {
        transfers.push({
          transferType: 'platform',
          amount: tokenDistribution.platformAmount,
          description: "Platform share allocation",
          toAccount: platformAccount
        });
      } else {
        console.log(`Platform account ${platformAccount} already has sufficient balance, skipping transfer`);
      }
    }

    if (tokenDistribution.liquidityAmount && tokenDistribution.liquidityAmount > 0) {
      const hasBalance = await checkAccountBalance(networkApi, network, chain, namespace, moduleName, contractAccounts.liquidityAccount, tokenDistribution.liquidityAmount);
      if (!hasBalance) {
        transfers.push({
          transferType: 'liquidity',
          amount: tokenDistribution.liquidityAmount,
          description: "DEX liquidity allocation",
          toAccount: contractAccounts.liquidityAccount
        });
      } else {
        console.log(`Liquidity account ${contractAccounts.liquidityAccount} already has sufficient balance, skipping transfer`);
      }
    }

    if (tokenDistribution.treasuryAmount && tokenDistribution.treasuryAmount > 0) {
      const hasBalance = await checkAccountBalance(networkApi, network, chain, namespace, moduleName, contractAccounts.treasuryAccount, tokenDistribution.treasuryAmount);
      if (!hasBalance) {
        transfers.push({
          transferType: 'treasury',
          amount: tokenDistribution.treasuryAmount,
          description: "Treasury allocation",
          toAccount: contractAccounts.treasuryAccount
        });
      } else {
        console.log(`Treasury account ${contractAccounts.treasuryAccount} already has sufficient balance, skipping transfer`);
      }
    }

    if (transfers.length === 0) {
      console.log('No token transfers needed');
      return {
        success: true,
        transfers: [],
        transactionKeys: []
      };
    }

    // Create transfer transactions with actual contract account addresses
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
        chain,
        contractAccounts
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

    // Show signing toast before batch signing
    const { showSigningToast } = await import("../transactionUtils.js");
    showSigningToast();

    signedBatch = await provider.quickSignAll(commands, client, session);

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

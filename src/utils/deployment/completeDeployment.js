import config from "../../wallet/config";
import providers from "../../wallet/providers/providers";
import { 
  isWalletRejectionError, 
  extractSignedTransactionData, 
  waitForContractToBeAvailable,
  submitAndWaitForTransaction 
} from "./transactionHelpers.js";
import { initiateDeployContract } from "./contractDeployment.js";
import { createTokenTransferTransaction } from "./tokenDistribution.js";
import { createClient } from "@kadena/client";
import { pollForTransactionResult } from "../../pactcalls/kadena";

/**
 * Combined function to deploy contracts and transfer tokens with single batch signing
 */
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

    // Create transfer transactions
    for (const transfer of transfers) {
      console.log(`Preparing transfer transaction: ${transfer.amount} tokens to ${transfer.transferType} account`);
      
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

    // Step 6: Process deployment transactions first (treasury, then sales)
    let deploymentResults = [];
    let treasuryDeployed = treasuryExists;
    let salesDeployed = salesExists;
    
    if (deploymentTransactions.length > 0) {
      if (progressCallback) progressCallback('Processing deployment transactions...');
      
      // Process treasury deployment first if needed
      const treasuryTxIndex = deploymentTransactions.findIndex(tx => tx.suffix === 'treasury');
      if (treasuryTxIndex !== -1 && !treasuryExists) {
        if (progressCallback) progressCallback('Deploying treasury contract...');
        
        const tx = deploymentTransactions[treasuryTxIndex];
        const signedTx = signedBatch.responses[treasuryTxIndex];
        
        try {
          const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
          const processedTx = await submitAndWaitForTransaction(tx, cmd, sigs, outcomeHash);
          
          if (processedTx) {
            deploymentResults.push(processedTx);
            const key = processedTx.requestKey || processedTx.transactionDescriptor?.requestKey;
            if (key) allTransactionKeys.push(key);
            
            // Wait for treasury contract to be available
            if (progressCallback) progressCallback('Waiting for treasury contract confirmation...');
            await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury');
            treasuryDeployed = true;
            console.log('Treasury contract deployed and confirmed');
          }
        } catch (error) {
          console.error(`Error processing treasury deployment:`, error);
          throw error;
        }
      }

      // Process sales deployment after treasury is confirmed
      const salesTxIndex = deploymentTransactions.findIndex(tx => tx.suffix === 'sales');
      if (salesTxIndex !== -1 && !salesExists) {
        if (progressCallback) progressCallback('Deploying sales contract...');
        
        const tx = deploymentTransactions[salesTxIndex];
        const signedTx = signedBatch.responses[salesTxIndex];
        
        try {
          const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
          const processedTx = await submitAndWaitForTransaction(tx, cmd, sigs, outcomeHash);
          
          if (processedTx) {
            deploymentResults.push(processedTx);
            const key = processedTx.requestKey || processedTx.transactionDescriptor?.requestKey;
            if (key) allTransactionKeys.push(key);
            
            // Wait for sales contract to be available
            if (progressCallback) progressCallback('Waiting for sales contract confirmation...');
            await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'sales');
            salesDeployed = true;
            console.log('Sales contract deployed and confirmed');
          }
        } catch (error) {
          console.error(`Error processing sales deployment:`, error);
          throw error;
        }
      }
    }

    // Step 7: Process transfer transactions ONLY after both contracts are deployed and confirmed
    let transferResults = [];
    if (transferTransactions.length > 0 && treasuryDeployed && salesDeployed) {
      if (progressCallback) progressCallback('Both contracts confirmed, processing token transfers...');
      
      const transferSubmissions = [];
      
      // Submit all transfer transactions (they were already signed in the batch)
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
            throw new Error(`Transfer to ${tx.transfer.transferType} account preflight failed: ${preflightResult.result.error.message}`);
          }

          // Submit transaction
          const transactionDescriptor = await tx.pactClient.submit(bodyPayload);
          console.log(`Submitted transfer of ${tx.transfer.amount} tokens to ${tx.transfer.transferType} account`);
          
          transferSubmissions.push({
            transfer: tx.transfer,
            transactionDescriptor,
            pactClient: tx.pactClient,
            requestKey: transactionDescriptor.requestKey
          });

          allTransactionKeys.push(transactionDescriptor.requestKey);
        } catch (error) {
          console.error(`Error submitting transfer to ${tx.transfer.transferType} account:`, error);
          throw error;
        }
      }

      if (progressCallback) progressCallback('All token transfers submitted, waiting for confirmations...');

      // Wait for all transfer confirmations
      for (const submission of transferSubmissions) {
        try {
          const result = await pollForTransactionResult(submission.pactClient, submission.transactionDescriptor);
          
          if (result.result.status === 'success') {
            console.log(`Successfully transferred ${submission.transfer.amount} tokens to ${submission.transfer.transferType} account`);
            if (progressCallback) {
              progressCallback(`Confirmed: ${submission.transfer.amount} tokens to ${submission.transfer.description}`);
            }
            transferResults.push({
              transfer: submission.transfer,
              result: result,
              requestKey: submission.requestKey
            });
          } else {
            throw new Error(`Transfer to ${submission.transfer.transferType} account failed: ${result.result.error.message}`);
          }
        } catch (error) {
          console.error(`Error confirming transfer to ${submission.transfer.transferType} account:`, error);
          throw error;
        }
      }
    } else if (transferTransactions.length > 0) {
      console.warn('Skipping token transfers because contracts are not properly deployed');
    }

    // Combine all transaction keys
    allTransactionKeys = [...new Set(allTransactionKeys)];

    // Step 8: Mark project as deployed after successful distribution
    if (progressCallback) progressCallback('Updating project status...');
    
    try {
      const { markProjectAsDeployed } = await import('../../api.js');
      
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

import config from "../../wallet/config";
import providers from "../../wallet/providers/providers";
import { 
  isWalletRejectionError, 
  extractSignedTransactionData, 
  waitForContractToBeAvailable,
  submitAndWaitForTransaction 
} from "./transactionHelpers.js";
import { initiateDeployContract } from "./contractDeployment.js";
import { createTokenTransferTransaction, fetchContractAccounts } from "./tokenDistribution.js";
import { createClient } from "@kadena/client";
import { pollForTransactionResult } from "../../pactcalls/kadena";

/**
 * Combined function to deploy contracts and transfer tokens with two-phase signing
 */
export const deploySalesAndTreasuryWithTokenDistribution = async (
  salesContract,
  treasuryContract,
  namespace,
  moduleName,
  account,
  pubKey,
  providerName,
  tokenDistribution,
  chain = config.chainId,
  progressCallback = null
) => {
  try {
    console.log('=== Starting Two-Phase Deployment with Token Distribution ===');
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

    // Step 2: Deploy contracts first (if needed) - Phase 1 signing
    let deploymentTransactions = [];
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

    // Step 3: Phase 1 - Sign and deploy contracts
    let deploymentResults = [];
    let treasuryDeployed = treasuryExists;
    let salesDeployed = salesExists;
    
    if (deploymentTransactions.length > 0) {
      if (progressCallback) progressCallback('🔐 Phase 1: Signing contract deployment transactions...');
      
      const deploymentCommands = deploymentTransactions.map(tx => tx.command);
      console.log(`Phase 1: Preparing to sign ${deploymentCommands.length} deployment transactions`);

      let deploymentSignedBatch;
      try {
        console.log("Signing deployment transactions with provider:", providerName);
        
        // Debug WalletConnect client status if using WC
        if (providerName === "WC") {
          const { getClientStatus } = await import("../../wallet/providers/wc.js");
          const clientStatus = getClientStatus();
          console.log("WalletConnect client status before signing:", clientStatus);
        }
        
        // Show signing toast before batch signing
        const { showSigningToast } = await import("../transactionUtils.js");
        showSigningToast();
        
        deploymentSignedBatch = await provider.quickSignAll(deploymentCommands);
      } catch (error) {
        console.error("Deployment signing error:", error);
        if (isWalletRejectionError(error)) {
          throw new Error('Contract deployment transaction signing was rejected by user');
        }
        throw new Error(`Contract deployment signing failed: ${error.message}`);
      }

      // Check if signing was successful
      if (!deploymentSignedBatch || !deploymentSignedBatch.responses || deploymentSignedBatch.responses.length === 0) {
        throw new Error('Contract deployment transaction signing was rejected or failed');
      }

      if (deploymentSignedBatch.status === 'fail' || deploymentSignedBatch.error) {
        throw new Error(deploymentSignedBatch.error || deploymentSignedBatch.message || 'Contract deployment transaction signing failed');
      }

      console.log(`Phase 1: Successfully signed ${deploymentSignedBatch.responses.length} deployment transactions`);

      // Process deployment transactions
      if (progressCallback) progressCallback('Deploying contracts...');
      
      let deploymentFailed = false;
      let failureReason = '';
      
      for (let i = 0; i < deploymentTransactions.length; i++) {
        const tx = deploymentTransactions[i];
        const signedTx = deploymentSignedBatch.responses[i];
        
        try {
          const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
          const processedTx = await submitAndWaitForTransaction(tx, cmd, sigs, outcomeHash);
          
          if (processedTx) {
            deploymentResults.push(processedTx);
            allTransactionKeys.push(processedTx.requestKey);
            
            if (tx.suffix === 'treasury') {
              treasuryDeployed = true;
              if (progressCallback) progressCallback('Treasury contract deployed successfully!');
            } else if (tx.suffix === 'sales') {
              salesDeployed = true;
              if (progressCallback) progressCallback('Sales contract deployed successfully!');
            }
          } else {
            // processedTx is null, which means table already exists
            if (tx.suffix === 'treasury') {
              treasuryDeployed = treasuryExists; // Keep existing state
            } else if (tx.suffix === 'sales') {
              salesDeployed = salesExists; // Keep existing state
            }
          }
        } catch (error) {
          console.error(`Error processing deployment transaction for ${tx.suffix}:`, error);
          deploymentFailed = true;
          failureReason = `${tx.suffix} deployment failed: ${error.message}`;
          break; // Stop processing further transactions
        }
      }

      // If deployment failed, don't proceed with token distribution
      if (deploymentFailed) {
        throw new Error(failureReason);
      }

      // Wait for contracts to be available
      if (!treasuryExists && treasuryDeployed) {
        if (progressCallback) progressCallback('Waiting for treasury contract confirmation...');
        await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury');
      }
      
      if (!salesExists && salesDeployed) {
        if (progressCallback) progressCallback('Waiting for sales contract confirmation...');
        await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'sales');
      }
    }

    // Step 4: Phase 2 - Fetch contract accounts and prepare token transfers
    let transferResults = [];
    const transfers = [];
    
    // Define the transfers based on token distribution
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

    if (transfers.length > 0 && treasuryDeployed && salesDeployed) {
      if (progressCallback) progressCallback('Fetching contract account addresses...');
      
      // Fetch the actual contract account addresses
      const contractAccounts = await fetchContractAccounts(networkApi, network, chain, namespace, moduleName);
      console.log('Fetched contract accounts:', contractAccounts);

      if (progressCallback) progressCallback('Preparing token transfer transactions with actual account addresses...');
      
      // Create new transfer transactions with actual account addresses
      const transferTransactions = [];
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

        transferTransactions.push({
          ...tx,
          transfer: transfer,
          pactClient: createClient(`${networkApi}/chainweb/0.0/${network}/chain/${chain}/pact`)
        });
      }

      // Step 5: Phase 2 - Sign token transfer transactions
      if (progressCallback) progressCallback('🔐 Phase 2: Signing token transfer transactions...');

      const transferCommands = transferTransactions.map(tx => tx.command);
      console.log(`Phase 2: Preparing to sign ${transferCommands.length} transfer transactions`);
      
      let transferSignedBatch;
      try {
        console.log("Signing transfer transactions with provider:", providerName);
        
        // Debug WalletConnect client status if using WC
        if (providerName === "WC") {
          const { getClientStatus } = await import("../../wallet/providers/wc.js");
          const clientStatus = getClientStatus();
          console.log("WalletConnect client status before transfer signing:", clientStatus);
        }
        
        // Show signing toast before batch signing
        const { showSigningToast } = await import("../transactionUtils.js");
        showSigningToast();
        
        transferSignedBatch = await provider.quickSignAll(transferCommands);
      } catch (error) {
        console.error("Transfer signing error:", error);
        if (isWalletRejectionError(error)) {
          throw new Error('Token transfer transaction signing was rejected by user');
        }
        throw new Error(`Token transfer signing failed: ${error.message}`);
      }

      // Check if signing was successful
      if (!transferSignedBatch || !transferSignedBatch.responses || transferSignedBatch.responses.length === 0) {
        throw new Error('Token transfer transaction signing was rejected or failed');
      }

      if (transferSignedBatch.status === 'fail' || transferSignedBatch.error) {
        throw new Error(transferSignedBatch.error || transferSignedBatch.message || 'Token transfer transaction signing failed');
      }

      console.log(`Phase 2: Successfully signed ${transferSignedBatch.responses.length} transfer transactions`);

      if (progressCallback) progressCallback('Processing token transfers...');
      
      // Submit all transfer transactions in parallel (don't wait for confirmations yet)
      const transferSubmissions = [];
      
      for (let i = 0; i < transferTransactions.length; i++) {
        const tx = transferTransactions[i];
        const signedTx = transferSignedBatch.responses[i];
        
        try {
          const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
          
          // Submit transaction (don't wait for confirmation yet)
          const bodyPayload = { cmd, sigs, hash: outcomeHash };
          
          // Preflight check
          const preflightResult = await tx.pactClient.dirtyRead(bodyPayload);
          
          if (preflightResult.result.status === 'failure') {
            throw new Error(`Transfer to ${tx.transfer.transferType} preflight failed: ${preflightResult.result.error.message}`);
          }

          // Submit transaction immediately without waiting
          const transactionDescriptor = await tx.pactClient.submit(bodyPayload);
          console.log(`Submitted transfer of ${tx.transfer.amount} tokens to ${tx.transfer.transferType}`);
          
          transferSubmissions.push({
            transfer: tx.transfer,
            transactionDescriptor,
            pactClient: tx.pactClient,
            requestKey: transactionDescriptor.requestKey
          });

          allTransactionKeys.push(transactionDescriptor.requestKey);
        } catch (error) {
          console.error(`Error submitting transfer to ${tx.transfer.transferType}:`, error);
          throw error;
        }
      }

      if (progressCallback) progressCallback('All token transfers submitted, waiting for confirmations...');

      // Now wait for all transfer confirmations in parallel
      const confirmationPromises = transferSubmissions.map(async (submission) => {
        try {
          const result = await pollForTransactionResult(submission.pactClient, submission.transactionDescriptor);
          
          if (result.result.status === 'success') {
            console.log(`Successfully transferred ${submission.transfer.amount} tokens to ${submission.transfer.transferType}`);
            if (progressCallback) {
              progressCallback(`Confirmed: ${submission.transfer.amount} tokens to ${submission.transfer.description}`);
            }
            return {
              transfer: submission.transfer,
              result: result,
              requestKey: submission.requestKey
            };
          } else {
            throw new Error(`Transfer to ${submission.transfer.transferType} failed: ${result.result.error.message}`);
          }
        } catch (error) {
          console.error(`Error confirming transfer to ${submission.transfer.transferType}:`, error);
          throw error;
        }
      });

      // Wait for all confirmations to complete in parallel
      transferResults = await Promise.all(confirmationPromises);

      console.log(`All ${transferResults.length} token transfers completed successfully`);
      console.log('Transfer results:', JSON.stringify(transferResults, null, 2)); // Add this before validation
      
      // Validate that all expected transfers were completed
      if (transferResults.length !== transfers.length) {
        throw new Error(`Token distribution incomplete: Expected ${transfers.length} transfers, but only ${transferResults.length} completed successfully`);
      }
      
      // Validate each transfer result
      transferResults.forEach((result, index) => {
        // Correctly check nested status
        const status =
          result?.result?.result?.status || // pollForTransactionResult result.result.status
          result?.result?.status ||         // fallback
          result?.status;                   // fallback

        if (!status || String(status).toLowerCase() !== 'success') {
          console.error('Transfer result structure:', result); // Log for debugging
          throw new Error(`Transfer ${index + 1} (${result?.transfer?.transferType || 'unknown'}) did not complete successfully`);
        }
      });
      
      console.log('✅ All token distribution transfers validated successfully');
    } else if (transfers.length > 0) {
      console.warn('Skipping token transfers because contracts are not properly deployed');
      throw new Error('Cannot distribute tokens because contracts are not properly deployed');
    }

    // Remove duplicates from all transaction keys
    allTransactionKeys = [...new Set(allTransactionKeys)];

    // Step 6: Mark project as deployed ONLY after successful distribution
    // Only mark as deployed if we actually deployed contracts AND completed token distribution successfully
    const contractsDeployed = deploymentResults.length > 0 || (treasuryExists && salesExists);
    const tokenDistributionCompleted = transfers.length === 0 || transferResults.length === transfers.length;
    
    if (contractsDeployed && tokenDistributionCompleted) {
      if (progressCallback) progressCallback('Updating project status...');
      
      try {
        // Import and call the backend API to mark project as deployed
        const { markProjectAsDeployed } = await import('../../api.js');
        
        const deploymentData = {
          salesContractAddress: `${namespace}.${moduleName}-sales`,
          treasuryContractAddress: `${namespace}.${moduleName}-treasury`,
          deploymentTransactionKeys: allTransactionKeys,
          deployedAt: new Date().toISOString(),
          tokenDistribution: {
            presalesAmount: tokenDistribution.presalesAmount,
            liquidityAmount: tokenDistribution.liquidityAmount,
            treasuryAmount: tokenDistribution.treasuryAmount,
            distributionCompleted: true,
            transferCount: transferResults.length
          }
        };

        await markProjectAsDeployed(namespace, moduleName, deploymentData);
        console.log('Project marked as deployed successfully after confirming both contract deployment and token distribution');
      } catch (error) {
        console.warn('Failed to update project status on backend:', error.message);
        // Don't fail the whole deployment for this
      }
    } else {
      if (!contractsDeployed) {
        console.warn('Not marking project as deployed because contracts were not successfully deployed');
      }
      if (!tokenDistributionCompleted) {
        console.warn(`Not marking project as deployed because token distribution is incomplete. Expected ${transfers.length} transfers, completed ${transferResults.length}`);
      }
      
      // If either contracts or distribution failed, throw an error
      if (!contractsDeployed) {
        throw new Error('Contract deployment was not completed successfully');
      }
      if (!tokenDistributionCompleted) {
        throw new Error(`Token distribution was not completed successfully. Expected ${transfers.length} transfers, completed ${transferResults.length}`);
      }
    }

    if (progressCallback) progressCallback('✅ Complete deployment and distribution successful!');

    console.log('=== Complete Deployment and Distribution Successful ===');
    console.log('All transaction keys:', allTransactionKeys);
    console.log(`Phase 1: Deployed ${deploymentResults.length} contracts`);
    console.log(`Phase 2: Completed ${transferResults.length} token transfers`);

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
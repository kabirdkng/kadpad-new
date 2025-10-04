import config from "../../wallet/config";
import providers from "../../wallet/providers/providers";
import { 
  isWalletRejectionError, 
  extractSignedTransactionData, 
  waitForContractToBeAvailable,
  submitAndWaitForTransaction 
} from "./transactionHelpers.js";
import { initiateDeployContract } from "./contractDeployment.js";
import { createTokenTransferTransaction, fetchContractAccounts, checkAccountBalance } from "./tokenDistribution.js";
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
    const networkApi = config.apiUrl;
    const network = config.networkId;
    const provider = providers[providerName];
    
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}. Available providers: ${Object.keys(providers).join(', ')}`);
    }

    if (progressCallback) progressCallback('Checking existing contracts...');
    
    let treasuryExists = false;
    let salesExists = false;

    try {
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury', 1, 0);
      treasuryExists = true;
    } catch (error) {
      // Treasury contract not found
    }

    try {
      await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'sales', 1, 0);
      salesExists = true;
    } catch (error) {
      // Sales contract not found
    }

    let deploymentTransactions = [];
    let allTransactionKeys = [];

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

    let deploymentResults = [];
    let treasuryDeployed = treasuryExists;
    let salesDeployed = salesExists;
    
    if (deploymentTransactions.length > 0) {
      if (progressCallback) progressCallback('🔐 Phase 1: Signing contract deployment transactions...');
      
      const deploymentCommands = deploymentTransactions.map(tx => tx.command);

      let deploymentSignedBatch;
      try {
        if (providerName === "WC") {
          const { getClientStatus } = await import("../../wallet/providers/wc.js");
          getClientStatus();
        }
        
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

      if (!deploymentSignedBatch || !deploymentSignedBatch.responses || deploymentSignedBatch.responses.length === 0) {
        throw new Error('Contract deployment transaction signing was rejected or failed');
      }

      if (deploymentSignedBatch.status === 'fail' || deploymentSignedBatch.error) {
        throw new Error(deploymentSignedBatch.error || deploymentSignedBatch.message || 'Contract deployment transaction signing failed');
      }

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
            if (tx.suffix === 'treasury') {
              treasuryDeployed = treasuryExists;
            } else if (tx.suffix === 'sales') {
              salesDeployed = salesExists;
            }
          }
        } catch (error) {
          console.error(`Error processing deployment transaction for ${tx.suffix}:`, error);
          deploymentFailed = true;
          failureReason = `${tx.suffix} deployment failed: ${error.message}`;
          break;
        }
      }

      if (deploymentFailed) {
        throw new Error(failureReason);
      }

      if (!treasuryExists && treasuryDeployed) {
        if (progressCallback) progressCallback('Waiting for treasury contract confirmation...');
        await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'treasury');
      }
      
      if (!salesExists && salesDeployed) {
        if (progressCallback) progressCallback('Waiting for sales contract confirmation...');
        await waitForContractToBeAvailable(networkApi, network, chain, namespace, moduleName, 'sales');
      }
    }

    let transferResults = [];
    const transfers = [];
    
    if (tokenDistribution.presalesAmount && tokenDistribution.presalesAmount > 0) {
      transfers.push({
        transferType: 'reserve',
        amount: tokenDistribution.presalesAmount,
        description: "Presale allocation"
      });
    }

    if (tokenDistribution.platformAmount && tokenDistribution.platformAmount > 0) {
      transfers.push({
        transferType: 'platform',
        amount: tokenDistribution.platformAmount,
        description: "Platform share allocation"
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
      
      const contractAccounts = await fetchContractAccounts(networkApi, network, chain, namespace, moduleName);
      
      // Filter transfers based on account balances
      const neededTransfers = [];
      
      for (const transfer of transfers) {
        let targetAccount;
        let hasBalance = false;
        
        if (transfer.transferType === 'reserve') {
          targetAccount = contractAccounts.reserveAccount;
        } else if (transfer.transferType === 'platform') {
          targetAccount = import.meta.env.VITE_PLATFORM_ACCOUNT;
        } else if (transfer.transferType === 'liquidity') {
          targetAccount = contractAccounts.liquidityAccount;
        } else if (transfer.transferType === 'treasury') {
          targetAccount = contractAccounts.treasuryAccount;
        }
        
        try {
          hasBalance = await checkAccountBalance(networkApi, network, chain, namespace, moduleName, targetAccount, transfer.amount);
          if (!hasBalance) {
            neededTransfers.push(transfer);
          } else {
            console.log(`${transfer.transferType} account ${targetAccount} already has sufficient balance, skipping transfer`);
          }
        } catch (error) {
          console.log(`Could not check balance for ${transfer.transferType} account, proceeding with transfer:`, error.message);
          neededTransfers.push(transfer);
        }
      }
      
      if (neededTransfers.length === 0) {
        console.log('All accounts already have sufficient balances, no transfers needed');
        transferResults = [];
      } else {
        const transferTransactions = [];
        for (const transfer of neededTransfers) {
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

        if (transferTransactions.length > 0) {
          if (progressCallback) progressCallback('🔐 Phase 2: Signing token transfer transactions...');

          const transferCommands = transferTransactions.map(tx => tx.command);
          
          let transferSignedBatch;
          try {
            if (providerName === "WC") {
              const { getClientStatus } = await import("../../wallet/providers/wc.js");
              getClientStatus();
            }
            
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

          if (!transferSignedBatch || !transferSignedBatch.responses || transferSignedBatch.responses.length === 0) {
            throw new Error('Token transfer transaction signing was rejected or failed');
          }

          if (transferSignedBatch.status === 'fail' || transferSignedBatch.error) {
            throw new Error(transferSignedBatch.error || transferSignedBatch.message || 'Token transfer transaction signing failed');
          }

          if (progressCallback) progressCallback('Processing token transfers...');
          
          const transferSubmissions = [];
          
          for (let i = 0; i < transferTransactions.length; i++) {
            const tx = transferTransactions[i];
            const signedTx = transferSignedBatch.responses[i];
            
            try {
              const { cmd, sigs, outcomeHash } = extractSignedTransactionData(signedTx, provider);
              
              const bodyPayload = { cmd, sigs, hash: outcomeHash };
              
              const preflightResult = await tx.pactClient.dirtyRead(bodyPayload);
              
              if (preflightResult.result.status === 'failure') {
                throw new Error(`Transfer to ${tx.transfer.transferType} preflight failed: ${preflightResult.result.error.message}`);
              }

              const transactionDescriptor = await tx.pactClient.submit(bodyPayload);
              
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

          const confirmationPromises = transferSubmissions.map(async (submission) => {
            try {
              const result = await pollForTransactionResult(submission.pactClient, submission.transactionDescriptor);
              
              if (result.result.status === 'success') {
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

          transferResults = await Promise.all(confirmationPromises);
          
          if (transferResults.length !== neededTransfers.length) {
            throw new Error(`Token distribution incomplete: Expected ${neededTransfers.length} transfers, but only ${transferResults.length} completed successfully`);
          }
          
          transferResults.forEach((result, index) => {
            const status =
              result?.result?.result?.status ||
              result?.result?.status ||
              result?.status;

            if (!status || String(status).toLowerCase() !== 'success') {
              console.error('Transfer result structure:', result);
              throw new Error(`Transfer ${index + 1} (${result?.transfer?.transferType || 'unknown'}) did not complete successfully`);
            }
          });
        }
      }
    } else if (transfers.length > 0) {
      console.warn('Skipping token transfers because contracts are not properly deployed');
      throw new Error('Cannot distribute tokens because contracts are not properly deployed');
    }

    allTransactionKeys = [...new Set(allTransactionKeys)];

    const contractsDeployed = deploymentResults.length > 0 || (treasuryExists && salesExists);
    const tokenDistributionCompleted = transfers.length === 0 || transferResults.length === transfers.length;
    
    if (contractsDeployed && tokenDistributionCompleted) {
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
            platformAmount: tokenDistribution.platformAmount,
            liquidityAmount: tokenDistribution.liquidityAmount,
            treasuryAmount: tokenDistribution.treasuryAmount,
            distributionCompleted: true,
            transferCount: transferResults.length
          }
        };

        await markProjectAsDeployed(namespace, moduleName, deploymentData);
      } catch (error) {
        console.warn('Failed to update project status on backend:', error.message);
      }
    } else {
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
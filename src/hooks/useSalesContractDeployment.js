import { useState, useCallback } from 'react';
import { generateSalesContract, generateTreasuryContract } from '../utils/contractGeneration';
import { deploySalesAndTreasuryWithTokenDistribution } from '../utils/deployContract';
import { pollForTransactionResult } from '../pactcalls/kadena';
import { useWalletConnectClient } from '../wallet/providers/ClientContextProvider';
import useWalletStore from '../wallet/walletStore';
import { toast } from 'react-toastify';

export const useSalesContractDeployment = () => {
  const [deploymentState, setDeploymentState] = useState({
    isLoading: false,
    salesContractDeployed: false,
    treasuryContractDeployed: false,
    salesContractAddress: null,
    treasuryContractAddress: null,
    currentStep: null,
    error: null,
    transactionKeys: []
  });

  const { client, session } = useWalletConnectClient();
  const { isConnected, account, pubKey, provider } = useWalletStore();

  const updateState = useCallback((updates) => {
    setDeploymentState(prev => ({ ...prev, ...updates }));
  }, []);

  const deploySalesAndTreasury = useCallback(async (tokenData, salesConfig) => {
    let currentTransactionKeys = [];
    
    try {
      console.log('=== Starting Contract Deployment ===');
      console.log('Token data:', tokenData);
      console.log('Sales config:', salesConfig);
      console.log('Wallet state:', { isConnected, account, pubKey, provider });
      console.log('Client/Session:', { client: !!client, session: !!session });

      // Check wallet connection
      if (!isConnected || !account || !pubKey) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!client) {
        throw new Error('WalletConnect client not initialized. Please ensure your wallet is properly connected.');
      }

      // For non-WalletConnect providers, session might not be required
      const providerName = provider;
      console.log('Using provider:', providerName);
      
      if (providerName === 'WC' && !session) {
        throw new Error('WalletConnect session not found. Please reconnect your wallet.');
      }

      updateState({ 
        isLoading: true, 
        error: null, 
        currentStep: 'Preparing deployment...',
        transactionKeys: []
      });

      const { namespace, moduleName } = tokenData;
      console.log('Contract info:', { namespace, moduleName });

      updateState({ currentStep: 'Generating contract code...' });

      // Generate contracts
      const salesContract = generateSalesContract(moduleName, namespace, salesConfig);
      console.log('Generated sales contract (first 500 chars):', salesContract.substring(0, 500));
      console.log('Sales contract starts with namespace?', salesContract.startsWith(`(namespace '${namespace})`));

      updateState({ currentStep: 'Generating treasury contract code...' });
      
      const treasuryContract = generateTreasuryContract(moduleName, namespace, salesConfig);
      console.log('Generated treasury contract (first 500 chars):', treasuryContract.substring(0, 500));
      console.log('Treasury contract starts with namespace?', treasuryContract.startsWith(`(namespace '${namespace})`));

      // Prepare token distribution data
      const tokenDistribution = {
        presalesAmount: salesConfig.presalesAmount || ((salesConfig.totalBatches || 0) * (salesConfig.amountPerBatch || salesConfig.tokensPerBatch || 0)),
        liquidityAmount: salesConfig.liquidityLockupAmount || 0,
        treasuryAmount: salesConfig.treasuryAmount || 0
      };

      console.log('Token distribution:', tokenDistribution);

      updateState({ currentStep: 'Signing transactions...' });

      // Deploy both sales and treasury contracts following tokengen pattern
      console.log('Calling deploySalesAndTreasuryWithTokenDistribution...');
      updateState({ currentStep: 'Deploying contracts...' });
      
      // Create a progress callback to update state during deployment
      const progressCallback = (step) => {
        console.log('Progress callback:', step);
        updateState({ currentStep: step });
      };
      
      const deploymentResult = await deploySalesAndTreasuryWithTokenDistribution(
        salesContract,
        treasuryContract,
        namespace,
        moduleName,
        account,
        pubKey,
        provider,
        client,
        session,
        tokenDistribution,
        undefined, // chain (default)
        progressCallback // Add progress callback
      );

      console.log('Complete deployment result:', deploymentResult);

      // Properly extract and collect all transaction keys
      let allTransactionKeys = [];
      
      // Get keys from deploymentResult.transactionKeys if available
      if (deploymentResult.transactionKeys && Array.isArray(deploymentResult.transactionKeys)) {
        allTransactionKeys.push(...deploymentResult.transactionKeys);
      }
      
      // Remove duplicates
      allTransactionKeys = [...new Set(allTransactionKeys)];
      currentTransactionKeys.push(...allTransactionKeys);
      
      console.log('Collected transaction keys:', allTransactionKeys);

      updateState({ 
        currentStep: 'Deployment completed successfully!',
        transactionKeys: currentTransactionKeys,
        salesContractDeployed: true,
        treasuryContractDeployed: true,
        salesContractAddress: deploymentResult.salesContractAddress,
        treasuryContractAddress: deploymentResult.treasuryContractAddress
      });

      console.log('=== Deployment Successful ===');
      
      return {
        success: true,
        ...deploymentResult
      };

    } catch (error) {
      console.error('Error during deployment:', error);
      
      updateState({ 
        currentStep: null,
        error: error.message,
        isLoading: false,
        transactionKeys: currentTransactionKeys
      });
      
      if (error.message.includes('rejected') || error.message.includes('cancelled')) {
        toast.error('Transaction was cancelled or rejected by user');
      } else {
        toast.error(`Deployment failed: ${error.message}`);
      }
      
      throw error;
    } finally {
      updateState({ isLoading: false });
    }
  }, [client, session, updateState, isConnected, account, pubKey, provider]);

  const resetDeploymentState = useCallback(() => {
    setDeploymentState({
      isLoading: false,
      salesContractDeployed: false,
      treasuryContractDeployed: false,
      salesContractAddress: null,
      treasuryContractAddress: null,
      currentStep: null,
      error: null,
      transactionKeys: []
    });
  }, []);

  return {
    deploymentState,
    deploySalesAndTreasury,
    resetDeploymentState
  };
};

// Hook for checking sales contract status
export const useSalesContractStatus = () => {
  const [statusState, setStatusState] = useState({
    isLoading: false,
    salesContractExists: false,
    treasuryContractExists: false,
    contractAddresses: null,
    error: null
  });

  const checkContractStatus = useCallback(async (namespace, moduleName) => {
    try {
      setStatusState(prev => ({ ...prev, isLoading: true, error: null }));

      // This would typically involve reading from the blockchain to check if contracts exist
      // For now, we'll implement a basic check structure
      const salesAddress = `${namespace}.${moduleName}-sales`;
      const treasuryAddress = `${namespace}.${moduleName}-treasury`;

      // TODO: Implement actual blockchain check
      // const salesExists = await checkContractExists(salesAddress);
      // const treasuryExists = await checkContractExists(treasuryAddress);

      setStatusState({
        isLoading: false,
        salesContractExists: false, // Will be updated when check is implemented
        treasuryContractExists: false, // Will be updated when check is implemented
        contractAddresses: {
          sales: salesAddress,
          treasury: treasuryAddress
        },
        error: null
      });

    } catch (error) {
      console.error('Error checking contract status:', error);
      setStatusState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, []);

  return {
    statusState,
    checkContractStatus
  };
};

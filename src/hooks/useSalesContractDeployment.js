import { useState, useCallback } from 'react';
import { generateSalesContract, generateTreasuryContract } from '../utils/contractGeneration';
import { deploySalesAndTreasuryContracts } from '../utils/deployContract';
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

      updateState({ currentStep: 'Signing transactions...' });

      // Deploy both sales and treasury contracts following tokengen pattern
      console.log('Calling deploySalesAndTreasuryContracts...');
      updateState({ currentStep: 'Deploying contracts...' });
      
      // Create a progress callback to update state during deployment
      const progressCallback = (step) => {
        console.log('Progress callback:', step);
        
        // Update deployment flags based on progress steps
        const updates = { currentStep: step };
        
        if (step.includes('Waiting for treasury confirmation') || step.includes('treasury deployed')) {
          updates.treasuryContractDeployed = true;
        }
        
        if (step.includes('Deploying sales contract') && step.includes('treasury')) {
          // This means we've moved to sales deployment after treasury
          updates.treasuryContractDeployed = true;
        }
        
        updateState(updates);
      };
      
      const deploymentResult = await deploySalesAndTreasuryContracts(
        salesContract,
        treasuryContract,
        namespace,
        moduleName,
        account,
        pubKey,
        provider,
        client,
        session,
        undefined, // chain (default)
        progressCallback // Add progress callback
      );

      console.log('Deployment result:', deploymentResult);

      // Properly extract and collect all transaction keys
      let allTransactionKeys = [];
      
      // Get keys from deploymentResult.transactionKeys if available
      if (deploymentResult.transactionKeys && Array.isArray(deploymentResult.transactionKeys)) {
        allTransactionKeys.push(...deploymentResult.transactionKeys);
      }
      
      // Get keys from individual transactions if available
      if (deploymentResult.transactions && Array.isArray(deploymentResult.transactions)) {
        const txKeys = deploymentResult.transactions
          .map(tx => tx.requestKey || tx.transactionDescriptor?.requestKey)
          .filter(key => key); // Filter out undefined/null keys
        allTransactionKeys.push(...txKeys);
      }
      
      // Remove duplicates
      allTransactionKeys = [...new Set(allTransactionKeys)];
      currentTransactionKeys.push(...allTransactionKeys);
      
      console.log('Collected transaction keys:', allTransactionKeys);

      updateState({ 
        currentStep: 'Confirming deployments...',
        transactionKeys: currentTransactionKeys
      });

      // Wait for all transactions to complete
      console.log('Polling for deployment confirmations...');
      const confirmations = [];
      
      for (const tx of deploymentResult.transactions) {
        const stepMsg = tx.suffix === 'treasury' ? 
          'Confirming treasury deployment...' : 
          'Confirming sales deployment...';
        
        updateState({ currentStep: stepMsg });
        
        console.log(`Polling for transaction ${tx.requestKey}...`);
        const confirmation = await pollForTransactionResult(
          tx.pactClient, 
          tx.transactionDescriptor
        );
        console.log(`Transaction ${tx.requestKey} confirmation:`, confirmation);
        
        if (confirmation.result.status === 'failure') {
          throw new Error(`${tx.suffix} contract deployment failed: ${confirmation.result.error.message}`);
        }
        
        confirmations.push(confirmation);
        
        // Update individual contract deployment status
        if (tx.suffix === 'treasury') {
          updateState({ 
            treasuryContractDeployed: true,
            currentStep: 'Treasury deployed! Confirming sales...'
          });
        } else if (tx.suffix === 'sales') {
          updateState({ 
            salesContractDeployed: true,
            currentStep: 'Sales contract deployed!'
          });
        }
      }

      updateState({ 
        salesContractDeployed: true,
        treasuryContractDeployed: true,
        salesContractAddress: deploymentResult.salesContractAddress,
        treasuryContractAddress: deploymentResult.treasuryContractAddress,
        currentStep: 'Deployment completed successfully!',
        transactionKeys: currentTransactionKeys // Ensure keys are in final state
      });

      updateState({ 
        isLoading: false,
        currentStep: 'All contracts deployed successfully!',
        error: null
      });

      console.log('=== Deployment Completed Successfully ===');
      console.log('Sales contract:', deploymentResult.salesContractAddress);
      console.log('Treasury contract:', deploymentResult.treasuryContractAddress);
      console.log('Transaction keys for backend:', currentTransactionKeys);

      toast.success('Sales and treasury contracts deployed successfully!', { 
        position: 'top-center' 
      });
      
      return {
        success: true,
        salesContractAddress: deploymentResult.salesContractAddress,
        treasuryContractAddress: deploymentResult.treasuryContractAddress,
        transactionKeys: currentTransactionKeys // Return collected keys
      };

    } catch (error) {
      console.error('=== Contract deployment error ===', error);
      
      updateState({ 
        isLoading: false,
        error: error.message,
        currentStep: `Error: ${error.message}`
      });

      toast.error(`Deployment failed: ${error.message}`, { 
        position: 'top-center' 
      });

      return {
        success: false,
        error: error.message
      };
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

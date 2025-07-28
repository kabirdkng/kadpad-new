import { useState, useCallback } from 'react';
import { generateSalesContract, generateTreasuryContract } from '../utils/contractGeneration';
import { deploySalesAndTreasuryContracts } from '../utils/deployContractLikeTokengen';
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
        currentStep: 'Preparing contract deployment...',
        transactionKeys: []
      });

      const { namespace, moduleName } = tokenData;
      console.log('Contract info:', { namespace, moduleName });

      updateState({ currentStep: 'Generating sales contract...' });

      // Generate contracts
      const salesContract = generateSalesContract(moduleName, namespace, salesConfig);
      console.log('Generated sales contract (first 500 chars):', salesContract.substring(0, 500));
      console.log('Sales contract starts with namespace?', salesContract.startsWith(`(namespace '${namespace})`));

      updateState({ currentStep: 'Generating treasury contract...' });
      
      const treasuryContract = generateTreasuryContract(moduleName, namespace, salesConfig);
      console.log('Generated treasury contract (first 500 chars):', treasuryContract.substring(0, 500));
      console.log('Treasury contract starts with namespace?', treasuryContract.startsWith(`(namespace '${namespace})`));

      updateState({ currentStep: 'Deploying contracts to blockchain...' });

      // Deploy both sales and treasury contracts following tokengen pattern
      console.log('Calling deploySalesAndTreasuryContracts...');
      const deploymentResult = await deploySalesAndTreasuryContracts(
        salesContract,
        treasuryContract,
        namespace,
        moduleName,
        account,
        pubKey,
        provider,
        client,
        session
      );

      console.log('Deployment result:', deploymentResult);

      // Extract transaction keys for tracking
      const transactionKeys = deploymentResult.transactions.map(tx => tx.requestKey);
      currentTransactionKeys.push(...transactionKeys);

      updateState({ 
        currentStep: 'Waiting for contract deployment confirmation...',
        transactionKeys: currentTransactionKeys
      });

      // Wait for all transactions to complete
      console.log('Polling for deployment confirmations...');
      const confirmations = [];
      
      for (const tx of deploymentResult.transactions) {
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
      }

      updateState({ 
        salesContractDeployed: true,
        treasuryContractDeployed: true,
        salesContractAddress: deploymentResult.salesContractAddress,
        treasuryContractAddress: deploymentResult.treasuryContractAddress,
        currentStep: 'All contracts deployed successfully!'
      });

      updateState({ 
        isLoading: false,
        currentStep: 'Deployment completed successfully!',
        error: null
      });

      console.log('=== Deployment Completed Successfully ===');
      console.log('Sales contract:', deploymentResult.salesContractAddress);
      console.log('Treasury contract:', deploymentResult.treasuryContractAddress);
      console.log('Transaction keys:', currentTransactionKeys);

      toast.success('Sales and treasury contracts deployed successfully!', { 
        position: 'top-center' 
      });
      
      return {
        success: true,
        salesContractAddress: deploymentResult.salesContractAddress,
        treasuryContractAddress: deploymentResult.treasuryContractAddress,
        transactionKeys: currentTransactionKeys
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

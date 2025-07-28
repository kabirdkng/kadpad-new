import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { checkProjectByContract, markProjectAsDeployed } from '../../api';
import { toast } from 'react-toastify';
import { useSalesContractDeployment } from '../../hooks/useSalesContractDeployment';

// Import refactored components
import LaunchLoadingState from './launch-token/LaunchLoadingState';
import PendingConfiguration from './launch-token/PendingConfiguration';
import SalesConfiguredView from './launch-token/SalesConfiguredView';
import LaunchedState from './launch-token/LaunchedState';

const LaunchTokenStep = ({ tokenDetails }) => {
  const [salesConfig, setSalesConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  
  // Use the sales contract deployment hook
  const { deploymentState, deploySalesAndTreasury, resetDeploymentState } = useSalesContractDeployment();

  const fetchProjectDetails = useCallback(async () => {
    if (tokenDetails && tokenDetails.contractAddress) {
      try {
        const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
        const response = await checkProjectByContract(namespace, moduleName);
        const projectData = response.data.data.project;
        setProject(projectData);
        
        // Set sales config if available
        if (projectData.salesDetails && projectData.salesDetails.totalTokensToSale) {
          setSalesConfig(projectData.salesDetails);
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    }
    setLoading(false);
  }, [tokenDetails]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Reset deployment state when component mounts or token details change
  useEffect(() => {
    resetDeploymentState();
  }, [tokenDetails, resetDeploymentState]);

  const handleDeploy = async () => {
    try {
      console.log('=== Starting deployment process ===');
      console.log('Token details:', tokenDetails);
      console.log('Sales config:', salesConfig);
      console.log('Project:', project);
      
      if (!tokenDetails || !salesConfig) {
        const errorMsg = 'Token details or sales configuration missing';
        console.error(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate required fields
      if (!tokenDetails.contractAddress) {
        const errorMsg = 'Contract address is required';
        console.error(errorMsg);
        toast.error(errorMsg);
        return;
      }

      const contractParts = tokenDetails.contractAddress.split('.');
      if (contractParts.length !== 2) {
        const errorMsg = 'Invalid contract address format';
        console.error(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Prepare token data for deployment
      const tokenData = {
        namespace: contractParts[0],
        moduleName: contractParts[1],
        totalSupply: project?.tokendetails?.totalSupply || salesConfig.totalTokensToSale || 0
      };

      console.log('Token data prepared:', tokenData);

      // Prepare sales configuration for deployment - using actual salesDetails from project
      const salesConfigForDeployment = {
        totalBatches: salesConfig.totalBatches || 0,
        amountPerBatch: salesConfig.amountPerBatch || salesConfig.tokensPerBatch || 0,
        liquidityLockupAmount: salesConfig.liquidityLockupAmount || 0,
        treasuryAmount: salesConfig.treasuryAmount || 0,
        whitelistLimit: salesConfig.whitelistLimit || 0,
        phase0Price: salesConfig.phase0Price || salesConfig.phase0price || 0,
        phase0StartDate: salesConfig.phase0StartDate || salesConfig.phase0startDate,
        phase1Price: salesConfig.phase1Price || 0,
        phase1StartDate: salesConfig.phase1StartDate,
        salesEndDate: salesConfig.salesEndDate,
        tokensForSale: salesConfig.totalTokensToSale || salesConfig.presalesAmount || 0
      };

      console.log('Sales config prepared:', salesConfigForDeployment);

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to deploy the sales contracts?\n\n` +
        `This will:\n` +
        `- Deploy sales contract: ${tokenData.namespace}.${tokenData.moduleName}-sales\n` +
        `- Deploy treasury contract: ${tokenData.namespace}.${tokenData.moduleName}-treasury\n` +
        `- Initialize both contracts\n` +
        `- Transfer tokens if needed\n\n` +
        `This action cannot be undone.`
      );

      if (!confirmed) {
        console.log('Deployment cancelled by user');
        return;
      }

      console.log('=== Calling deploySalesAndTreasury ===');
      
      // Deploy contracts using the hook
      const result = await deploySalesAndTreasury(tokenData, salesConfigForDeployment);
      
      console.log('=== Deployment result ===', result);

      if (result && result.success) {
        console.log('✅ Contracts deployed successfully, updating backend...');
        
        // Prepare deployment data for backend
        const deploymentData = {
          salesContractAddress: result.salesContractAddress,
          treasuryContractAddress: result.treasuryContractAddress,
          transactionKeys: result.transactionKeys || []
        };

        console.log('Deployment data for backend:', deploymentData);

        // Mark project as deployed in the backend ONLY after successful blockchain deployment
        const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
        console.log('Calling markProjectAsDeployed API...');
        
        const apiResponse = await markProjectAsDeployed(namespace, moduleName, deploymentData);
        console.log('API response:', apiResponse);

        toast.success('🎉 Project successfully deployed and launched!');
        
        // Refresh project details to show updated status
        await fetchProjectDetails();
        
        // Reset deployment state for next use
        resetDeploymentState();
        
      } else {
        console.error('❌ Deployment failed:', result?.error || 'Unknown error');
        toast.error(`Deployment failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('=== Error in handleDeploy ===', error);
      toast.error(`Failed to deploy contracts: ${error.message}`);
    }
  };

  // Show different content based on project status
  if (loading) {
    return <LaunchLoadingState />;
  }

  if (!project || !['sales_configured', 'launched'].includes(project.status)) {
    return <PendingConfiguration />;
  }

  if (project.status === 'sales_configured' && project.salesDetails) {
    const salesDetails = project.salesDetails;
    
    return (
      <SalesConfiguredView
        tokenDetails={tokenDetails}
        salesDetails={salesDetails}
        project={project}
        deploymentState={deploymentState}
        onDeploy={handleDeploy}
      />
    );
  }

  if (project.status === 'launched') {
    return (
      <LaunchedState
        tokenDetails={tokenDetails}
        project={project}
      />
    );
  }

  return null;
};

LaunchTokenStep.propTypes = {
  tokenDetails: PropTypes.shape({
    contractAddress: PropTypes.string,
    totalSupply: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })
};

export default LaunchTokenStep;
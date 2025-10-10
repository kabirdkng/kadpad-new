import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { checkProjectByContract } from '../../api';
import { toast } from 'react-toastify';
import { useSalesContractDeployment } from '../../hooks/useSalesContractDeployment';

// Import refactored components
import LaunchLoadingState from './launch-token/LaunchLoadingState';
import PendingConfiguration from './launch-token/PendingConfiguration';
import SalesConfiguredView from './launch-token/SalesConfiguredView';
import LaunchedState from './launch-token/LaunchedState';

const LaunchTokenStep = ({ tokenDetails, project: globalProject, statusLoading: globalStatusLoading }) => {
  const [salesConfig, setSalesConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localProject, setLocalProject] = useState(null);
  const containerRef = useRef(null);
  
  // Use global project state when available, otherwise use local state  
  const currentProject = globalProject || localProject;
  const isLoading = globalStatusLoading !== undefined ? globalStatusLoading : loading;
  
  // Use the sales contract deployment hook
  const { deploymentState, deploySalesAndTreasury, resetDeploymentState } = useSalesContractDeployment();

  const fetchProjectDetails = useCallback(async () => {
    if (tokenDetails && tokenDetails.contractAddress) {
      try {
        const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
        const response = await checkProjectByContract(namespace, moduleName);
        const projectData = response.data.data.project;
        setLocalProject(projectData);
        
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

  // Scroll management to prevent view jumping
  useEffect(() => {
    if (containerRef.current && currentProject?.status === 'launched') {
      // Smooth scroll to top of container when transitioning to launched state
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [currentProject?.status]);

  const handleDeploy = async () => {
    // Store current scroll position
    const currentScrollY = window.scrollY;
    
    try {
      console.log('=== Starting deployment process ===');
      console.log('Token details:', tokenDetails);
      console.log('Current project:', currentProject);
      
      // Get sales configuration from current project or local state
      const currentSalesConfig = currentProject?.salesDetails || salesConfig;
      console.log('Sales config:', currentSalesConfig);
      
      if (!tokenDetails || !currentSalesConfig) {
        const errorMsg = 'Token details or sales configuration missing';
        console.error(errorMsg);
        console.error('Missing tokenDetails:', !tokenDetails);
        console.error('Missing salesConfig:', !currentSalesConfig);
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
        totalSupply: currentProject?.tokendetails?.totalSupply || currentSalesConfig.totalTokensToSale || 0
      };

      console.log('Token data prepared:', tokenData);

      // Prepare sales configuration for deployment - using actual salesDetails from project
      const salesConfigForDeployment = {
        totalBatches: currentSalesConfig.totalBatches || 0,
        amountPerBatch: currentSalesConfig.amountPerBatch || currentSalesConfig.tokensPerBatch || 0,
        platformShare: currentSalesConfig.platformShare || 0,
        liquidityLockupAmount: currentSalesConfig.liquidityLockupAmount || 0,
        treasuryAmount: currentSalesConfig.treasuryAmount || 0,
        whitelistLimit: currentSalesConfig.whitelistLimit || 0,
        phase0Price: currentSalesConfig.phase0Price || currentSalesConfig.phase0price || 0,
        phase0StartDate: currentSalesConfig.phase0StartDate || currentSalesConfig.phase0startDate,
        phase1Price: currentSalesConfig.phase1Price || 0,
        phase1StartDate: currentSalesConfig.phase1StartDate,
        salesEndDate: currentSalesConfig.salesEndDate,
        tokensForSale: currentSalesConfig.totalTokensToSale || currentSalesConfig.presalesAmount || 0
      };

      console.log('Sales config prepared:', salesConfigForDeployment);

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Are you sure you want to deploy and launch the token?\n\n` +
        `🔐 TWO-PHASE SIGNING PROCESS:\n` +
        `Phase 1: Sign contract deployment transactions\n` +
        `Phase 2: Sign token distribution transactions (after contracts deploy)\n\n` +
        `This will:\n` +
        `- Deploy sales contract: ${tokenData.namespace}.${tokenData.moduleName}-sales\n` +
        `- Deploy treasury contract: ${tokenData.namespace}.${tokenData.moduleName}-treasury\n` +
        `- Fetch actual contract account addresses\n` +
        `- Distribute tokens to contract accounts\n` +
        `- Update project status to "launched"\n\n` +
        `⚠️ You will need to approve transactions TWICE during this process.\n` +
        `This action cannot be undone.`
      );

      if (!confirmed) {
        console.log('Deployment cancelled by user');
        return;
      }

      console.log('=== Calling deploySalesAndTreasury ===');
      
      // Deploy contracts using the hook - this includes batch signing and backend updates
      const result = await deploySalesAndTreasury(tokenData, salesConfigForDeployment);
      
      console.log('=== Deployment result ===', result);

      if (result && result.success) {
        console.log('✅ Complete deployment and distribution successful!');
        console.log('Transaction keys:', result.transactionKeys);
        console.log('Sales contract:', result.salesContractAddress);
        console.log('Treasury contract:', result.treasuryContractAddress);
        
        toast.success('🎉 Project successfully deployed and launched!');
        
        // Refresh project details to show updated status
        await fetchProjectDetails();
        
        // Reset deployment state for next use
        resetDeploymentState();

        // Maintain scroll position after state changes
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
      } else {
        console.error('❌ Deployment failed or incomplete:', result);
        toast.error('Deployment failed. Please check console for details.');
      }
    } catch (error) {
      console.error('=== Error in handleDeploy ===', error);
      toast.error(`Failed to deploy contracts: ${error.message}`);
      
      // Restore scroll position on error
      window.scrollTo({ top: currentScrollY, behavior: 'smooth' });
    }
  };

  // Handle deployment completion callback
  const handleDeploymentComplete = useCallback(() => {
    console.log('Deployment completed, refreshing project status...');
    // Refresh project details to get the updated status
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Show different content based on project status
  if (isLoading) {
    return <LaunchLoadingState />;
  }

  if (!currentProject || !['sales_configured', 'launched'].includes(currentProject.status)) {
    return <PendingConfiguration />;
  }

  if (currentProject.status === 'sales_configured' && currentProject.salesDetails) {
    const salesDetails = currentProject.salesDetails;
    
    return (
      <div ref={containerRef}>
        <SalesConfiguredView
          tokenDetails={tokenDetails}
          salesDetails={salesDetails}
          project={currentProject}
          deploymentState={deploymentState}
          onDeploy={handleDeploy}
          onDeploymentComplete={handleDeploymentComplete}
        />
      </div>
    );
  }

  if (currentProject.status === 'launched') {
    return (
      <div ref={containerRef}>
        <LaunchedState
          tokenDetails={tokenDetails}
          project={currentProject}
        />
      </div>
    );
  }

  return null;
};

LaunchTokenStep.propTypes = {
  tokenDetails: PropTypes.shape({
    contractAddress: PropTypes.string,
    totalSupply: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  project: PropTypes.object,
  statusLoading: PropTypes.bool
};

export default LaunchTokenStep;
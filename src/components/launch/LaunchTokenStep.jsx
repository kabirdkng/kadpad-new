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

const LaunchTokenStep = ({ tokenDetails }) => {
  const [salesConfig, setSalesConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const containerRef = useRef(null);
  
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

  // Scroll management to prevent view jumping
  useEffect(() => {
    if (containerRef.current && project?.status === 'launched') {
      // Smooth scroll to top of container when transitioning to launched state
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [project?.status]);

  const handleDeploy = async () => {
    // Store current scroll position
    const currentScrollY = window.scrollY;
    
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
        platformShare: salesConfig.platformShare || 0,
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
  if (loading) {
    return <LaunchLoadingState />;
  }

  if (!project || !['sales_configured', 'launched'].includes(project.status)) {
    return <PendingConfiguration />;
  }

  if (project.status === 'sales_configured' && project.salesDetails) {
    const salesDetails = project.salesDetails;
    
    return (
      <div ref={containerRef}>
        <SalesConfiguredView
          tokenDetails={tokenDetails}
          salesDetails={salesDetails}
          project={project}
          deploymentState={deploymentState}
          onDeploy={handleDeploy}
          onDeploymentComplete={handleDeploymentComplete}
        />
      </div>
    );
  }

  if (project.status === 'launched') {
    return (
      <div ref={containerRef}>
        <LaunchedState
          tokenDetails={tokenDetails}
          project={project}
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
  })
};

export default LaunchTokenStep;
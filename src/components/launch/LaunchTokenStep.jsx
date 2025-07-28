import React, { useState, useEffect } from 'react';
import { checkProjectByContract, markProjectAsDeployed } from '../../api';
import { toast } from 'react-toastify';

// Import refactored components
import LaunchLoadingState from './launch-token/LaunchLoadingState';
import PendingConfiguration from './launch-token/PendingConfiguration';
import SalesConfiguredView from './launch-token/SalesConfiguredView';
import LaunchedState from './launch-token/LaunchedState';

const LaunchTokenStep = ({ submissionStatus, tokenDetails }) => {
  const [salesConfig, setSalesConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [tokenDetails]);

  const fetchProjectDetails = async () => {
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
  };

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
      
      await markProjectAsDeployed(namespace, moduleName);
      
      toast.success('🎉 Project successfully deployed and launched!');
      await fetchProjectDetails();
    } catch (error) {
      console.error('Error marking project as deployed:', error);
      toast.error('Failed to mark project as deployed. Please try again.');
    } finally {
      setIsDeploying(false);
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
        isDeploying={isDeploying}
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

export default LaunchTokenStep;
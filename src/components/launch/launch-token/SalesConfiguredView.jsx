import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Settings } from 'lucide-react';
import TokenInfoCard from './TokenInfoCard';
import SalesOverview from './SalesOverview';
import SalesConfigurationDetails from './SalesConfigurationDetails';
import DeploymentCard from './DeploymentCard';

const SalesConfiguredView = ({ 
  tokenDetails, 
  salesDetails, 
  project, 
  deploymentState = {}, 
  onDeploy,
  onDeploymentComplete
}) => {

  useEffect(() => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, []);
    
  const handleDeploymentComplete = () => {
    console.log('Deployment completed, transitioning to launched state');
    // Call the parent's completion handler
    onDeploymentComplete?.();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
          Ready to Deploy Sales Contract
        </h2>
        <p className="text-secondary max-w-2xl mx-auto">
          Your sales parameters have been configured by our team. Review the details and deploy your sales contract.
        </p>
      </div>

      {/* Token Info Card */}
      <TokenInfoCard tokenDetails={tokenDetails} />

      {/* Sales Configuration Overview */}
      <SalesOverview salesDetails={salesDetails} />

      {/* Detailed Sales Configuration */}
      <SalesConfigurationDetails salesDetails={salesDetails} project={project} />

      {/* Deploy Action Card */}
      <DeploymentCard 
        deploymentState={deploymentState}
        onDeploy={onDeploy}
        onDeploymentComplete={handleDeploymentComplete}
      />
    </div>
  );
};

SalesConfiguredView.propTypes = {
  tokenDetails: PropTypes.object,
  salesDetails: PropTypes.object,
  project: PropTypes.object,
  deploymentState: PropTypes.object,
  onDeploy: PropTypes.func.isRequired,
  onDeploymentComplete: PropTypes.func
};

export default SalesConfiguredView;

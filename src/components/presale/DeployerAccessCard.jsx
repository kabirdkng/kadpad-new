import PropTypes from 'prop-types';
import { Settings } from 'lucide-react';

const DeployerAccessCard = ({ 
  account, 
  isDeployer, 
  isDeployerLoading, 
  handleDeployerAccess 
}) => {
  if (!account || !isDeployer) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-primary-text">Deployer Access</h3>
      </div>
      <p className="text-secondary text-sm mb-4">
        Access deployer panel to manage sales and treasury functions.
      </p>
      <button
        onClick={handleDeployerAccess}
        disabled={isDeployerLoading}
        className="w-full btn btn-secondary flex items-center justify-center gap-2"
      >
        {isDeployerLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verifying...
          </>
        ) : (
          <>
            <Settings className="w-4 h-4" />
            Access Deployer Panel
          </>
        )}
      </button>
    </div>
  );
};

DeployerAccessCard.propTypes = {
  account: PropTypes.string,
  isDeployer: PropTypes.bool.isRequired,
  isDeployerLoading: PropTypes.bool.isRequired,
  handleDeployerAccess: PropTypes.func.isRequired,
};

export default DeployerAccessCard;

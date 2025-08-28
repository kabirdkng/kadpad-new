import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { usePostSalesOperations } from '../../hooks/usePostSalesOperations';

const PostSalesStatusCard = ({ 
  tokenSymbol,
  isLoading,
  namespace,
  moduleName,
  supplyChain
}) => {
  // Get distribution status and backend status from the post-sales operations hook
  const {
    distributionComplete,
    salesEnded,
    liquidityInitialized,
    checkDistributionStatus,
    checkBackendStatus
  } = usePostSalesOperations(
    namespace,
    `${moduleName}-sales`,
    supplyChain,
    moduleName
  );

  // Check distribution status and backend status when component mounts or when dependencies change
  useEffect(() => {
    if (supplyChain && namespace && moduleName) {
      checkDistributionStatus();
      checkBackendStatus();
    }
  }, [supplyChain, namespace, moduleName, checkDistributionStatus, checkBackendStatus]);
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="space-y-4 p-6">
        <h3 className="text-xl font-bold text-primary-text">Post-Sales Status</h3>
        
        {/* Distribution Status */}
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          distributionComplete 
            ? 'bg-success/10 border border-success/20'
            : 'bg-warning/10 border border-warning/20'
        }`}>
          {distributionComplete ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <Clock className="w-5 h-5 text-warning" />
          )}
          <div>
            <p className="text-primary-text font-medium">
              {distributionComplete ? 'Token Distribution Complete' : 'Token Distribution In Progress'}
            </p>
            <p className="text-secondary text-sm">
              {distributionComplete 
                ? 'All tokens have been distributed to buyers'
                : 'The deployer is currently distributing tokens to buyers'
              }
            </p>
          </div>
        </div>

        {/* Sales End Status */}
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          salesEnded 
            ? 'bg-success/10 border border-success/20'
            : distributionComplete 
              ? 'bg-warning/10 border border-warning/20'
              : 'bg-gray-100/10 border border-gray-300/20'
        }`}>
          {salesEnded ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : distributionComplete ? (
            <Clock className="w-5 h-5 text-warning" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className="text-primary-text font-medium">
              {salesEnded ? 'Sales Contract Ended' : 'Sales Contract Active'}
            </p>
            <p className="text-secondary text-sm">
              {salesEnded 
                ? 'Sales contract has been ended, funds moved to treasury'
                : distributionComplete
                  ? 'Waiting for deployer to end the sales contract'
                  : 'Sales contract will be ended after distribution completes'
              }
            </p>
          </div>
        </div>

        {/* Liquidity Status */}
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          liquidityInitialized 
            ? 'bg-success/10 border border-success/20'
            : salesEnded 
              ? 'bg-warning/10 border border-warning/20'
              : 'bg-gray-100/10 border border-gray-300/20'
        }`}>
          {liquidityInitialized ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : salesEnded ? (
            <Clock className="w-5 h-5 text-warning" />
          ) : (
            <Clock className="w-5 h-5 text-gray-400" />
          )}
          <div className="flex-1">
            <p className="text-primary-text font-medium">
              {liquidityInitialized ? 'Liquidity Initialized' : 'Liquidity Pending'}
            </p>
            <p className="text-secondary text-sm">
              {liquidityInitialized 
                ? `${tokenSymbol} is now tradeable on DEXes`
                : salesEnded
                  ? 'Waiting for deployer to initialize DEX liquidity'
                  : 'Liquidity will be initialized after sales end'
              }
            </p>
          </div>
          {liquidityInitialized && (
            <ExternalLink className="w-4 h-4 text-success" />
          )}
        </div>

        {/* Final Status Message */}
        {liquidityInitialized ? (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-primary-text mb-2">
                🎉 Project Launch Complete!
              </h4>
              <p className="text-secondary">
                ${tokenSymbol} tokens are now fully launched and available for trading on decentralized exchanges.
                All post-sales operations have been completed successfully.
              </p>
            </div>
          </div>
        ) : salesEnded ? (
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-primary-text mb-2">
                ⏳ Almost Ready!
              </h4>
              <p className="text-secondary">
                Sales have ended successfully. Waiting for liquidity initialization to complete the launch.
              </p>
            </div>
          </div>
        ) : distributionComplete ? (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-primary-text mb-2">
                📋 Next Steps Required
              </h4>
              <p className="text-secondary">
                Distribution complete. The deployer needs to end sales and initialize liquidity.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-primary-text mb-2">
                🚀 Post-Sales in Progress
              </h4>
              <p className="text-secondary">
                Token distribution is in progress. Please wait for all operations to complete.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PostSalesStatusCard.propTypes = {
  tokenSymbol: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.string.isRequired
};

PostSalesStatusCard.defaultProps = {
  isLoading: false
};

export default PostSalesStatusCard;

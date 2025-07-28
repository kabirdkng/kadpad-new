import PropTypes from 'prop-types';
import { Rocket, Settings, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';

const DeploymentCard = ({ deploymentState = {}, onDeploy }) => {
  const { 
    isLoading = false, 
    currentStep = null, 
    error = null, 
    salesContractDeployed = false, 
    treasuryContractDeployed = false, 
    salesContractAddress = null, 
    treasuryContractAddress = null, 
    transactionKeys = [] 
  } = deploymentState;

  return (
    <>
      {/* Deploy Action Card */}
      <div className="card bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          {salesContractDeployed && treasuryContractDeployed ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : (
            <Rocket className="w-8 h-8 text-white" />
          )}
        </div>
        
        <h3 className="text-xl font-bold text-primary-text mb-4">
          {salesContractDeployed && treasuryContractDeployed ? 'Contracts Deployed!' : 'Deploy Sales Contract'}
        </h3>
        
        <p className="text-secondary mb-8 max-w-md mx-auto">
          {salesContractDeployed && treasuryContractDeployed ? 
            'Your sales and treasury contracts have been successfully deployed and are ready for use.' :
            'Everything looks good! Deploy your sales contract with the configuration above to make your tokens available for purchase.'
          }
        </p>
        
        {(!salesContractDeployed || !treasuryContractDeployed) && (
          <button
            className="btn btn-primary btn-lg flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={onDeploy}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Deploy & Launch
              </>
            )}
          </button>
        )}

        {/* Deployment Progress */}
        {isLoading && currentStep && (
          <div className="mt-6 space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: salesContractDeployed && treasuryContractDeployed ? '100%' : 
                         salesContractDeployed || treasuryContractDeployed ? '60%' : '30%'
                }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-secondary">
              <Clock className="w-4 h-4" />
              {currentStep}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success State with Contract Addresses */}
        {salesContractDeployed && treasuryContractDeployed && (
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-3">Deployed Contracts</h4>
              <div className="space-y-2 text-sm">
                {salesContractAddress && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Sales Contract:</span>
                    <code className="text-green-400 text-xs">{salesContractAddress}</code>
                  </div>
                )}
                {treasuryContractAddress && (
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Treasury Contract:</span>
                    <code className="text-green-400 text-xs">{treasuryContractAddress}</code>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Keys */}
            {transactionKeys && transactionKeys.length > 0 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h5 className="text-blue-400 font-medium mb-2 text-sm">Transaction Keys</h5>
                <div className="space-y-1">
                  {transactionKeys.map((key, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <code className="text-blue-300 truncate">{key}</code>
                      <ExternalLink className="w-3 h-3 text-blue-400 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Post-Deployment Management</h4>
            <p className="text-secondary text-sm leading-relaxed">
              After deployment, you&apos;ll have access to advanced management features including whitelist configuration, 
              real-time sales monitoring, participant management, and the ability to adjust certain parameters 
              through our admin interface.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

DeploymentCard.propTypes = {
  deploymentState: PropTypes.shape({
    isLoading: PropTypes.bool,
    currentStep: PropTypes.string,
    error: PropTypes.string,
    salesContractDeployed: PropTypes.bool,
    treasuryContractDeployed: PropTypes.bool,
    salesContractAddress: PropTypes.string,
    treasuryContractAddress: PropTypes.string,
    transactionKeys: PropTypes.array
  }),
  onDeploy: PropTypes.func.isRequired
};

export default DeploymentCard;

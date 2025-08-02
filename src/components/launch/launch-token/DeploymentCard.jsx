import PropTypes from 'prop-types';
import { Rocket, Settings, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';

// Helper function to calculate progress width based on current step
const getProgressWidth = (currentStep, salesDeployed, treasuryDeployed) => {
  // If both are deployed and process is complete, we're at 100%
  if (salesDeployed && treasuryDeployed && currentStep && currentStep.toLowerCase().includes('completed')) {
    return '100%';
  }
  
  if (!currentStep) return '5%';
  
  const step = currentStep.toLowerCase();
  
  // Progressive steps based on new deployment flow
  if (step.includes('checking existing')) return '10%';
  if (step.includes('both contracts exist')) return '40%';
  if (step.includes('treasury exists')) return '20%';
  if (step.includes('deploying') || step.includes('signing')) return '30%';
  if (step.includes('starting token distribution') || step.includes('distribution')) return '60%';
  if (step.includes('transferred') || step.includes('transfer')) return '70%';
  if (step.includes('updating project') || step.includes('marking')) return '90%';
  if (step.includes('completed') || step.includes('successful')) return '100%';
  
  // Default progress for unmatched steps
  return '15%';
};

// Helper function to get deployment steps with status
const getDeploymentSteps = (currentStep, salesDeployed, treasuryDeployed) => {
  const steps = [
    { label: 'Check existing contracts', key: 'check' },
    { label: 'Deploy missing contracts', key: 'deploy' },
    { label: 'Distribute tokens', key: 'distribute' },
    { label: 'Update project status', key: 'update' },
    { label: 'Complete', key: 'complete' }
  ];

  const getCurrentStepKey = () => {
    if (!currentStep) return 'check';
    const step = currentStep.toLowerCase();
    
    // Enhanced step detection for new flow
    if (step.includes('checking existing') || step.includes('preparing')) {
      return 'check';
    }
    if (step.includes('deploying') || step.includes('signing') || step.includes('creating transaction') || step.includes('batch')) {
      return 'deploy';
    }
    if (step.includes('distribution') || step.includes('transfer') || step.includes('token')) {
      return 'distribute';
    }
    if (step.includes('updating project') || step.includes('marking')) {
      return 'update';
    }
    if (step.includes('completed') || step.includes('successful')) {
      return 'complete';
    }
    
    return 'check';
  };

  const currentStepKey = getCurrentStepKey();
  const stepOrder = ['check', 'deploy', 'distribute', 'update', 'complete'];
  const currentIndex = stepOrder.indexOf(currentStepKey);
  
  return steps.map((step, index) => {
    let status = 'pending';
    
    if (salesDeployed && treasuryDeployed && currentStepKey === 'complete') {
      status = 'completed';
    } else if (step.key === currentStepKey) {
      status = 'current';
    } else if (index < currentIndex) {
      status = 'completed';
    }
    
    return { ...step, status };
  });
};

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

  // Debug logging
  console.log('DeploymentCard - Current step:', currentStep);
  console.log('DeploymentCard - Sales deployed:', salesContractDeployed);
  console.log('DeploymentCard - Treasury deployed:', treasuryContractDeployed);

  return (
    <div className="transition-all duration-300 ease-in-out">
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
          <div className="mt-6 space-y-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-700 ease-out relative"
                style={{
                  width: getProgressWidth(currentStep, salesContractDeployed, treasuryContractDeployed)
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            {/* Current Step */}
            <div className="flex items-center justify-center gap-2 text-sm text-secondary">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              {currentStep}
            </div>

            {/* Deployment Steps */}
            <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-medium text-green-400 mb-3">Deployment Progress</h4>
              <div className="space-y-2">
                {getDeploymentSteps(currentStep, salesContractDeployed, treasuryContractDeployed).map((step, index) => (
                  <div key={index} className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                    step.status === 'completed' ? 'text-green-400' : 
                    step.status === 'current' ? 'text-blue-400 font-medium' : 'text-gray-500'
                  }`}>
                    <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      step.status === 'completed' ? 'bg-green-400' : 
                      step.status === 'current' ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'
                    }`}></div>
                    <span>{step.label}</span>
                    {step.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                    {step.status === 'current' && <Clock className="w-3 h-3 animate-spin" />}
                  </div>
                ))}
              </div>
              
              {/* Debug info in development
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs text-gray-400">
                  <div>Raw Step: "{currentStep || 'None'}"</div>
                  <div>Detected Step: "{getDeploymentSteps(currentStep, salesContractDeployed, treasuryContractDeployed).find(s => s.status === 'current')?.label || 'None'}"</div>
                  <div>Sales Deployed: {salesContractDeployed ? 'Yes' : 'No'}</div>
                  <div>Treasury Deployed: {treasuryContractDeployed ? 'Yes' : 'No'}</div>
                  <div>Progress: {getProgressWidth(currentStep, salesContractDeployed, treasuryContractDeployed)}</div>
                </div>
              )} */}
            </div>

            {/* Transaction Keys Display */}
            {transactionKeys && transactionKeys.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <h5 className="text-blue-400 font-medium mb-2 text-xs">Transaction Keys ({transactionKeys.length})</h5>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {transactionKeys.map((key, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <code className="text-blue-300 truncate font-mono">{key}</code>
                      <ExternalLink 
                        className="w-3 h-3 text-blue-400 cursor-pointer hover:text-blue-300 flex-shrink-0" 
                        onClick={() => window.open(`https://explorer.chainweb.com/mainnet/tx/${key}`, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    </div>
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

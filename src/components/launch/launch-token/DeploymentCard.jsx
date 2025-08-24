import PropTypes from 'prop-types';
import { Rocket, Settings, CheckCircle2, AlertCircle, ExternalLink, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

// Success Animation Component
const SuccessAnimation = ({ onComplete }) => {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
      onComplete?.();
    }, 2000); // Show animation for 2 seconds for quicker transition

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!showAnimation) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Big Success Checkmark */}
        <div className="relative mx-auto mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-16 h-16 text-white animate-bounce" />
          </div>
          
          {/* Celebration particles */}
          <div className="absolute -top-4 -left-4 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -top-2 -right-6 w-3 h-3 bg-blue-400 rounded-full animate-ping delay-300"></div>
          <div className="absolute -bottom-3 -left-6 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-500"></div>
          <div className="absolute -bottom-4 -right-4 w-4 h-4 bg-pink-400 rounded-full animate-ping delay-700"></div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in-up">
          🎉 Deployment Successful!
        </h2>
        <p className="text-green-400 text-lg animate-fade-in-up delay-300">
          Your contracts are now live and tokens have been distributed
        </p>
        
        {/* Progress indicator */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

SuccessAnimation.propTypes = {
  onComplete: PropTypes.func
};

// Helper function to calculate progress width based on current step
const getProgressWidth = (currentStep, salesDeployed, treasuryDeployed) => {
  // If both are deployed and process is complete, we're at 100%
  if (salesDeployed && treasuryDeployed && currentStep && (
    currentStep.toLowerCase().includes('complete deployment') ||
    currentStep.toLowerCase().includes('project successfully launched') ||
    currentStep.toLowerCase().includes('successful')
  )) {
    return '100%';
  }
  
  if (!currentStep) return '5%';
  
  const step = currentStep.toLowerCase();
  
  // Match the exact steps from completeDeployment.js
  if (step.includes('checking existing contracts')) return '10%';
  if (step.includes('preparing treasury deployment') || step.includes('preparing sales deployment')) return '20%';
  if (step.includes('phase 1') || step.includes('signing contract deployment')) return '30%';
  if (step.includes('deploying contracts')) return '40%';
  if (step.includes('waiting for treasury contract confirmation') || 
      step.includes('waiting for sales contract confirmation') ||
      step.includes('treasury contract deployed') ||
      step.includes('sales contract deployed')) return '50%';
  if (step.includes('fetching contract account addresses')) return '60%';
  if (step.includes('preparing token transfer transactions') ||
      step.includes('phase 2') || 
      step.includes('signing token transfer')) return '70%';
  if (step.includes('processing token transfers') || 
      step.includes('all token transfers submitted') ||
      step.includes('waiting for confirmations') ||
      step.includes('confirmed:')) return '85%';
  if (step.includes('updating project status')) return '95%';
  if (step.includes('complete deployment and distribution successful') ||
      step.includes('project successfully launched')) return '100%';
  
  // Fallback
  return '15%';
};

// Helper function to get deployment steps with status
const getDeploymentSteps = (currentStep, salesDeployed, treasuryDeployed) => {
  const steps = [
    { label: 'Checking existing contracts', key: 'check' },
    { label: 'Preparing deployment transactions', key: 'prepare' },
    { label: 'Phase 1: Signing deployments', key: 'sign1' },
    { label: 'Deploying contracts', key: 'deploy' },
    { label: 'Waiting for confirmations', key: 'confirm' },
    { label: 'Fetching contract accounts', key: 'fetch' },
    { label: 'Phase 2: Signing transfers', key: 'sign2' },
    { label: 'Processing token transfers', key: 'transfers' },
    { label: 'Updating project status', key: 'update' },
    { label: 'Complete', key: 'complete' }
  ];

  const getCurrentStepKey = () => {
    if (!currentStep) return null;
    
    const step = currentStep.toLowerCase();
    
    // Match exact progress messages from completeDeployment.js
    if (step.includes('checking existing contracts')) return 'check';
    if (step.includes('preparing treasury deployment') || step.includes('preparing sales deployment')) return 'prepare';
    if (step.includes('phase 1') || step.includes('signing contract deployment')) return 'sign1';
    if (step.includes('deploying contracts')) return 'deploy';
    if (step.includes('waiting for treasury contract confirmation') || 
        step.includes('waiting for sales contract confirmation') ||
        step.includes('treasury contract deployed') ||
        step.includes('sales contract deployed')) return 'confirm';
    if (step.includes('fetching contract account addresses')) return 'fetch';
    if (step.includes('preparing token transfer transactions') ||
        step.includes('phase 2') || 
        step.includes('signing token transfer')) return 'sign2';
    if (step.includes('processing token transfers') || 
        step.includes('all token transfers submitted') ||
        step.includes('waiting for confirmations') ||
        step.includes('confirmed:')) return 'transfers';
    if (step.includes('updating project status')) return 'update';
    if (step.includes('complete deployment and distribution successful') ||
        step.includes('project successfully launched')) return 'complete';
    
    return null;
  };

  const currentStepKey = getCurrentStepKey();
  const stepOrder = ['check', 'prepare', 'sign1', 'deploy', 'confirm', 'fetch', 'sign2', 'transfers', 'update', 'complete'];
  const currentIndex = currentStepKey ? stepOrder.indexOf(currentStepKey) : -1;
  
  return steps.map((step, index) => {
    let status = 'pending';
    
    if (currentIndex === -1) {
      // No current step detected, all pending
      status = 'pending';
    } else if (index < currentIndex) {
      status = 'completed';
    } else if (index === currentIndex) {
      status = 'active';
    }
    
    // Special handling for completion
    if (step.key === 'complete' && salesDeployed && treasuryDeployed && 
        currentStep && (currentStep.toLowerCase().includes('complete deployment') ||
                       currentStep.toLowerCase().includes('project successfully launched'))) {
      status = 'completed';
    }
    
    return { ...step, status };
  });
};

const DeploymentCard = ({ deploymentState = {}, onDeploy, onDeploymentComplete }) => {
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

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [deploymentJustCompleted, setDeploymentJustCompleted] = useState(false);

  // Check if deployment just completed
  useEffect(() => {
    const isCompleted = salesContractDeployed && treasuryContractDeployed && currentStep && (
      currentStep.toLowerCase().includes('completed') ||
      currentStep.toLowerCase().includes('successful') ||
      currentStep.toLowerCase().includes('project status updated') ||
      currentStep.toLowerCase().includes('deployment and distribution completed') ||
      currentStep.toLowerCase().includes('ready!') ||
      currentStep.toLowerCase().includes('launched')
    );

    if (isCompleted && !deploymentJustCompleted) {
      setDeploymentJustCompleted(true);
      setShowSuccessAnimation(true);
    }
  }, [salesContractDeployed, treasuryContractDeployed, currentStep, deploymentJustCompleted]);

  // Handle case where contracts are already deployed (page refresh, direct navigation)
  useEffect(() => {
    if (salesContractDeployed && treasuryContractDeployed && !isLoading && !currentStep) {
      // Both contracts deployed and not in loading state - transition to launched
      onDeploymentComplete?.();
    }
  }, [salesContractDeployed, treasuryContractDeployed, isLoading, currentStep, onDeploymentComplete]);

  const handleSuccessAnimationComplete = () => {
    setShowSuccessAnimation(false);
    // Transition to launched state after success animation
    setTimeout(() => {
      onDeploymentComplete?.();
    }, 500); // Small delay for smooth transition
  };

  return (
    <>
      {showSuccessAnimation && (
        <SuccessAnimation onComplete={handleSuccessAnimationComplete} />
      )}
      
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
        
        {/* Two-Phase Signing Information */}
        {(!salesContractDeployed || !treasuryContractDeployed) && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="text-blue-400 font-medium text-sm">Two-Phase Signing Process</h4>
                <div className="text-xs text-secondary space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium text-xs">1</div>
                    <span><strong>Phase 1:</strong> Sign contract deployment transactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium text-xs">2</div>
                    <span><strong>Phase 2:</strong> Sign token distribution transactions (after contracts are deployed)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  You&apos;ll need to approve transactions twice during this process to ensure proper token distribution with correct account addresses.
                </p>
              </div>
            </div>
          </div>
        )}
        
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
                    step.status === 'active' ? 'text-yellow-400 font-medium' : 'text-gray-500'
                  }`}>
                    {step.status === 'completed' && (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    )}
                    {step.status === 'active' && (
                      <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {step.status === 'pending' && (
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    )}
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
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
          </div>
        )}
        </div>
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
  onDeploy: PropTypes.func.isRequired,
  onDeploymentComplete: PropTypes.func
};

export default DeploymentCard;
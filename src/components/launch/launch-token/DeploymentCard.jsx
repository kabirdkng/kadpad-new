import { Rocket, Settings } from 'lucide-react';

const DeploymentCard = ({ tokenDetails, isDeploying, onDeploy }) => {
  return (
    <>
      {/* Deploy Action Card */}
      <div className="card bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-primary-text mb-4">Deploy Sales Contract</h3>
        <p className="text-secondary mb-8 max-w-md mx-auto">
          Everything looks good! Deploy your sales contract with the configuration above to make your tokens available for purchase.
        </p>
        
        <button
          className="btn btn-primary btn-lg flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={onDeploy}
          disabled={isDeploying}
        >
          {isDeploying ? (
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

        {isDeploying && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full animate-pulse" style={{width: '45%'}}></div>
            </div>
            <p className="text-sm text-secondary mt-2">Processing deployment...</p>
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

export default DeploymentCard;

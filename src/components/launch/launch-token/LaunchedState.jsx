import { Link } from 'react-router-dom';
import { CheckCircle, Settings } from 'lucide-react';
import PropTypes from 'prop-types';

const LaunchedState = ({ tokenDetails, project }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
          🎉 Successfully Launched!
        </h2>
        <p className="text-secondary max-w-2xl mx-auto">
          Your project has been successfully launched and is now live!
        </p>
      </div>

      {/* Project Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Project Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Token Name</label>
            <p className="text-primary-text font-medium">{tokenDetails.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Token Contract</label>
            <p className="text-primary-text font-mono text-sm break-all">{tokenDetails.contractAddress}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Status</label>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              Launched
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Launch Date</label>
            <p className="text-primary-text text-sm">
              {project.deployedAt ? new Date(project.deployedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Deployment Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Deployment Details</h3>
        {(project.salesContractAddress || project.treasuryContractAddress || 
          (project.deploymentTransactionKeys && project.deploymentTransactionKeys.length > 0)) ? (
          <div className="space-y-4">
            {project.salesContractAddress && (
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Sales Contract Address</label>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                  <code className="text-green-400 font-mono text-sm break-all">
                    {project.salesContractAddress}
                  </code>
                </div>
              </div>
            )}
            {project.treasuryContractAddress && (
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Treasury Contract Address</label>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                  <code className="text-blue-400 font-mono text-sm break-all">
                    {project.treasuryContractAddress}
                  </code>
                </div>
              </div>
            )}
            {project.deploymentTransactionKeys && project.deploymentTransactionKeys.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Deployment Transaction Keys ({project.deploymentTransactionKeys.length})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {project.deploymentTransactionKeys.map((key, index) => (
                    <div key={index} className="bg-gray-800/50 p-2 rounded border border-gray-700/50">
                      <code className="text-blue-300 font-mono text-xs break-all block">
                        {key}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-3">
              <Settings className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-secondary">
              Deployment details are not available yet. This information will be populated after successful contract deployment.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          to={`/dashboard/${tokenDetails.contractAddress.split('.')[0]}/${tokenDetails.contractAddress.split('.')[1]}`}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <Settings className="w-5 h-5" />
          Go to Dashboard
        </Link>
        <button
          onClick={() => {
            const tweetText = `🚀 Just launched my token on @kadpad_official! Join our presale and be part of the future. #Kadena #DeFi #TokenLaunch`;
            const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(window.location.origin + `/presale/${tokenDetails.contractAddress.split('.')[0]}/${tokenDetails.contractAddress.split('.')[1]}`)}`;
            window.open(tweetUrl, '_blank');
          }}
          className="btn btn-ghost flex items-center justify-center gap-2"
        >
          <span className="text-blue-400">🐦</span>
          Share on Twitter
        </button>
      </div>
    </div>
  );
};

LaunchedState.propTypes = {
  tokenDetails: PropTypes.shape({
    name: PropTypes.string,
    contractAddress: PropTypes.string
  }),
  project: PropTypes.shape({
    deployedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    salesContractAddress: PropTypes.string,
    treasuryContractAddress: PropTypes.string,
    deploymentTransactionKeys: PropTypes.arrayOf(PropTypes.string)
  })
};

export default LaunchedState;

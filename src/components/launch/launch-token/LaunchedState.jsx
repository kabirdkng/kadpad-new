import { Link } from 'react-router-dom';
import { CheckCircle, Settings, ExternalLink } from 'lucide-react';
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
            {/* Success Banner */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h4 className="text-green-400 font-semibold">Successfully Deployed</h4>
              </div>
              <p className="text-sm text-gray-300">
                All contracts have been successfully deployed to the Kadena blockchain and are fully operational.
              </p>
            </div>

            {/* Contract Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.salesContractAddress && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <label className="block text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Sales Contract
                  </label>
                  <code className="text-green-300 font-mono text-sm break-all block p-2 bg-green-500/10 rounded border border-green-500/20">
                    {project.salesContractAddress}
                  </code>
                  <p className="text-xs text-gray-400 mt-2">Handles token sales and presale logic</p>
                </div>
              )}
              
              {project.treasuryContractAddress && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <label className="block text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Treasury Contract
                  </label>
                  <code className="text-blue-300 font-mono text-sm break-all block p-2 bg-blue-500/10 rounded border border-blue-500/20">
                    {project.treasuryContractAddress}
                  </code>
                  <p className="text-xs text-gray-400 mt-2">Manages token treasury and distribution</p>
                </div>
              )}
            </div>

            {/* Transaction Keys */}
            {project.deploymentTransactionKeys && project.deploymentTransactionKeys.length > 0 && (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <label className="block text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Deployment Transactions ({project.deploymentTransactionKeys.length})
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {project.deploymentTransactionKeys.map((key, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                      <code className="text-purple-300 font-mono text-xs break-all flex-1">
                        {key}
                      </code>
                      <button
                        onClick={() => window.open(`https://explorer.chainweb.com/mainnet/tx/${key}`, '_blank')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-300 hover:text-purple-200 transition-colors"
                        title="View on Explorer"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Click "View" to see transaction details on the Kadena blockchain explorer
                </p>
              </div>
            )}

            {/* Deployment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="text-lg font-bold text-green-400">
                  {project.deploymentTransactionKeys ? project.deploymentTransactionKeys.length : '2'}
                </div>
                <div className="text-xs text-gray-400">Transactions</div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="text-lg font-bold text-blue-400">2</div>
                <div className="text-xs text-gray-400">Contracts</div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="text-lg font-bold text-purple-400">
                  {project.deployedAt ? Math.ceil((Date.now() - new Date(project.deployedAt).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'}
                </div>
                <div className="text-xs text-gray-400">Days Live</div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="text-lg font-bold text-yellow-400">Active</div>
                <div className="text-xs text-gray-400">Status</div>
              </div>
            </div>
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

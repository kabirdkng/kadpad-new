import { Link } from 'react-router-dom';
import { CheckCircle, Settings, ExternalLink } from 'lucide-react';
import PropTypes from 'prop-types';
import config from '../../../wallet/config';

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
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-green-300 font-mono text-sm break-all flex-1 p-2 bg-green-500/10 rounded border border-green-500/20">
                      {project.salesContractAddress}
                    </code>
                    <button
                      onClick={() => window.open(`https://tools.kadena.io/modules/explorer?module=${project.salesContractAddress}&chain=${config.chainId}&network=${config.networkId}`, '_blank')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 rounded text-green-300 hover:text-green-200 transition-colors flex-shrink-0"
                      title="View Contract on Explorer"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Handles token sales and presale logic</p>
                </div>
              )}
              
              {project.treasuryContractAddress && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <label className="block text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Treasury Contract
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-blue-300 font-mono text-sm break-all flex-1 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                      {project.treasuryContractAddress}
                    </code>
                    <button
                      onClick={() => window.open(`https://tools.kadena.io/modules/explorer?module=${project.treasuryContractAddress}&chain=${config.chainId}&network=${config.networkId}`, '_blank')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-300 hover:text-blue-200 transition-colors flex-shrink-0"
                      title="View Contract on Explorer"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Manages token treasury and distribution</p>
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
                        onClick={() => window.open(`https://explorer.kadena.io/${config.name}/transaction/${key}`, '_blank')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-300 hover:text-purple-200 transition-colors flex-shrink-0"
                        title="View on Explorer"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Click &quot;View&quot; to see transaction details on the Kadena blockchain explorer
                </p>
              </div>
            )}

            {/* Token Distribution Summary */}
            {project.tokenDistribution && (
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <label className="block text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  Token Distribution Summary
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.tokenDistribution.presalesAmount > 0 && (
                    <div className="text-center p-3 bg-orange-500/10 rounded border border-orange-500/20">
                      <div className="text-lg font-bold text-orange-400">
                        {Number(project.tokenDistribution.presalesAmount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Presale Tokens</div>
                      <div className="text-xs text-orange-300 mt-1">→ Sales Contract</div>
                    </div>
                  )}
                  {project.tokenDistribution.liquidityAmount > 0 && (
                    <div className="text-center p-3 bg-blue-500/10 rounded border border-blue-500/20">
                      <div className="text-lg font-bold text-blue-400">
                        {Number(project.tokenDistribution.liquidityAmount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Liquidity Tokens</div>
                      <div className="text-xs text-blue-300 mt-1">→ Treasury Liquidity</div>
                    </div>
                  )}
                  {project.tokenDistribution.treasuryAmount > 0 && (
                    <div className="text-center p-3 bg-green-500/10 rounded border border-green-500/20">
                      <div className="text-lg font-bold text-green-400">
                        {Number(project.tokenDistribution.treasuryAmount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Treasury Tokens</div>
                      <div className="text-xs text-green-300 mt-1">→ Treasury Account</div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Tokens have been automatically distributed to their respective contract accounts
                </p>
              </div>
            )}

            {/* Deployment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="text-lg font-bold text-green-400">
                  {project.deploymentTransactionKeys ? project.deploymentTransactionKeys.length : 'N/A'}
                </div>
                <div className="text-xs text-gray-400">Total Transactions</div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="text-lg font-bold text-blue-400">
                  {(project.salesContractAddress ? 1 : 0) + (project.treasuryContractAddress ? 1 : 0)}
                </div>
                <div className="text-xs text-gray-400">Deployed Contracts</div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="text-lg font-bold text-purple-400">
                  {project.tokenDistribution ? 
                    Object.values(project.tokenDistribution).filter(amount => amount > 0).length : 
                    'N/A'
                  }
                </div>
                <div className="text-xs text-gray-400">Token Transfers</div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="text-lg font-bold text-yellow-400">
                  {project.deployedAt ? Math.max(1, Math.ceil((Date.now() - new Date(project.deployedAt).getTime()) / (1000 * 60 * 60 * 24))) : 'N/A'}
                </div>
                <div className="text-xs text-gray-400">Days Live</div>
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
          to={`/presale/${tokenDetails.contractAddress.split('.')[0]}/${tokenDetails.contractAddress.split('.')[1]}`}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-5 h-5" />
          Go to live Presale
        </Link>
        <button
          onClick={() => {
            const tweetText = `🚀 Just launched my token on @kadpad_official! Join our presale and be part of the future. #KDA #Kadena #DeFi #TokenLaunch`;
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
    deploymentTransactionKeys: PropTypes.arrayOf(PropTypes.string),
    tokenDistribution: PropTypes.shape({
      presalesAmount: PropTypes.number,
      liquidityAmount: PropTypes.number,
      treasuryAmount: PropTypes.number
    })
  })
};

export default LaunchedState;

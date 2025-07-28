import { Link } from 'react-router-dom';
import { CheckCircle, ExternalLink } from 'lucide-react';

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
            <label className="block text-sm font-medium text-secondary mb-1">Contract Address</label>
            <p className="text-primary-text font-mono text-sm">{tokenDetails.contractAddress}</p>
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          to={`/presale/${tokenDetails.contractAddress.split('.')[0]}/${tokenDetails.contractAddress.split('.')[1]}`}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-5 h-5" />
          View Live Presale
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

export default LaunchedState;

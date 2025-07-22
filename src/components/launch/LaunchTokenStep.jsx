import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  ExternalLink, 
  BarChart3,  
  Share2, 
  Trophy, 
  CheckCircle,
  Calendar,
  Target,
  Settings
} from 'lucide-react';

const LaunchTokenStep = ({ submissionStatus, namespace, moduleName, tokenDetails }) => {
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [salesConfig, setSalesConfig] = useState({
    totalTokensToSale: '',
    tokensPerBatch: '',
    phase0Price: '',
    phase0StartDate: '',
    phase0Whitelist: [],
    phase1Price: '',
    phase1StartDate: '',
    salesEndDate: ''
  });

  if (
  submissionStatus !== 'approved' &&
  submissionStatus !== 'ready_to_launch' &&
  submissionStatus !== 'launched' &&
  submissionStatus !== 'sales_configured'
)  {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-500/20 border border-gray-500/30 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
            Configure Sales Contract
          </h2>
          <div className="card bg-yellow-500/5 border-yellow-500/20 max-w-md mx-auto">
            <p className="text-yellow-400 font-medium mb-2">Project Approval Required</p>
            <p className="text-secondary text-sm">
              You cannot configure sales details until your project is approved by our team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submissionStatus === 'sales_configured') {
    return (
      <div className="space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Trophy className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
            🎉 Congratulations!
          </h2>
          <h3 className="text-xl text-accent-primary mb-4">
            Your Token is Now Live
          </h3>
          <p className="text-secondary max-w-2xl mx-auto">
            Your token has been successfully launched on KadPad! Your presale is now active and ready for the community. 
            Monitor your progress and engage with your investors through the dashboard.
          </p>
        </div>

        {/* Main Action */}
        <div className="card text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-8 h-8 text-accent-primary" />
          </div>
          <h3 className="text-xl font-semibold text-primary-text mb-4">
            Access Your Dashboard
          </h3>
          <p className="text-secondary mb-6">
            Monitor your launch progress, manage your presale, and engage with your community.
          </p>
          <Link 
            to={`/dashboard/${namespace}/${moduleName}`} 
            className="btn btn-primary flex items-center justify-center gap-2 mx-auto"
          >
            <BarChart3 size={16} />
            Go to Dashboard
          </Link>
        </div>

        {/* Share Section */}
        <div className="card-gradient text-center">
          <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5 text-accent-primary" />
            Share Your Success
          </h3>
          <p className="text-secondary mb-6">
            Let the world know about your successful token launch!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://twitter.com/intent/tweet?text=🚀 Just launched my token on @kadpad_official! Join our presale and be part of the future. %23Kadena %23DeFi %23TokenLaunch&url=${window.location.origin}/presale/${namespace}/${moduleName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost flex items-center gap-2"
            >
              <span className="text-blue-400">🐦</span>
              Share on Twitter
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Sales Configuration Form for approved projects
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
          <Settings className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
          Configure Sales Contract
        </h2>
        <p className="text-secondary max-w-2xl mx-auto">
          Your project has been approved! Now configure your sales contract details including presale phases, 
          pricing, and timing to launch your token sale.
        </p>
      </div>

      {/* Project Status */}
      <div className="card bg-green-500/5 border-green-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-400 mb-1">Project Approved!</h4>
            <p className="text-secondary">
              Your token project has been approved and is ready for sales contract configuration.
            </p>
          </div>
        </div>
      </div>
      {/* Token Info Card */}
      {tokenDetails && (
        <div className="card bg-secondary-bg mb-4">
          <div className="flex items-center gap-4">
            {tokenDetails.imageUrl && (
              <img
                src={tokenDetails.imageUrl}
                alt={tokenDetails.name}
                className="w-16 h-16 rounded-lg object-cover border border-border-color"
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <span className="text-secondary text-xs">Name:</span>
                  <span className="ml-2 font-semibold text-primary-text">{tokenDetails.name}</span>
                </div>
                <div>
                  <span className="text-secondary text-xs">Symbol:</span>
                  <span className="ml-2 font-semibold text-primary-text">{tokenDetails.symbol}</span>
                </div>
                <div>
                  <span className="text-secondary text-xs">Supply:</span>
                  <span className="ml-2 font-semibold text-primary-text">{tokenDetails.supply?.int?.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-secondary text-xs">Contract:</span>
                <span className="ml-2 font-mono text-xs text-primary-text break-all">{tokenDetails.contractAddress}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sales Configuration Form */}
      <div className="card">
        <h3 className="text-xl font-semibold text-primary-text mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-accent-primary" />
          Sales Contract Configuration
        </h3>

        <form className="space-y-6">
          {/* Basic Sales Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Total Batches to Sale
              </label>
              <input
                type="number"
                value={salesConfig.totalTokensToSale}
                onChange={(e) => setSalesConfig({...salesConfig, totalTokensToSale: e.target.value})}
                placeholder="e.g., 1000"
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text"
                required
              />
              <p className="text-xs text-secondary mt-1">Number of batches available for sale</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Tokens per Batch
              </label>
              <input
                type="number"
                value={salesConfig.tokensPerBatch}
                onChange={(e) => setSalesConfig({...salesConfig, tokensPerBatch: e.target.value})}
                placeholder="e.g., 1000"
                className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text"
                required
              />
              <p className="text-xs text-secondary mt-1">Number of tokens in each batch</p>
            </div>
          </div>

          {/* Phase 0 (Whitelist) Configuration */}
          <div className="card bg-blue-500/5 border-blue-500/20">
            <h4 className="font-semibold text-primary-text mb-4 flex items-center gap-2">
              <span className="text-blue-400">📋</span>
              Phase 0 - Whitelist Presale
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Phase 0 Price (KDA per batch)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salesConfig.phase0Price}
                  onChange={(e) => setSalesConfig({...salesConfig, phase0Price: e.target.value})}
                  placeholder="e.g., 5.00"
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Phase 0 Start Date
                </label>
                <input
                  type="datetime-local"
                  value={salesConfig.phase0StartDate}
                  onChange={(e) => setSalesConfig({...salesConfig, phase0StartDate: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text"
                  required
                />
                <p className="text-xs text-secondary mt-1">Must be at least 2 weeks from now</p>
              </div>
            </div>
          </div>

          {/* Phase 1 (Public) Configuration */}
          <div className="card bg-green-500/5 border-green-500/20">
            <h4 className="font-semibold text-primary-text mb-4 flex items-center gap-2">
              <span className="text-green-400">🌍</span>
              Phase 1 - Public Sale
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Phase 1 Price (KDA per batch)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salesConfig.phase1Price}
                  onChange={(e) => setSalesConfig({...salesConfig, phase1Price: e.target.value})}
                  placeholder="e.g., 10.00"
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Phase 1 Start Date
                </label>
                <input
                  type="datetime-local"
                  value={salesConfig.phase1StartDate}
                  onChange={(e) => setSalesConfig({...salesConfig, phase1StartDate: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Sales End Date
                </label>
                <input
                  type="datetime-local"
                  value={salesConfig.salesEndDate}
                  onChange={(e) => setSalesConfig({...salesConfig, salesEndDate: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary-bg border border-border-color rounded-xl text-primary-text"
                  required
                />
              </div>
            </div>
          </div>

          {/* Requirements Note */}
          <div className="card border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 text-xl">⚠️</div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">Important Requirements</h4>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Phase 0 start date must be at least 2 weeks from today</li>
                  <li>• Phase 1 price should be higher than Phase 0 price</li>
                  <li>• You'll need to deploy a sales contract with these parameters</li>
                  <li>• All dates and prices are final once submitted</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="btn btn-ghost flex items-center gap-2"
            >
              <Calendar size={16} />
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
            >
              <Rocket size={16} />
              Deploy Sales Contract
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="card border-blue-500/20 bg-blue-500/5">
        <h4 className="font-semibold text-primary-text mb-3 flex items-center gap-2">
          <span className="text-blue-400">💡</span>
          Need Help?
        </h4>
        <p className="text-secondary mb-4">
          Configuring your sales contract is an important step. If you need assistance with 
          pricing strategy or timeline planning, our team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://docs.kadpad.xyz/sales-configuration"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost flex items-center gap-2"
          >
            📖 Sales Guide
            <ExternalLink size={14} />
          </a>
          <a
            href="https://discord.gg/Me8k8wsd"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost flex items-center gap-2"
          >
            💬 Get Support
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LaunchTokenStep;
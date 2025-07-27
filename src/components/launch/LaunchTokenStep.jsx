import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  ExternalLink,
  Calendar,
  Target,
  Settings,
  AlertCircle,
  DollarSign,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { checkProjectByContract, markProjectAsDeployed } from '../../api';
import { toast } from 'react-toastify';

const LaunchTokenStep = ({ submissionStatus, tokenDetails }) => {
  const [salesConfig, setSalesConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [tokenDetails]);

  const fetchProjectDetails = async () => {
    if (tokenDetails && tokenDetails.contractAddress) {
      try {
        const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
        const response = await checkProjectByContract(namespace, moduleName);
        const projectData = response.data.data.project;
        setProject(projectData);
        
        // Set sales config if available
        if (projectData.salesDetails && projectData.salesDetails.totalTokensToSale) {
          setSalesConfig(projectData.salesDetails);
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    }
    setLoading(false);
  };

  // Helper functions for formatting
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Not set';
    
    try {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) {
        return 'Invalid price';
      }
      
      return `${numPrice.toFixed(6)} KDA`;
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'Invalid price';
    }
  };

  // Show different content based on project status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!project || !['sales_configured', 'launched'].includes(project.status)) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-500/20 border border-gray-500/30 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
            Sales Configuration Pending
          </h2>
          <div className="card bg-yellow-500/5 border-yellow-500/20 max-w-md mx-auto">
            <p className="text-yellow-400 font-medium mb-2">Waiting for Configuration</p>
            <p className="text-secondary text-sm">
              The admin team needs to configure your sales parameters first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (project.status === 'sales_configured' && project.salesDetails) {
    const salesDetails = project.salesDetails;
    
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
            Ready to Deploy Sales Contract
          </h2>
          <p className="text-secondary max-w-2xl mx-auto">
            Your sales parameters have been configured by our team. Review the details and deploy your sales contract.
          </p>
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

        {/* Sales Configuration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="font-semibold text-blue-400">Total Batches</h4>
            </div>
            <p className="text-2xl font-bold text-primary-text">
              {salesDetails.totalBatches ? salesDetails.totalBatches.toLocaleString() : 'Not set'}
            </p>
            <p className="text-sm text-secondary mt-1">Batches for sale</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="font-semibold text-purple-400">Batch Size</h4>
            </div>
            <p className="text-2xl font-bold text-primary-text">
              {(salesDetails.amountPerBatch || salesDetails.tokensPerBatch) ? (salesDetails.amountPerBatch || salesDetails.tokensPerBatch).toLocaleString() : 'Not set'}
            </p>
            <p className="text-sm text-secondary mt-1">Tokens per batch</p>
          </div>

          <div className="card bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-400" />
              </div>
              <h4 className="font-semibold text-green-400">Pre-sales</h4>
            </div>
            <p className="text-2xl font-bold text-primary-text">
              {(salesDetails.presalesAmount || ((salesDetails.totalBatches || 0) * (salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0))).toLocaleString()}
            </p>
            <p className="text-sm text-secondary mt-1">Total tokens</p>
          </div>

          <div className="card bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-emerald-400">Starting Price</h4>
            </div>
            <p className="text-2xl font-bold text-primary-text">
              {formatPrice(salesDetails.phase0Price || salesDetails.phase0price)}
            </p>
            <p className="text-sm text-secondary mt-1">Phase 0 price</p>
          </div>
        </div>

        {/* Detailed Sales Configuration */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-blue-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-text">Sales Configuration Details</h3>
              <p className="text-sm text-secondary">Complete breakdown of your token sale parameters</p>
            </div>
          </div>
          
          {/* Batch Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Batch Configuration
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Total Batches</label>
                  <p className="text-xl font-bold text-primary-text">
                    {(salesDetails.totalBatches || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Tokens per Batch</label>
                  <p className="text-xl font-bold text-primary-text">
                    {(salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Whitelist Limit</label>
                  <p className="text-lg font-bold text-accent-primary">
                    {salesDetails.whitelistLimit || 'Not set'} batches per user
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Token Distribution
              </h4>
              
              {/* Visual Distribution Bar */}
              {project?.tokendetails?.totalSupply && (
                <div className="mb-6">
                  <div className="h-8 bg-secondary-bg border border-border-color rounded-lg overflow-hidden flex">
                    <div 
                      className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                      style={{ width: `${((salesDetails.presalesAmount || ((salesDetails.totalBatches || 0) * (salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0))) / project.tokendetails.totalSupply) * 100}%` }}
                      title={`Pre-sales: ${(((salesDetails.presalesAmount || ((salesDetails.totalBatches || 0) * (salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0))) / project.tokendetails.totalSupply) * 100).toFixed(2)}%`}
                    >
                      {(((salesDetails.presalesAmount || ((salesDetails.totalBatches || 0) * (salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0))) / project.tokendetails.totalSupply) * 100) > 12 && 'Sales'}
                    </div>
                    <div 
                      className="bg-purple-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                      style={{ width: `${((salesDetails.liquidityLockupAmount || 0) / project.tokendetails.totalSupply) * 100}%` }}
                      title={`Liquidity: ${(((salesDetails.liquidityLockupAmount || 0) / project.tokendetails.totalSupply) * 100).toFixed(2)}%`}
                    >
                      {(((salesDetails.liquidityLockupAmount || 0) / project.tokendetails.totalSupply) * 100) > 8 && 'Liquidity'}
                    </div>
                    <div 
                      className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                      style={{ width: `${((salesDetails.treasuryAmount || 0) / project.tokendetails.totalSupply) * 100}%` }}
                      title={`Treasury: ${(((salesDetails.treasuryAmount || 0) / project.tokendetails.totalSupply) * 100).toFixed(2)}%`}
                    >
                      {(((salesDetails.treasuryAmount || 0) / project.tokendetails.totalSupply) * 100) > 15 && 'Treasury'}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Pre-sales Amount</label>
                  <p className="text-xl font-bold text-primary-text">
                    {(salesDetails.presalesAmount || ((salesDetails.totalBatches || 0) * (salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0))).toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    {project?.tokendetails?.totalSupply ? 
                      (((salesDetails.presalesAmount || ((salesDetails.totalBatches || 0) * (salesDetails.amountPerBatch || salesDetails.tokensPerBatch || 0))) / project.tokendetails.totalSupply) * 100).toFixed(2) + '%' 
                      : '0%'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Liquidity Amount</label>
                  <p className="text-xl font-bold text-primary-text">
                    {(salesDetails.liquidityLockupAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">
                    {project?.tokendetails?.totalSupply ? 
                      (((salesDetails.liquidityLockupAmount || 0) / project.tokendetails.totalSupply) * 100).toFixed(2) + '%' 
                      : '0%'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Treasury Amount</label>
                  <p className="text-xl font-bold text-green-400">
                    {(salesDetails.treasuryAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-300 mt-1">
                    {project?.tokendetails?.totalSupply ? 
                      (((salesDetails.treasuryAmount || 0) / project.tokendetails.totalSupply) * 100).toFixed(2) + '%' 
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Phase Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Phase 0 (Early Access) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">0</span>
                </div>
                <h4 className="text-lg font-semibold text-primary-text">Phase 0 - Whitelist</h4>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-lg p-4">
                  <label className="block text-sm font-medium text-orange-400 mb-2">Price per Batch</label>
                  <p className="text-xl font-bold text-primary-text">
                    {formatPrice(salesDetails.phase0Price || salesDetails.phase0price)}
                  </p>
                </div>
                
                <div className="bg-secondary-bg border border-border-color rounded-lg p-4">
                  <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <p className="text-primary-text font-medium">
                    {formatDateTime(salesDetails.phase0StartDate || salesDetails.phase0startDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 1 (Public Sale) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h4 className="text-lg font-semibold text-primary-text">Phase 1 - Public Sale</h4>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-lg p-4">
                  <label className="block text-sm font-medium text-blue-400 mb-2">Price per Batch</label>
                  <p className="text-xl font-bold text-primary-text">
                    {formatPrice(salesDetails.phase1Price)}
                  </p>
                </div>
                
                <div className="bg-secondary-bg border border-border-color rounded-lg p-4">
                  <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <p className="text-primary-text font-medium">
                    {formatDateTime(salesDetails.phase1StartDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sale End Date - Full Width */}
          <div className="mt-8 pt-6 border-t border-border-color">
            <div className="bg-gradient-to-r from-red-500/5 to-pink-500/5 border border-red-500/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-red-400">Sale End Date</h4>
              </div>
              <p className="text-xl font-bold text-primary-text">
                {formatDateTime(salesDetails.salesEndDate)}
              </p>
              <p className="text-sm text-secondary mt-1">
                Sale will automatically end at this date and time
              </p>
            </div>
          </div>
        </div>

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
            onClick={async () => {
              try {
                setIsDeploying(true);
                const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
                
                await markProjectAsDeployed(namespace, moduleName);
                
                toast.success('🎉 Project successfully deployed and launched!');
                await fetchProjectDetails();
              } catch (error) {
                console.error('Error marking project as deployed:', error);
                toast.error('Failed to mark project as deployed. Please try again.');
              } finally {
                setIsDeploying(false);
              }
            }}
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
                After deployment, you'll have access to advanced management features including whitelist configuration, 
                real-time sales monitoring, participant management, and the ability to adjust certain parameters 
                through our admin interface.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (project.status === 'launched') {
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
  }

  return null;
};

export default LaunchTokenStep;
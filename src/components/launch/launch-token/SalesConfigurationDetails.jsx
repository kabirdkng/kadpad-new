import { DollarSign, Target, Sparkles, Calendar, AlertCircle } from 'lucide-react';
import { formatDateTime, formatPrice } from './formatUtils';

const SalesConfigurationDetails = ({ salesDetails, project }) => {
  return (
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
                {salesDetails.amountPerBatch}
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
  );
};

export default SalesConfigurationDetails;

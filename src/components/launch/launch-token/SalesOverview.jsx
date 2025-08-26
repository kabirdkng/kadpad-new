import { Target, Users, Sparkles, DollarSign } from 'lucide-react';
import { formatPrice } from './formatUtils';

const SalesOverview = ({ salesDetails }) => {
  return (
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
          {salesDetails.amountPerBatch}
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
  );
};

export default SalesOverview;

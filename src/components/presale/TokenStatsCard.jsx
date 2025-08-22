import PropTypes from 'prop-types';
import { TrendingUp, DollarSign, Users, Shield, Database, Link, Layers } from 'lucide-react';
import { addComma } from '../../utils/numberUtils';

const TokenStatsCard = ({ 
  currentPrice, 
  totalSales, 
  amountPerBatch, 
  availableBatches, 
  totalSupply, 
  tokenSymbol, 
  contractNamespace, 
  namespace, 
  moduleName, 
  supplyChain,
  safeRender 
}) => {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-primary-text mb-6">Token Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 text-accent-primary mx-auto mb-2" />
          <p className="text-sm text-secondary">Current Price</p>
          <p className="text-lg font-semibold text-primary-text">
            {currentPrice ? `${safeRender(currentPrice)} KDA` : 'Loading...'}
          </p>
        </div>
        <div className="text-center">
          <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-secondary">Total Batches Sold</p>
          <p className="text-lg font-semibold text-primary-text">
            {totalSales ? `${addComma(safeRender(totalSales))}` : 'Loading...'}
          </p>
        </div>
        <div className="text-center">
          <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-secondary">Tokens per Batch</p>
          <p className="text-lg font-semibold text-primary-text">
            {amountPerBatch ? addComma(safeRender(amountPerBatch)) : 'Loading...'}
          </p>
        </div>
        <div className="text-center">
          <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-sm text-secondary">Available Batches</p>
          <p className="text-lg font-semibold text-primary-text">
            {availableBatches !== null ? safeRender(availableBatches) : 'Loading...'}
          </p>
        </div>
      </div>
      
      {/* Additional Token Information */}
      <div className="mt-8 pt-6 border-t border-border-color">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Database className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm text-secondary">Total Supply</p>
            <p className="text-lg font-semibold text-primary-text">
              {totalSupply ? `${addComma(safeRender(totalSupply))} ${tokenSymbol}` : 'Loading...'}
            </p>
          </div>
          <div className="text-center">
            <Link className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-sm text-secondary">Contract Address</p>
            <p className="text-sm font-mono text-primary-text break-all">
              {contractNamespace || namespace}.{moduleName}
            </p>
          </div>
          <div className="text-center">
            <Layers className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <p className="text-sm text-secondary">Supply Chain</p>
            <p className="text-lg font-semibold text-primary-text">
              Chain {supplyChain}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

TokenStatsCard.propTypes = {
  currentPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  totalSales: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  amountPerBatch: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  availableBatches: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  totalSupply: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  tokenSymbol: PropTypes.string.isRequired,
  contractNamespace: PropTypes.string,
  namespace: PropTypes.string.isRequired,
  moduleName: PropTypes.string.isRequired,
  supplyChain: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  safeRender: PropTypes.func.isRequired,
};

export default TokenStatsCard;

import React from 'react';
import { Eye } from 'lucide-react';

const TokenDetailsPreview = ({ tokenDetails }) => {
  if (!tokenDetails) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-accent-primary" />
        Token Details Preview
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Token Name</label>
            <p className="text-primary-text font-medium">{tokenDetails.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Token Symbol</label>
            <p className="text-primary-text font-medium">${tokenDetails.symbol}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Total Supply</label>
            <p className="text-primary-text font-medium">{tokenDetails.supply?.int?.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Contract Address</label>
            <p className="text-primary-text font-mono text-sm break-all">{tokenDetails.contractAddress}</p>
          </div>
          {tokenDetails.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Token Image</label>
              <img 
                src={tokenDetails.imageUrl} 
                alt={tokenDetails.name}
                className="w-16 h-16 rounded-lg object-cover border border-border-color"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDetailsPreview;

import PropTypes from 'prop-types';
import { Info } from 'lucide-react';
import { addComma } from '../../utils/numberUtils';
import WalletConnectButton from '../WalletConnectButton';

const PurchaseCard = ({ 
  isPhase0, 
  isPhase1, 
  isSaleEnded, 
  tokenSymbol, 
  balance, 
  account, 
  batchCount, 
  setBatchCount,
  availableBatches,
  kdaInput,
  amountPerBatch,
  handleBuy,
  isLoading,
  isWhitelisted,
  userBoughtBatches,
  safeRender 
}) => {
  if ((!isPhase0 && !isPhase1) || isSaleEnded) {
    return null;
  }

  return (
    <div className="card border-2 border-accent-primary/30 bg-accent-primary/5">
      <h3 className="text-2xl font-bold text-accent-primary mb-6 text-center">Purchase Tokens</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Your KDA Balance
          </label>
          <p className="text-lg font-semibold text-primary-text">
            {balance ? `${addComma(safeRender(balance))} KDA` : !account ? 'Connect Wallet' : 'Loading...'}
          </p>
        </div>

        {/* Enhanced Batch Input */}
        <div className="p-4 bg-accent-primary/10 border-2 border-accent-primary/40 rounded-lg">
          <label className="block text-lg font-bold text-accent-primary mb-3 text-center">
            Batches to Buy
          </label>
          <input
            type="number"
            min="1"
            max={safeRender(availableBatches)}
            value={batchCount || ''}
            onChange={(e) => {
              const value = e.target.value;
              
              if (value === '') {
                setBatchCount(0);
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue >= 0) {
                  setBatchCount(numValue);
                }
              }
            }}
            className="w-full px-4 py-3 text-xl font-bold text-center bg-white/10 border-2 border-accent-primary/50 rounded-lg text-primary-text focus:outline-none focus:border-accent-primary"
            placeholder="Number of batches"
          />
          <p className="text-sm text-secondary text-center mt-2">
            Available: <span className="text-accent-primary font-semibold">{safeRender(availableBatches)} batches</span>
          </p>
        </div>

        <div className="p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-secondary">Total Cost:</span>
            <span className="text-primary-text font-semibold">
              {addComma(safeRender(kdaInput))} KDA
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary">You&apos;ll receive:</span>
            <span className="text-accent-primary font-semibold">
              {addComma(safeRender(amountPerBatch) * batchCount)} {tokenSymbol}
            </span>
          </div>
        </div>

        {!account ? (
          <div className="w-full">
            <WalletConnectButton />
          </div>
        ) : (
          <button
            onClick={() => handleBuy()}
            disabled={isLoading || availableBatches <= 0 || !batchCount || batchCount <= 0}
            className="w-full btn btn-primary"
          >
            {isLoading ? 'Processing...' : `Buy ${tokenSymbol} Tokens`}
          </button>
        )}

        {/* Whitelist status messages */}
        {isPhase0 && (
          <>
            {/* User has bought all their whitelist allocation */}
            {!isWhitelisted && safeRender(userBoughtBatches) > 0 && safeRender(availableBatches) <= 0 && (
              <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Info className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-400 font-semibold mb-1">
                    ✅ Whitelist Allocation Complete!
                  </p>
                  <p className="text-sm text-green-400/80">
                    You have bought all your whitelisted tokens. You can now participate in Phase 1 public sale.
                  </p>
                </div>
              </div>
            )}
            
            {/* User is not whitelisted and hasn't bought any tokens */}
            {!isWhitelisted && safeRender(userBoughtBatches) === 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-400">
                  You&apos;re not whitelisted for Phase 0. Wait for Phase 1 public sale.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

PurchaseCard.propTypes = {
  isPhase0: PropTypes.bool.isRequired,
  isPhase1: PropTypes.bool.isRequired,
  isSaleEnded: PropTypes.bool.isRequired,
  tokenSymbol: PropTypes.string.isRequired,
  balance: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  account: PropTypes.string,
  batchCount: PropTypes.number,
  setBatchCount: PropTypes.func.isRequired,
  availableBatches: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  kdaInput: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  amountPerBatch: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  handleBuy: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isWhitelisted: PropTypes.bool,
  userBoughtBatches: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  safeRender: PropTypes.func.isRequired,
};

export default PurchaseCard;

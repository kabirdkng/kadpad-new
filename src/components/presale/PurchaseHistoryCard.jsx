import PropTypes from 'prop-types';
import { History, Info } from 'lucide-react';
import { addComma } from '../../utils/numberUtils';

const PurchaseHistoryCard = ({ 
  account, 
  userBoughtBatches, 
  userBoughtTokens, 
  tokenSymbol, 
  isPhase0, 
  isPhase1, 
  isSaleEnded, 
  safeRender 
}) => {
  if (!account) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <History className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-primary-text">Your Purchases</h3>
      </div>
      
      {userBoughtBatches > 0 ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-secondary mb-1">Batches Bought</p>
                <p className="text-xl font-bold text-blue-400">
                  {addComma(safeRender(userBoughtBatches))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-secondary mb-1">Tokens Purchased</p>
                <p className="text-xl font-bold text-primary-text">
                  {addComma(safeRender(userBoughtTokens))} {tokenSymbol}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Info className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-400">
              Tokens will be distributed after presale ends.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
          <p className="text-secondary mb-2">No purchases yet</p>
          <p className="text-sm text-secondary">
            {(isPhase0 || isPhase1) && !isSaleEnded 
              ? 'Purchase tokens to see history here.'
              : 'Presale not currently active.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

PurchaseHistoryCard.propTypes = {
  account: PropTypes.string,
  userBoughtBatches: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  userBoughtTokens: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  tokenSymbol: PropTypes.string.isRequired,
  isPhase0: PropTypes.bool.isRequired,
  isPhase1: PropTypes.bool.isRequired,
  isSaleEnded: PropTypes.bool.isRequired,
  safeRender: PropTypes.func.isRequired,
};

export default PurchaseHistoryCard;

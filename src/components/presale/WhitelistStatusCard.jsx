import PropTypes from 'prop-types';
import { Shield } from 'lucide-react';

const WhitelistStatusCard = ({ isWhitelisted, userBoughtBatches, availableBatches, safeRender, isPhase0 }) => {

  // Check if user has bought all their whitelist allocation
  const hasCompletedWhitelistAllocation = safeRender(userBoughtBatches) > 0 && safeRender(availableBatches) <= 0 && isPhase0;
  
  
  // Determine the display state
  let statusColor, statusText, statusDescription;
  
  if (hasCompletedWhitelistAllocation) {
    statusColor = 'bg-green-500/10 border-green-500/20';
    statusText = 'text-green-400';
    statusDescription = '✅ Whitelist Allocation Complete!';
  } else if (isWhitelisted) {
    statusColor = 'bg-green-500/10 border-green-500/20';
    statusText = 'text-green-400';
    statusDescription = '✅ You are whitelisted!';
  } else {
    statusColor = 'bg-yellow-500/10 border-yellow-500/20';
    statusText = 'text-yellow-400';
    statusDescription = '⏳ Not whitelisted';
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-primary-text">Whitelist Status</h3>
      </div>
      <div className={`p-4 rounded-lg border ${statusColor}`}>
        <p className={`font-semibold ${statusText}`}>
          {statusDescription}
        </p>
        <p className="text-sm text-secondary mt-1">
          {hasCompletedWhitelistAllocation 
            ? 'You have bought all your whitelisted tokens. You can now participate in Phase 1 public sale.'
            : isWhitelisted 
              ? 'You can participate in the Phase 0 presale at the discounted price.'
              : 'You can participate in Phase 1 public sale.'
          }
        </p>
        
        {/* Show additional info if user has bought some tokens */}
        {safeRender(userBoughtBatches) > 0 && (
          <div className="mt-3 pt-3 border-t border-border-color">
            <p className="text-sm text-secondary">
              <span className="text-primary-text font-medium">
                Whitelist batches purchased: {safeRender(userBoughtBatches)}
              </span>
            </p>
            {safeRender(availableBatches) > 0 && (
              <p className="text-sm text-secondary">
                <span className="text-primary-text font-medium">
                  Remaining allocation: {safeRender(availableBatches)} batches
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

WhitelistStatusCard.propTypes = {
  isWhitelisted: PropTypes.bool.isRequired,
  userBoughtBatches: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  availableBatches: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  safeRender: PropTypes.func.isRequired,
  isPhase0: PropTypes.bool.isRequired,
};

export default WhitelistStatusCard;

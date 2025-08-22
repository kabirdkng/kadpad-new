import PropTypes from 'prop-types';
import { Shield } from 'lucide-react';

const WhitelistStatusCard = ({ isWhitelisted }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-primary-text">Whitelist Status</h3>
      </div>
      <div className={`p-4 rounded-lg border ${
        isWhitelisted 
          ? 'bg-green-500/10 border-green-500/20' 
          : 'bg-yellow-500/10 border-yellow-500/20'
      }`}>
        <p className={`font-semibold ${
          isWhitelisted ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {isWhitelisted ? '✅ You are whitelisted!' : '⏳ Not whitelisted'}
        </p>
        <p className="text-sm text-secondary mt-1">
          {isWhitelisted 
            ? 'You can participate in the Phase 0 presale at the discounted price.'
            : 'You can participate in Phase 1 public sale.'
          }
        </p>
      </div>
    </div>
  );
};

WhitelistStatusCard.propTypes = {
  isWhitelisted: PropTypes.bool.isRequired,
};

export default WhitelistStatusCard;

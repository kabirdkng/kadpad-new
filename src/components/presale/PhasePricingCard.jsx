import PropTypes from 'prop-types';

const PhasePricingCard = ({ p0Price, p1Price, safeRender }) => {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-primary-text mb-6">Phase Pricing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2">Phase 0 (Whitelist)</h4>
          <p className="text-2xl font-bold text-primary-text">
            {p0Price ? `${safeRender(p0Price)} KDA` : 'Loading...'}
          </p>
          <p className="text-sm text-secondary">per batch</p>
        </div>
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h4 className="font-semibold text-green-400 mb-2">Phase 1 (Public)</h4>
          <p className="text-2xl font-bold text-primary-text">
            {p1Price ? `${safeRender(p1Price)} KDA` : 'Loading...'}
          </p>
          <p className="text-sm text-secondary">per batch</p>
        </div>
      </div>
    </div>
  );
};

PhasePricingCard.propTypes = {
  p0Price: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  p1Price: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  safeRender: PropTypes.func.isRequired,
};

export default PhasePricingCard;

import PropTypes from 'prop-types';
import SalesProgressBar from '../SalesProgressBar';

const SalesProgressCard = ({ amountPerBatch, totalBatches, totalSales }) => {
  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-primary-text mb-6">Sales Progress</h3>
      
      {/* Tokens Progress */}
      {amountPerBatch && totalBatches > 0 && (
        <SalesProgressBar 
          soldTokens={(totalSales || 0) * amountPerBatch}
          totalTokens={totalBatches * amountPerBatch}
          size="large"
          title="Tokens Sold"
        />
      )}
      
      {/* Fallback message if no data */}
      {(!totalBatches || totalBatches <= 0 || !amountPerBatch) && (
        <div className="text-center py-8">
          <p className="text-secondary">Sales progress data will appear here once the presale begins.</p>
        </div>
      )}
    </div>
  );
};

SalesProgressCard.propTypes = {
  amountPerBatch: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  totalBatches: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  totalSales: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
};

export default SalesProgressCard;

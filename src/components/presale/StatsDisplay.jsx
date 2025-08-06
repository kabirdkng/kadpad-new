import PropTypes from 'prop-types';
import { addComma } from '../../utils/numberUtils';
import { safeRender } from '../../utils/valueUtils';

const StatsDisplay = ({ totalBatches, availableToWhitelist, counters }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <p className="text-sm text-secondary">Total to Sale</p>
        <p className="text-lg font-semibold text-primary-text">{addComma(safeRender(totalBatches))} Batches</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-secondary">Available</p>
        <p className="text-lg font-semibold text-primary-text">{addComma(safeRender(availableToWhitelist))} Batches</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-secondary">Reserved</p>
        <p className="text-lg font-semibold text-accent-primary">{addComma(safeRender(counters.reserved))} Batches</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-secondary">Sold</p>
        <p className="text-lg font-semibold text-green-400">{addComma(safeRender(counters.sold))} Batches</p>
      </div>
    </div>
  );
};

StatsDisplay.propTypes = {
  totalBatches: PropTypes.number.isRequired,
  availableToWhitelist: PropTypes.number.isRequired,
  counters: PropTypes.shape({
    sold: PropTypes.number,
    reserved: PropTypes.number
  }).isRequired
};

export default StatsDisplay;

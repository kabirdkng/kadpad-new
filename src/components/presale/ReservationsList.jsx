import PropTypes from 'prop-types';
import { RefreshCw } from 'lucide-react';
import { safeRender } from '../../utils/valueUtils';

const ReservationsList = ({ reservations, onBack, onRefresh }) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-accent-primary hover:text-accent-primary/80 transition-colors"
      >
        ← Back to options
      </button>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-text">Reservation List</h3>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-hover-bg rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {reservations.map((account, index) => (
          <div key={index} className="p-4 bg-secondary-bg border border-border-color rounded-lg">
            <div className="break-all text-sm mb-2">{index + 1}. {account.account}</div>
            <div className="flex gap-4 text-sm">
              <span className="text-accent-primary">
                Reserved: {safeRender(account.reserved) - safeRender(account.bought)} Batches
              </span>
              <span className="text-green-400">
                Bought: {safeRender(account.bought)} Batches
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ReservationsList.propTypes = {
  reservations: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired
};

export default ReservationsList;

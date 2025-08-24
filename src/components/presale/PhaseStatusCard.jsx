import PropTypes from 'prop-types';
import { Clock } from 'lucide-react';

const PhaseStatusCard = ({ phaseInfo, countdown, isSaleEnded, getCountdownLabel }) => {
  return (
    <div className="card mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            phaseInfo.color === 'green' ? 'bg-green-500/20 border border-green-500/30' :
            phaseInfo.color === 'blue' ? 'bg-blue-500/20 border border-blue-500/30' :
            phaseInfo.color === 'yellow' ? 'bg-yellow-500/20 border border-yellow-500/30' :
            phaseInfo.color === 'red' ? 'bg-red-500/20 border border-red-500/30' :
            'bg-gray-500/20 border border-gray-500/30'
          }`}>
            <Clock className={`w-6 h-6 ${
              phaseInfo.color === 'green' ? 'text-green-400' :
              phaseInfo.color === 'blue' ? 'text-blue-400' :
              phaseInfo.color === 'yellow' ? 'text-yellow-400' :
              phaseInfo.color === 'red' ? 'text-red-400' :
              'text-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-primary-text">{phaseInfo.phase}</h3>
            <p className="text-secondary">{phaseInfo.description}</p>
          </div>
        </div>
        
        {!isSaleEnded && (
          <div className="text-center">
            <p className="text-sm text-secondary mb-2">{getCountdownLabel()}</p>
            <div className="flex gap-2 text-lg font-mono">
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                {countdown.days}d
              </span>
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                {countdown.hours}h
              </span>
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                {countdown.minutes}m
              </span>
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary">
                {countdown.seconds}s
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PhaseStatusCard.propTypes = {
  phaseInfo: PropTypes.shape({
    phase: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  countdown: PropTypes.shape({
    days: PropTypes.number.isRequired,
    hours: PropTypes.number.isRequired,
    minutes: PropTypes.number.isRequired,
    seconds: PropTypes.number.isRequired,
  }).isRequired,
  isSaleEnded: PropTypes.bool.isRequired,
  getCountdownLabel: PropTypes.func.isRequired,
};

export default PhaseStatusCard;

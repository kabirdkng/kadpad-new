import PropTypes from 'prop-types';

const StatsOverview = ({ projects, ongoingSales, upcomingSales }) => {
  return (
    <div className="grid grid-cols-3 gap-4 lg:gap-6 mb-12 lg:mb-16">
      <div className="card text-center">
        <div className="text-xl lg:text-2xl font-bold text-accent-primary mb-1">{projects.length}</div>
        <div className="text-sm text-secondary">Total Projects</div>
      </div>
      <div className="card text-center">
        <div className="text-xl lg:text-2xl font-bold text-accent-primary mb-1">{ongoingSales.length}</div>
        <div className="text-sm text-secondary">Live Sales</div>
      </div>
      <div className="card text-center">
        <div className="text-xl lg:text-2xl font-bold text-accent-primary mb-1">{upcomingSales.length}</div>
        <div className="text-sm text-secondary">Upcoming</div>
      </div>
    </div>
  );
};

StatsOverview.propTypes = {
  projects: PropTypes.array.isRequired,
  ongoingSales: PropTypes.array.isRequired,
  upcomingSales: PropTypes.array.isRequired
};

export default StatsOverview;

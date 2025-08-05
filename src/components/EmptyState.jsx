import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { TrendingUp, Search } from 'lucide-react';

const EmptyState = ({ 
  projects, 
  sortedProjects, 
  searchTerm, 
  setSearchTerm, 
  setFilterStatus, 
  setSortBy 
}) => {
  // Empty State for no projects
  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="card max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-secondary-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={40} className="text-accent-primary" />
          </div>
          <h3 className="text-xl font-semibold text-primary-text mb-2">No Projects Yet</h3>
          <p className="text-secondary mb-8">Be the first to launch your project on KadPad!</p>
          <Link to="/launch" className="btn btn-primary">
            Launch Your Project
          </Link>
        </div>
      </div>
    );
  }

  // No search results
  if (projects.length > 0 && sortedProjects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="card max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-secondary-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-primary-text mb-2">No Results Found</h3>
          <p className="text-secondary mb-8">Try adjusting your search terms or filters</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setSortBy('newest');
            }}
            className="btn btn-primary"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  return null;
};

EmptyState.propTypes = {
  projects: PropTypes.array.isRequired,
  sortedProjects: PropTypes.array.isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  setFilterStatus: PropTypes.func.isRequired,
  setSortBy: PropTypes.func.isRequired
};

export default EmptyState;

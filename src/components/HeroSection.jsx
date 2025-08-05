import PropTypes from 'prop-types';
import { TrendingUp } from 'lucide-react';
import SearchAndFilter from './SearchAndFilter';

const HeroSection = ({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy, 
  filterStatus, 
  setFilterStatus, 
  showFilters, 
  setShowFilters,
  sortedProjects 
}) => {
  return (
    <div className="text-center mb-12 lg:mb-16">
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-card border border-accent-primary/20 mb-6">
        <TrendingUp className="w-4 h-4 text-accent-primary mr-2" />
        <span className="text-sm font-medium text-accent-primary">
          Discover Next-Gen Projects
        </span>
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-text mb-6">
        Explore <span className="text-gradient">Token Sales</span>
      </h1>
      <p className="text-lg lg:text-xl text-secondary max-w-3xl mx-auto mb-8 lg:mb-12">
        Discover and invest in the most promising token launches on Kadena. 
        Join early-stage projects and be part of the future.
      </p>

      {/* Enhanced Search and Filter Section */}
      <SearchAndFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        sortedProjects={sortedProjects}
      />
    </div>
  );
};

HeroSection.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  filterStatus: PropTypes.string.isRequired,
  setFilterStatus: PropTypes.func.isRequired,
  showFilters: PropTypes.bool.isRequired,
  setShowFilters: PropTypes.func.isRequired,
  sortedProjects: PropTypes.array.isRequired
};

export default HeroSection;

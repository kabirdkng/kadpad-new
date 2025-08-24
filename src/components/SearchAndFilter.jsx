import PropTypes from 'prop-types';
import { 
  Search, 
  Filter,
  ArrowUpDown
} from 'lucide-react';

const SearchAndFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy, 
  filterStatus, 
  setFilterStatus, 
  sortedProjects 
}) => {
  return (
    <div className="card max-w-6xl mx-auto">
      {/* Compact One-Line Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary z-10" size={18} />
          <input
            type="text"
            placeholder="Search projects, tokens, or symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-secondary-bg border border-border-color rounded-lg text-primary-text placeholder-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary-text transition-colors duration-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Compact Filter Controls */}
        <div className="flex gap-2">
          {/* Sort Dropdown */}
          <div className="relative min-w-[140px]">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-8 pr-3 py-3 bg-secondary-bg border border-border-color rounded-lg text-primary-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="ending">Ending</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[120px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={14} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-8 pr-3 py-3 bg-secondary-bg border border-border-color rounded-lg text-primary-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="live">Live</option>
              <option value="upcoming">Soon</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-xs text-secondary">
        <span>{sortedProjects.length} projects found</span>
        {searchTerm && (
          <span>Searching for &ldquo;{searchTerm}&rdquo;</span>
        )}
      </div>
    </div>
  );
};

SearchAndFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  filterStatus: PropTypes.string.isRequired,
  setFilterStatus: PropTypes.func.isRequired,
  sortedProjects: PropTypes.array.isRequired
};

export default SearchAndFilter;

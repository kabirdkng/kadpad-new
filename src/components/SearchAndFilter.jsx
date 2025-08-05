import PropTypes from 'prop-types';
import { 
  Search, 
  Filter,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

const SearchAndFilter = ({ 
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
    <div className="card max-w-6xl mx-auto">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary z-10" size={20} />
        <input
          type="text"
          placeholder="Search projects, tokens, or symbols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-secondary-bg border border-border-color rounded-xl text-primary-text placeholder-secondary text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary-text"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sort Dropdown */}
        <div className="flex-1 lg:flex-none lg:min-w-[200px]">
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={16} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-primary-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="ending">Ending Soon</option>
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex-1 lg:flex-none lg:min-w-[200px]">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary-bg border border-border-color rounded-lg text-primary-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="live">Live Sales</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
            showFilters 
              ? 'btn-primary' 
              : 'btn-ghost'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-border-color grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
              <input
                type="number"
                placeholder="Max"
                className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Token Type</label>
            <select className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary">
              <option>All Types</option>
              <option>Utility</option>
              <option>Governance</option>
              <option>DeFi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Market Cap</label>
            <select className="w-full px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-primary-text text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary">
              <option>All Sizes</option>
              <option>$1M</option>
              <option>$1M - $10M</option>
              <option> $10M</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-6 flex items-center justify-between text-sm text-secondary">
        <span>{sortedProjects.length} projects found</span>
        {searchTerm && (
          <span>Search results for &ldquo;{searchTerm}&rdquo;</span>
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
  showFilters: PropTypes.bool.isRequired,
  setShowFilters: PropTypes.func.isRequired,
  sortedProjects: PropTypes.array.isRequired
};

export default SearchAndFilter;

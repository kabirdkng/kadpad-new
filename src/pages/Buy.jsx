import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Target, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
  Flame,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { getPublicProjects } from '../api';
import { toast } from 'react-toastify';

const SaleCard = ({ sale, index }) => {
  const progressBarPercent = (sale.salesDetails.counters.sold / sale.salesDetails.totalTokensToSale) * 100;
  const isHot = progressBarPercent > 70;
  const isNew = index < 3;

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const getStatusColor = (date) => {
    const now = new Date();
    const startDate = new Date(date);
    if (startDate > now) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-lime-400 bg-lime-400/10 border-lime-400/20';
  };

  const getTimeStatus = () => {
    const now = new Date();
    const startDate = new Date(sale.salesDetails.phase0startDate);
    const endDate = new Date(sale.salesDetails.salesEndDate);
    
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Ended';
    return 'Live';
  };

  return (
    <div className={`bg-gray-800 bg-opacity-60 p-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 h-full group ${isHot ? 'border border-orange-400/30' : 'border border-gray-600/30'}`}
         style={{ animationDelay: `${index * 100}ms` }}>
      
      {/* Card Header */}
      <div className="relative mb-4">
        <div className="aspect-video w-full bg-gray-700 rounded-lg overflow-hidden">
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={sale.tokendetails.imageUrl} 
            alt={`${sale.moduleName} banner`}
            onError={(e) => {
              e.target.src = '/favicon.svg';
            }}
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {isNew && (
            <span className="px-2 py-1 bg-lime-500 text-black text-xs font-bold rounded-md flex items-center gap-1">
              <Sparkles size={10} />
              New
            </span>
          )}
          {isHot && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-md flex items-center gap-1">
              <Flame size={10} />
              Hot
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(sale.salesDetails.phase0startDate)}`}>
            {getTimeStatus()}
          </span>
        </div>
      </div>

      {/* Token Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white truncate">{sale.moduleName}</h3>
          <span className="text-lime-400 font-mono text-sm">${sale.tokendetails.SYMBOL}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={12} />
            <span className="text-xs">{new Date(sale.salesDetails.phase0startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Target size={12} />
            <span className="text-xs">{formatNumber(sale.salesDetails.totalTokensToSale)} tokens</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
          <span>{formatNumber(sale.salesDetails.counters.sold)} sold</span>
          <span>{progressBarPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              isHot ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-lime-400'
            }`}
            style={{ width: `${progressBarPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Price Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm">
          <span className="text-gray-400">Price: </span>
          <span className="text-lime-400 font-bold">{sale.salesDetails.phase0price} KDA</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Users size={12} />
          <span>{Math.floor(Math.random() * 500) + 100}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto">
        <Link 
          to={`/presale/${sale.namespace}/${sale.moduleName}`}
          className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-2 px-4 rounded transition duration-300 block text-center group flex items-center justify-center gap-2"
        >
          View Sale
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

const SaleSection = ({ title, sales, icon: Icon, gradient = false }) => {
  const [expanded, setExpanded] = useState(false);
  const displaySales = expanded ? sales : sales.slice(0, 8);

  if (sales.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${gradient ? 'bg-lime-500' : 'bg-gray-700'} border border-gray-600`}>
            <Icon size={24} className={gradient ? 'text-black' : 'text-lime-400'} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-lime-400">{title}</h2>
            <p className="text-gray-400">{sales.length} project{sales.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>
        
        {sales.length > 8 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-lime-400 hover:text-lime-500 transition duration-300 flex items-center gap-2 font-medium"
          >
            {expanded ? 'Show Less' : 'Show All'}
            <ChevronRight size={16} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {displaySales.map((sale, index) => (
          <SaleCard key={sale._id} sale={sale} index={index} />
        ))}
      </div>
    </div>
  );
};

const Buy = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getPublicProjects();
      const launchedProjects = response.data.data.projects?.filter(project => project.status === 'launched') || [];
      setProjects(launchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tokendetails.SYMBOL.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const currentDate = new Date();
    const startDate = new Date(project.salesDetails.phase0startDate);
    const endDate = new Date(project.salesDetails.salesEndDate);
    
    switch (filterStatus) {
      case 'live':
        return matchesSearch && startDate <= currentDate && endDate >= currentDate;
      case 'upcoming':
        return matchesSearch && startDate > currentDate;
      case 'ended':
        return matchesSearch && endDate < currentDate;
      default:
        return matchesSearch;
    }
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.salesDetails.phase0startDate) - new Date(a.salesDetails.phase0startDate);
      case 'popular':
        return b.salesDetails.counters.sold - a.salesDetails.counters.sold;
      case 'ending':
        return new Date(a.salesDetails.salesEndDate) - new Date(b.salesDetails.salesEndDate);
      default:
        return 0;
    }
  });

  const currentDate = new Date();
  const ongoingSales = sortedProjects.filter(sale => 
    new Date(sale.salesDetails.phase0startDate) <= currentDate && 
    new Date(sale.salesDetails.salesEndDate) >= currentDate
  );
  const upcomingSales = sortedProjects.filter(sale => new Date(sale.salesDetails.phase0startDate) > currentDate);
  const pastSales = sortedProjects.filter(sale => new Date(sale.salesDetails.salesEndDate) < currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 bg-opacity-15 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-lime-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-0 text-white py-8 lg:py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-800 bg-opacity-60 border border-lime-400/20 mb-6">
            <TrendingUp className="w-4 h-4 text-lime-400 mr-2" />
            <span className="text-sm font-medium text-lime-400">
              Discover Next-Gen Projects
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Explore <span className="text-lime-400">Token Sales</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-8 lg:mb-12">
            Discover and invest in the most promising token launches on Kadena. 
            Join early-stage projects and be part of the future.
          </p>

          {/* Enhanced Search and Filter Section */}
          <div className="bg-gray-800 bg-opacity-60 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm max-w-6xl mx-auto">
            {/* Search Bar - Full Width on All Screens */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <input
                type="text"
                placeholder="Search projects, tokens, or symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-mb md:text-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
                  <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent appearance-none cursor-pointer"
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
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent appearance-none cursor-pointer"
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
                className={`px-4 py-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-lime-500 text-black border-lime-500' 
                    : 'bg-transparent text-gray-400 border-gray-600 hover:border-lime-400 hover:text-lime-400'
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token Type</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400">
                    <option>All Types</option>
                    <option>Utility</option>
                    <option>Governance</option>
                    <option>DeFi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Market Cap</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400">
                    <option>All Sizes</option>
                    <option> $1M</option>
                    <option> $1M - $10M</option>
                    <option> $10M</option>
                  </select>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
              <span>{sortedProjects.length} projects found</span>
              {searchTerm && (
                <span>Search results for &quot;{searchTerm}&quot;</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4 lg:p-6 text-center border border-gray-600/30">
            <div className="text-xl lg:text-2xl font-bold text-lime-400 mb-1">{projects.length}</div>
            <div className="text-sm text-gray-400">Total Projects</div>
          </div>
          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4 lg:p-6 text-center border border-gray-600/30">
            <div className="text-xl lg:text-2xl font-bold text-lime-400 mb-1">{ongoingSales.length}</div>
            <div className="text-sm text-gray-400">Live Sales</div>
          </div>
          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4 lg:p-6 text-center border border-gray-600/30">
            <div className="text-xl lg:text-2xl font-bold text-lime-400 mb-1">{upcomingSales.length}</div>
            <div className="text-sm text-gray-400">Upcoming</div>
          </div>
          <div className="bg-gray-800 bg-opacity-60 rounded-lg p-4 lg:p-6 text-center border border-gray-600/30">
            <div className="text-xl lg:text-2xl font-bold text-lime-400 mb-1">0</div>
            <div className="text-sm text-gray-400">Total Raised</div>
          </div>
        </div>

        {/* Sales Sections */}
        {filterStatus === 'all' || filterStatus === 'live' ? (
          <SaleSection 
            title="🔥 Live Sales" 
            sales={ongoingSales} 
            icon={TrendingUp}
            gradient={true}
          />
        ) : null}
        
        {filterStatus === 'all' || filterStatus === 'upcoming' ? (
          <SaleSection 
            title="🚀 Upcoming Sales" 
            sales={upcomingSales} 
            icon={Clock}
          />
        ) : null}
        
        {filterStatus === 'all' || filterStatus === 'ended' ? (
          <SaleSection 
            title="📈 Past Sales" 
            sales={pastSales} 
            icon={DollarSign}
          />
        ) : null}

        {/* Show all filtered results when using specific filters */}
        {filterStatus !== 'all' && (
          <SaleSection 
            title={`${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Sales`}
            sales={sortedProjects}
            icon={Filter}
          />
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 bg-opacity-60 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={40} className="text-lime-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-400 mb-8">Be the first to launch your project on KadPad!</p>
            <Link to="/launch" className="bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 px-6 rounded-lg transition duration-300">
              Launch Your Project
            </Link>
          </div>
        )}

        {/* No search results */}
        {projects.length > 0 && sortedProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 bg-opacity-60 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
            <p className="text-gray-400 mb-8">Try adjusting your search terms or filters</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setSortBy('newest');
              }}
              className="bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buy;
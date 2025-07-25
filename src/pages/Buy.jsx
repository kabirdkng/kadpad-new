import React, { useState, useEffect } from 'react';
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
import { presales } from '../demoData/demoPresales';
import { toast } from 'react-toastify';

const SaleCard = ({ sale, index }) => {
  // Handle both demo data and real project data structures
  const tokenDetails = sale.tokendetails || sale.tokenDetails || {};
  const salesDetails = sale.salesDetails || {};
  
  // Calculate progress - handle both structures
  const totalTokens = salesDetails.totalTokensToSale || 1000000;
  const soldTokens = salesDetails.counters?.sold || Math.floor(Math.random() * totalTokens * 0.7); // Demo fallback
  const progressBarPercent = (soldTokens / totalTokens) * 100;
  
  const isHot = progressBarPercent > 70;
  const isNew = index < 3;

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toFixed(0) || '0';
  };

  const getStatusColor = (date) => {
    const now = new Date();
    const startDate = new Date(date);
    if (startDate > now) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-lime-400 bg-lime-400/10 border-lime-400/20';
  };

  const getTimeStatus = () => {
    const now = new Date();
    const startDate = new Date(salesDetails.phase0StartDate || salesDetails.phase0startDate);
    const endDate = new Date(salesDetails.salesEndDate);
    
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Ended';
    return 'Live';
  };

  // Get the correct field names
  const projectName = sale.moduleName || sale.name || 'Unknown Project';
  const tokenSymbol = tokenDetails.symbol || tokenDetails.SYMBOL || 'UNK';
  const tokenImage = tokenDetails.imageUrl || '/favicon.svg';
  const phase0Price = salesDetails.phase0Price || salesDetails.phase0price || '0.001';
  const startDate = salesDetails.phase0StartDate || salesDetails.phase0startDate;

  return (
    <div className={`card group hover:scale-105 transition-all duration-500 animate-fade-in h-full ${isHot ? 'glow border-orange-400/30' : ''}`}
         style={{ animationDelay: `${index * 100}ms` }}>
      
      {/* Card Header */}
      <div className="relative mb-6">
        <div className="aspect-video w-full bg-secondary-bg rounded-xl overflow-hidden">
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            src={tokenImage}
            alt={`${projectName} banner`}
            onError={(e) => {
              e.target.src = '/favicon.svg';
            }}
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && (
            <span className="px-3 py-1 bg-[var(--accent-primary)] text-black text-xs font-bold rounded-lg flex items-center gap-1">
              <Sparkles size={12} />
              New
            </span>
          )}
          {isHot && (
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
              <Flame size={12} />
              Hot
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(startDate)}`}>
            {getTimeStatus()}
          </span>
        </div>
      </div>

      {/* Token Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-primary-text truncate">{projectName}</h3>
          <span className="text-accent-primary font-mono text-sm font-medium">${tokenSymbol}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-secondary">
            <Calendar size={14} />
            <span className="text-xs">
              {startDate ? new Date(startDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-secondary">
            <Target size={14} />
            <span className="text-xs">{formatNumber(totalTokens)} tokens</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-secondary mb-3">
          <span>{formatNumber(soldTokens)} sold</span>
          <span>{progressBarPercent.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill transition-all duration-1000 ${
              isHot ? 'bg-gradient-to-r from-orange-500 to-red-500' : ''
            }`}
            style={{ width: `${progressBarPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Price Info */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-sm">
          <span className="text-secondary">Price: </span>
          <span className="text-accent-primary font-bold">{phase0Price} KDA</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <Users size={12} />
          <span>{Math.floor(Math.random() * 500) + 100}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto">
        <Link 
          to={`/presale/${sale.namespace}/${sale.moduleName}`}
          className="btn btn-primary w-full group flex items-center justify-center gap-2"
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
    <div className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${gradient ? 'bg-accent-primary border-accent-primary' : 'bg-card border-border-color'}`}>
            <Icon size={24} className={`text-accent-primary`} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-accent-primary">{title}</h2>
            <p className="text-secondary">{sales.length} project{sales.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>
        
        {sales.length > 8 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="btn btn-ghost flex items-center gap-2"
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
  const [useDemo, setUseDemo] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getPublicProjects();
      console.log('API Response:', response.data); // Debug log
      
      const launchedProjects = response.data.data.projects?.filter(project => project.status === 'launched') || [];
      console.log('Launched Projects:', launchedProjects); // Debug log
      
      // If no real projects, use demo data
      if (launchedProjects.length === 0) {
        setProjects(presales);
        setUseDemo(true);
        toast.info('Showing demo projects - real projects will appear here once launched!');
      } else {
        setProjects(launchedProjects);
        setUseDemo(false);
        toast.success(`Found ${launchedProjects.length} live project${launchedProjects.length !== 1 ? 's' : ''}!`);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to demo data on error
      setProjects(presales);
      setUseDemo(true);
      toast.error('Failed to load live projects - showing demo data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const projectName = project.moduleName || project.name || '';
    const tokenSymbol = project.tokendetails?.symbol || project.tokendetails?.SYMBOL || project.tokenDetails?.symbol || '';
    
    const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const currentDate = new Date();
    const startDate = new Date(project.salesDetails?.phase0StartDate || project.salesDetails?.phase0startDate);
    const endDate = new Date(project.salesDetails?.salesEndDate);
    
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
      case 'newest': {
        const aDate = new Date(a.salesDetails?.phase0StartDate || a.salesDetails?.phase0startDate || a.createdAt);
        const bDate = new Date(b.salesDetails?.phase0StartDate || b.salesDetails?.phase0startDate || b.createdAt);
        return bDate - aDate;
      }
      case 'popular': {
        const aSold = a.salesDetails?.counters?.sold || 0;
        const bSold = b.salesDetails?.counters?.sold || 0;
        return bSold - aSold;
      }
      case 'ending': {
        const aEnd = new Date(a.salesDetails?.salesEndDate);
        const bEnd = new Date(b.salesDetails?.salesEndDate);
        return aEnd - bEnd;
      }
      default:
        return 0;
    }
  });

  // Update the sales categorization
  const currentDate = new Date();
  const ongoingSales = sortedProjects.filter(sale => {
    const startDate = new Date(sale.salesDetails?.phase0StartDate || sale.salesDetails?.phase0startDate);
    const endDate = new Date(sale.salesDetails?.salesEndDate);
    return startDate <= currentDate && endDate >= currentDate;
  });

  const upcomingSales = sortedProjects.filter(sale => {
    const startDate = new Date(sale.salesDetails?.phase0StartDate || sale.salesDetails?.phase0startDate);
    return startDate > currentDate;
  });

  const pastSales = sortedProjects.filter(sale => {
    const endDate = new Date(sale.salesDetails?.salesEndDate);
    return endDate < currentDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg text-primary-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-accent-primary mx-auto mb-4"></div>
          <p className="text-secondary">Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text py-8 lg:py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-card border border-accent-primary/20 mb-6">
            <TrendingUp className="w-4 h-4 text-accent-primary mr-2" />
            <span className="text-sm font-medium text-accent-primary">
              Discover Next-Gen Projects
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-text mb-6">
            Explore <span className="text-gradient">Token Sales</span> 
            {useDemo && <span className="text-secondary text-2xl md:text-3xl lg:text-4xl"> (Demo Data)</span>}
          </h1>
          <p className="text-lg lg:text-xl text-secondary max-w-3xl mx-auto mb-8 lg:mb-12">
            Discover and invest in the most promising token launches on Kadena. 
            Join early-stage projects and be part of the future.
          </p>

          {/* Enhanced Search and Filter Section */}
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
                <span>Search results for "{searchTerm}"</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12 lg:mb-16">
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
          <div className="card text-center">
            <div className="text-xl lg:text-2xl font-bold text-accent-primary mb-1">0</div>
            <div className="text-sm text-secondary">Total Raised</div>
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
        )}

        {/* No search results */}
        {projects.length > 0 && sortedProjects.length === 0 && (
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
        )}
      </div>
    </div>
  );
};

export default Buy;
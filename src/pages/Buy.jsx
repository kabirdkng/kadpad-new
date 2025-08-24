import { useState, useEffect } from 'react';
import { 
  Clock, 
  DollarSign,
  Filter,
  Users,
  Globe
} from 'lucide-react';
import { getPublicProjects } from '../api';
import { toast } from 'react-toastify';
import { useProjectSalesData } from '../hooks/useProjectSalesData';
import HeroSection from '../components/HeroSection';
import StatsOverview from '../components/StatsOverview';
import StatsOverviewSkeleton from '../components/StatsOverviewSkeleton';
import SaleSection from '../components/SaleSection';
import SkeletonSection from '../components/SkeletonSection';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const Buy = () => {
  const [rawProjects, setRawProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  

  // Use the hook to get projects with real-time sales data
  const { projects, loading: salesDataLoading } = useProjectSalesData(rawProjects);
  
  // Show loading state while fetching either projects or sales data
  const isLoading = loading || salesDataLoading;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getPublicProjects();
      console.log('API Response:', response.data);
      
      const launchedProjects = response.data.data.projects?.filter(project => 
        project.status === 'launched' && 
        project.namespace && 
        project.moduleName
      ) || [];
      
      console.log('Launched Projects:', launchedProjects);
      
      setRawProjects(launchedProjects);
      
      if (launchedProjects.length === 0) {
        toast.info('No live projects available yet. Projects will appear here once launched!');
      } else {
        toast.success(`Found ${launchedProjects.length} live project${launchedProjects.length !== 1 ? 's' : ''}!`);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setRawProjects([]);
      toast.error('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const projectName = project.moduleName || '';
    const tokenSymbol = project.tokenDetails?.symbol || project.tokenDetails?.SYMBOL || '';
    
    const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const currentDate = new Date();
    const startDate = new Date(project.salesDetails?.phase0StartDate || project.salesDetails?.phase0startDate);
    const endDate = new Date(project.salesDetails?.salesEndDate || project.salesDetails?.salesEndTime);
    
    switch (filterStatus) {
      case 'live':
        return matchesSearch && startDate <= currentDate && (!endDate || endDate >= currentDate);
      case 'upcoming':
        return matchesSearch && startDate > currentDate;
      case 'ended':
        return matchesSearch && endDate && endDate < currentDate;
      default:
        return matchesSearch;
    }
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest': {
        const aDate = new Date(a.createdAt || a.salesDetails?.phase0StartDate || a.salesDetails?.phase0startDate || 0);
        const bDate = new Date(b.createdAt || b.salesDetails?.phase0StartDate || b.salesDetails?.phase0startDate || 0);
        return bDate - aDate;
      }
      case 'popular': {
        const aSold = a.salesDetails?.counters?.sold || 0;
        const bSold = b.salesDetails?.counters?.sold || 0;
        return bSold - aSold;
      }
      case 'ending': {
        const aEnd = new Date(a.salesDetails?.salesEndDate || a.salesDetails?.salesEndTime);
        const bEnd = new Date(b.salesDetails?.salesEndDate || b.salesDetails?.salesEndTime);
        return aEnd - bEnd;
      }
      default:
        return 0;
    }
  });

  // Update the sales categorization
  const currentDate = new Date();
  
  // Separate whitelist and public sales from ongoing sales
  const whitelistSales = sortedProjects.filter(sale => {
    const phase0StartDate = new Date(sale.salesDetails?.phase0StartDate || sale.salesDetails?.phase0startDate);
    const phase1StartDate = new Date(sale.salesDetails?.phase1StartDate || sale.salesDetails?.phase1startDate);
    
    // Whitelist phase: after phase0 start but before phase1 start
    return !isNaN(phase0StartDate.getTime()) && !isNaN(phase1StartDate.getTime()) && 
           phase0StartDate <= currentDate && currentDate < phase1StartDate;
  });

  const publicSales = sortedProjects.filter(sale => {
    const phase1StartDate = new Date(sale.salesDetails?.phase1StartDate || sale.salesDetails?.phase1startDate);
    const salesEndDate = new Date(sale.salesDetails?.salesEndDate || sale.salesDetails?.salesEndTime);
    
    // Public phase: after phase1 start but before sale end
    return !isNaN(phase1StartDate.getTime()) && phase1StartDate <= currentDate && 
           (!salesEndDate || isNaN(salesEndDate.getTime()) || salesEndDate >= currentDate);
  });

  // Combined ongoing sales for stats
  const ongoingSales = [...whitelistSales, ...publicSales];

  const upcomingSales = sortedProjects.filter(sale => {
    const startDate = new Date(sale.salesDetails?.phase0StartDate || sale.salesDetails?.phase0startDate);
    return !isNaN(startDate.getTime()) && startDate > currentDate;
  });

  const pastSales = sortedProjects.filter(sale => {
    const endDate = new Date(sale.salesDetails?.salesEndDate || sale.salesDetails?.salesEndTime);
    return !isNaN(endDate.getTime()) && endDate < currentDate;
  });

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text py-8 lg:py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <HeroSection 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortedProjects={isLoading ? [] : sortedProjects}
        />

        {/* Stats Overview with Skeleton */}
        {isLoading ? (
          <StatsOverviewSkeleton />
        ) : (
          <StatsOverview 
            projects={projects}
            ongoingSales={ongoingSales}
            upcomingSales={upcomingSales}
          />
        )}

        {/* Sales Sections with Skeletons */}
        {isLoading ? (
          <>
            <SkeletonSection title="🔥 Whitelist Sales" count={3} />
            <SkeletonSection title="🌍 Public Sales" count={3} />
            <SkeletonSection title="🚀 Upcoming Sales" count={4} />
          </>
        ) : (
          <>
            {filterStatus === 'all' || filterStatus === 'live' ? (
              <>
                <SaleSection 
                  title="🔥 Whitelist Sales" 
                  sales={whitelistSales} 
                  icon={Users}
                  gradient={true}
                />
                <SaleSection 
                  title="🌍 Public Sales" 
                  sales={publicSales} 
                  icon={Globe}
                  gradient={true}
                />
              </>
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
            <EmptyState 
              projects={projects}
              sortedProjects={sortedProjects}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setFilterStatus={setFilterStatus}
              setSortBy={setSortBy}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Buy;
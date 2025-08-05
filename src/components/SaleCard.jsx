import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Calendar,
  ChevronRight,
  Sparkles,
  Flame
} from 'lucide-react';

const SaleCard = ({ sale, index }) => {
  // Extract data from consistent backend structure
  const tokenDetails = sale.tokenDetails || {};
  const salesDetails = sale.salesDetails || {};
  
  // Add countdown state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Add local expanded state for this card
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only use real data - no fallbacks to demo values
  const totalTokens = salesDetails.presalesAmount || 
                     (salesDetails.totalBatches * salesDetails.amountPerBatch) ||
                     salesDetails.totalTokensToSale;
  
  const soldTokens = salesDetails.counters?.sold || 0;
  const progressBarPercent = totalTokens ? (soldTokens / totalTokens) * 100 : 0;
  
  const isHot = progressBarPercent > 70;
  const isNew = index < 3;

  // Calculate phase status and countdown
  const now = new Date();
  const phase0StartDate = useMemo(() => new Date(salesDetails.phase0StartDate || salesDetails.phase0startDate), [salesDetails.phase0StartDate, salesDetails.phase0startDate]);
  const phase1StartDate = useMemo(() => new Date(salesDetails.phase1StartDate || salesDetails.phase1startDate), [salesDetails.phase1StartDate, salesDetails.phase1startDate]);
  const salesEndDate = useMemo(() => new Date(salesDetails.salesEndDate || salesDetails.salesEndTime), [salesDetails.salesEndDate, salesDetails.salesEndTime]);
  
  const isPreWl = !isNaN(phase0StartDate.getTime()) && now < phase0StartDate;
  const isPhase0 = !isNaN(phase0StartDate.getTime()) && !isNaN(phase1StartDate.getTime()) && 
                   now >= phase0StartDate && now < phase1StartDate;
  const isPhase1 = !isNaN(phase1StartDate.getTime()) && !isNaN(salesEndDate.getTime()) && 
                   now >= phase1StartDate && now < salesEndDate;
  const isSaleEnded = !isNaN(salesEndDate.getTime()) && now >= salesEndDate;

  // Update countdown effect
  useEffect(() => {
    if (isSaleEnded || (!phase0StartDate && !phase1StartDate && !salesEndDate)) return;

    const updateCountdown = () => {
      const now = new Date();
      let targetTime;

      if (isPreWl) {
        targetTime = phase0StartDate;
      } else if (isPhase0) {
        targetTime = phase1StartDate;
      } else if (isPhase1) {
        targetTime = salesEndDate;
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      if (isNaN(targetTime.getTime())) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const timeDiff = targetTime - now;
      if (timeDiff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isPreWl, isPhase0, isPhase1, isSaleEnded, phase0StartDate, phase1StartDate, salesEndDate]);

  const getCountdownLabel = () => {
    if (isPreWl) return 'Whitelist starts in';
    if (isPhase0) return 'Public sale starts in';
    if (isPhase1) return 'Sale ends in';
    return null;
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const getStatusColor = (date) => {
    const now = new Date();
    const startDate = new Date(date);
    if (startDate > now) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-lime-400 bg-lime-400/10 border-lime-400/20';
  };

  const getTimeStatus = () => {
    if (!salesDetails.phase0StartDate && !salesDetails.phase0startDate) return 'TBD';
    
    const now = new Date();
    const startDate = new Date(salesDetails.phase0StartDate || salesDetails.phase0startDate);
    const endDate = new Date(salesDetails.salesEndDate || salesDetails.salesEndTime);
    
    if (isNaN(startDate.getTime())) return 'TBD';
    if (now < startDate) return 'Upcoming';
    if (endDate && !isNaN(endDate.getTime()) && now > endDate) return 'Ended';
    return 'Live';
  };

  // Extract project data - only show if available
  const projectName = sale.moduleName || 'Unknown Project';
  const tokenSymbol = tokenDetails.symbol || tokenDetails.SYMBOL;
  const tokenImage = tokenDetails.imageUrl;
  // Use currentPrice from the hook, fallback to phase0Price
  const currentPrice = salesDetails.currentPrice || salesDetails.phase0Price || salesDetails.phase0price;
  const startDate = salesDetails.phase0StartDate || salesDetails.phase0startDate;

  // Check if sale is upcoming (don't show progress bar for upcoming sales)
  const isUpcoming = getTimeStatus() === 'Upcoming';

  // Don't render card if essential data is missing
  if (!projectName || !sale.namespace || !sale.moduleName) {
    return null;
  }

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`card group cursor-pointer overflow-hidden ${
        isExpanded ? '' : 'hover:scale-105'
      } ${isHot ? 'glow border-orange-400/30' : ''}`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onClick={handleCardClick}
    >
      
      {/* Compact View */}
      <div 
        className={`transition-all duration-700 ease-in-out ${
          isExpanded ? 'opacity-0 max-h-0 overflow-hidden transform -translate-y-4' : 'opacity-100 max-h-[500px] transform translate-y-0'
        }`}
      >
        {/* Card Header - Compact */}
        <div className="relative mb-4">
          <div className="aspect-video w-full bg-secondary-bg rounded-xl overflow-hidden">
            <img 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src={tokenImage || '/favicon.svg'}
              alt={`${projectName} banner`}
              onError={(e) => {
                e.target.src = '/favicon.svg';
              }}
            />
          </div>
          
          {/* Compact Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-300 ${getStatusColor(startDate)}`}>
              {getTimeStatus()}
            </span>
          </div>
        </div>

        {/* Compact Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-primary-text truncate">{projectName}</h4>
            {tokenSymbol && (
              <span className="text-accent-primary font-mono text-sm font-medium">${tokenSymbol}</span>
            )}
          </div>
          
          {/* Progress Bar - Only show for current and past sales (not upcoming) */}
          {!isUpcoming && totalTokens && totalTokens > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-secondary">
                <span>{formatNumber(soldTokens)} sold</span>
                <span>{progressBarPercent.toFixed(1)}%</span>
              </div>
              <div className="progress-bar h-2">
                <div 
                  className={`progress-fill transition-all duration-1000 ease-out ${
                    isHot ? 'bg-gradient-to-r from-orange-500 to-red-500' : ''
                  }`}
                  style={{ 
                    width: `${progressBarPercent}%`,
                    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Simple countdown for compact view */}
          {!isSaleEnded && getCountdownLabel() && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0) && (
            <div className="space-y-2">
              <p className="text-xs text-secondary text-center">{getCountdownLabel()}</p>
              <div className="flex justify-center gap-2 text-sm font-mono">
                {countdown.days > 0 && (
                  <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary transition-all duration-300">
                    {countdown.days}d
                  </span>
                )}
                <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary transition-all duration-300">
                  {countdown.hours}h
                </span>
                <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary transition-all duration-300">
                  {countdown.minutes}m
                </span>
                <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary transition-all duration-300">
                  {countdown.seconds}s
                </span>
              </div>
            </div>
          )}
          
          {/* View Sale Button for Current Sales - Compact View */}
          {getTimeStatus() === 'Live' && (
            <div className="mt-3">
              <Link 
                to={`/presale/${sale.namespace}/${sale.moduleName}`}
                className="btn btn-primary w-full text-sm py-2 group flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                onClick={(e) => e.stopPropagation()}
              >
                View Sale
                <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Expanded View */}
      <div 
        className={`transition-all duration-700 ease-in-out ${
          isExpanded ? 'opacity-100 max-h-[2000px] transform translate-y-0' : 'opacity-0 max-h-0 overflow-hidden transform translate-y-4'
        }`}
      >
        {/* Card Header - Expanded */}
        <div className="relative mb-4">
          <div className="aspect-video w-full bg-secondary-bg rounded-xl overflow-hidden">
            <img 
              className="w-full h-full object-cover transition-transform duration-500" 
              src={tokenImage || '/favicon.svg'}
              alt={`${projectName} banner`}
              onError={(e) => {
                e.target.src = '/favicon.svg';
              }}
            />
          </div>
          
          {/* Badges - only show if we have data */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isNew && (
              <span className="px-3 py-1 bg-[var(--accent-primary)] text-black text-xs font-bold rounded-lg flex items-center gap-1 transition-all duration-300 hover:scale-105">
                <Sparkles size={12} />
                New
              </span>
            )}
            {isHot && totalTokens && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all duration-300 hover:scale-105">
                <Flame size={12} />
                Hot
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all duration-300 ${getStatusColor(startDate)}`}>
              {getTimeStatus()}
            </span>
          </div>
        </div>

        {/* Token Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-primary-text">{projectName}</h4>
            {tokenSymbol && (
              <span className="text-accent-primary font-mono text-sm font-medium">${tokenSymbol}</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-secondary">
              <Calendar size={14} />
              <span className="text-xs">
                {startDate ? new Date(startDate).toLocaleDateString() : 'TBD'}
              </span>
            </div>
            {totalTokens && (
              <div className="flex items-center gap-2 text-secondary">
                <Target size={14} />
                <span className="text-xs">{formatNumber(totalTokens)} for sale</span>
              </div>
            )}
          </div>
          
          {/* Batch Info - Show if using batch structure */}
          {salesDetails.totalBatches && salesDetails.amountPerBatch && (
            <div className="mt-3 text-xs text-secondary">
              <span>{salesDetails.totalBatches} batches × {formatNumber(salesDetails.amountPerBatch)} tokens</span>
            </div>
          )}
        </div>

        {/* Countdown Timer - Only show if not ended and we have valid dates */}
        {!isSaleEnded && getCountdownLabel() && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0) && (
          <div className="mb-4 p-4 bg-gradient-to-r from-accent-primary/10 to-accent-primary/5 border border-accent-primary/20 rounded-lg transition-all duration-500 hover:shadow-lg">
            <p className="text-xs text-secondary mb-2 text-center">{getCountdownLabel()}</p>
            <div className="flex justify-center gap-2 text-sm font-mono">
              {countdown.days > 0 && (
                <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary transition-all duration-300 hover:bg-accent-primary/30">
                  {countdown.days}d
                </span>
              )}
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary transition-all duration-300 hover:bg-accent-primary/30">
                {countdown.hours}h
              </span>
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary transition-all duration-300 hover:bg-accent-primary/30">
                {countdown.minutes}m
              </span>
              <span className="bg-accent-primary/20 px-2 py-1 rounded text-accent-primary transition-all duration-300 hover:bg-accent-primary/30">
                {countdown.seconds}s
              </span>
            </div>
          </div>
        )}

        {/* Progress Section - Only show if we have valid data */}
        {totalTokens && totalTokens > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium text-secondary mb-3">
              <span className="transition-all duration-300">{formatNumber(soldTokens)} sold</span>
              <span className="transition-all duration-300">{progressBarPercent.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${
                  isHot ? 'bg-gradient-to-r from-orange-500 to-red-500' : ''
                }`}
                style={{ 
                  width: `${progressBarPercent}%`,
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Price Info - Only show if available */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            {currentPrice && (
              <div className="text-sm transition-all duration-300">
                <span className="text-secondary">Price: </span>
                <span className="text-accent-primary font-bold">{currentPrice} KDA</span>
                {salesDetails.currentPhase && salesDetails.currentPhase !== 'pre-sale' && (
                  <span className="text-xs text-secondary ml-2">
                    ({isSaleEnded ? 'Final Price' :
                      salesDetails.currentPhase === 'phase-0' ? 'Whitelist' : 
                      salesDetails.currentPhase === 'phase-1' ? 'Public' : 
                      salesDetails.currentPhase === 'ended' ? 'Final Price' : ''})
                  </span>
                )}
              </div>
            )}
            {salesDetails.counters?.participants && (
              <div className="flex items-center gap-2 text-xs text-secondary transition-all duration-300">
                <Users size={12} />
                <span>{salesDetails.counters.participants}</span>
              </div>
            )}
          </div>
          
          {/* Additional Sales Info - Only show if available */}
          {salesDetails.totalBatches && (
            <div className="text-xs text-secondary flex justify-between transition-all duration-300">
              <span>Batches: {salesDetails.totalBatches}</span>
              {salesDetails.whitelistLimit && isPhase0 && (
                <span>WL Limit: {formatNumber(salesDetails.whitelistLimit)}</span>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <Link 
            to={`/presale/${sale.namespace}/${sale.moduleName}`}
            className="btn btn-primary w-full group flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            onClick={(e) => e.stopPropagation()}
          >
            View Sale
            <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

SaleCard.propTypes = {
  sale: PropTypes.object.isRequired,
  index: PropTypes.number,
  isDisabled: PropTypes.bool
};

export default SaleCard;
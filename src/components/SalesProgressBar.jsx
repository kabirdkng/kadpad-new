import PropTypes from 'prop-types';
import { addComma } from '../utils/numberUtils';

const SalesProgressBar = ({ 
  soldTokens = 0, 
  totalTokens = 0, 
  sold = 0,
  total = 0,
  showLabels = true,
  size = 'medium',
  showPercentage = true,
  showNumbers = true,
  isHot = false,
  className = '',
  title = ''
}) => {
  // Handle both token amounts and batch counts
  const soldAmount = soldTokens || sold || 0;
  const totalAmount = totalTokens || total || 0;
  
  // Calculate progress percentage
  const progressPercent = totalAmount > 0 ? Math.min((soldAmount / totalAmount) * 100, 100) : 0;
  
  // Determine if the sale is hot (>70% sold)
  const isHotSale = isHot || progressPercent > 70;
  
  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return addComma(num);
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'space-y-1',
          text: 'text-xs',
          bar: 'h-1.5'
        };
      case 'large':
        return {
          container: 'space-y-3',
          text: 'text-sm font-medium',
          bar: 'h-3'
        };
      default: // medium
        return {
          container: 'space-y-2',
          text: 'text-sm',
          bar: 'h-2'
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  // Don't render if no total amount
  if (!totalAmount || totalAmount <= 0) {
    return null;
  }
  
  return (
    <div className={`${sizeClasses.container} ${className}`}>
      {/* Title */}
      {title && (
        <h4 className="text-sm font-medium text-primary-text mb-2">{title}</h4>
      )}
      
      {/* Labels and percentage */}
      {showLabels && (
        <div className={`flex justify-between ${sizeClasses.text} text-secondary`}>
          {showNumbers && (
            <span className="transition-colors duration-200">
              {formatNumber(soldAmount)} sold
            </span>
          )}
          {showPercentage && (
            <span className="transition-colors duration-200">
              {progressPercent.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      
      {/* Progress Bar */}
      <div className={`progress-bar ${sizeClasses.bar} bg-secondary-bg rounded-full overflow-hidden`}>
        <div 
          className={`progress-fill transition-all duration-500 ease-out h-full rounded-full ${
            isHotSale 
              ? 'bg-gradient-to-r from-orange-500 to-red-500' 
              : 'bg-gradient-to-r from-accent-primary to-blue-500'
          }`}
          style={{ 
            width: `${Math.min(progressPercent, 100)}%`
          }}
        />
      </div>
      
      {/* Additional info for large size */}
      {size === 'large' && showNumbers && (
        <div className="flex justify-between text-xs text-secondary mt-1">
          <span>{formatNumber(totalAmount - soldAmount)} remaining</span>
          <span>{formatNumber(totalAmount)} total</span>
        </div>
      )}
    </div>
  );
};

SalesProgressBar.propTypes = {
  soldTokens: PropTypes.number,
  totalTokens: PropTypes.number,
  sold: PropTypes.number,
  total: PropTypes.number,
  showLabels: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showPercentage: PropTypes.bool,
  showNumbers: PropTypes.bool,
  isHot: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string
};

export default SalesProgressBar;

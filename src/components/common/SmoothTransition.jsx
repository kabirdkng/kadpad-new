import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SmoothTransition = ({ 
  isLoading, 
  loadingComponent: LoadingComponent, 
  children, 
  delay = 200 
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      // Show loading immediately when data starts loading
      setShowContent(false);
      // Small delay to prevent flickering for very fast loads
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      // When loading is done, hide loading first, then show content
      setShowLoading(false);
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isLoading, delay]);

  return (
    <div className="relative">
      {/* Loading State */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          showLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {showLoading && <LoadingComponent />}
      </div>

      {/* Content State */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${showLoading ? 'absolute inset-0' : ''}`}
      >
        {showContent && children}
      </div>
    </div>
  );
};

SmoothTransition.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  loadingComponent: PropTypes.elementType.isRequired,
  children: PropTypes.node.isRequired,
  delay: PropTypes.number
};

SmoothTransition.defaultProps = {
  delay: 200
};

export default SmoothTransition;

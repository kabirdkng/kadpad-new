import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const TopToolTip = ({ helpText, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {children}
        <div 
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <HelpCircle size={16} className="text-gray-400 hover:text-gray-600 cursor-help" />
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap z-10">
              {helpText}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TopToolTip.propTypes = {
  helpText: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default TopToolTip;

import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';
import SaleCard from './SaleCard';

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
          <SaleCard 
            key={sale._id} 
            sale={sale} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
};

SaleSection.propTypes = {
  title: PropTypes.string.isRequired,
  sales: PropTypes.array.isRequired,
  icon: PropTypes.elementType.isRequired,
  gradient: PropTypes.bool
};

export default SaleSection;

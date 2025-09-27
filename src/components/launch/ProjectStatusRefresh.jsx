import React from 'react';

const ProjectStatusRefresh = ({ 
  lastUpdated, 
  error 
}) => {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-secondary">
      {lastUpdated && (
        <span>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      )}
      
      {error && (
        <span className="text-red-400" title={error}>
          ⚠️ Update error
        </span>
      )}
    </div>
  );
};

export default ProjectStatusRefresh;
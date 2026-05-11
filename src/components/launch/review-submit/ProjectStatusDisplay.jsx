import React from 'react';
import { getStatusInfo } from './statusConfig';

const ProjectStatusDisplay = ({ existingProject }) => {
  if (!existingProject) return null;

  const statusInfo = getStatusInfo(existingProject.status);

  return (
    <div className={`card ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-secondary-bg border ${statusInfo.borderColor} flex items-center justify-center`}>
          {React.createElement(statusInfo.icon, {
            className: `w-6 h-6 ${statusInfo.iconColor}`
          })}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold mb-1 ${statusInfo.iconColor}`}>
            {statusInfo.title}
          </h4>
          <p className="text-secondary mb-2">
            {statusInfo.description}
          </p>
          <p className="text-sm text-secondary">
            {statusInfo.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusDisplay;

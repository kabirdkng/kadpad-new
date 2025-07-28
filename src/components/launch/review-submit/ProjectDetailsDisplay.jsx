import React from 'react';
import { FileText, Globe } from 'lucide-react';
import { getStatusInfo } from './statusConfig';

const ProjectDetailsDisplay = ({ existingProject }) => {
  if (!existingProject) return null;

  const statusInfo = getStatusInfo(existingProject.status);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-accent-primary" />
        Submitted Project Details
      </h3>
      
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Project Status</label>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.iconColor}`}>
              {statusInfo.title}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Submission Date</label>
            <p className="text-primary-text text-sm">
              {new Date(existingProject.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Website */}
        {existingProject.website && (
          <div>
            <label className="block text-sm font-medium text-secondary mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Project Website
            </label>
            <a 
              href={existingProject.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent-primary hover:text-accent-primary/80 text-sm underline"
            >
              {existingProject.website}
            </a>
          </div>
        )}

        {/* Project Description */}
        {existingProject.projectDescription && (
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Project Description</label>
            <div className="bg-secondary-bg p-3 rounded-lg">
              <p className="text-primary-text text-sm whitespace-pre-wrap">
                {existingProject.projectDescription}
              </p>
            </div>
          </div>
        )}

        {/* Team Members */}
        {existingProject.team && existingProject.team.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Team Members</label>
            <div className="space-y-3">
              {existingProject.team.map((member, index) => (
                <div key={index} className="bg-secondary-bg p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-primary-text">{member.name}</h5>
                    <span className="text-xs text-secondary">{member.email}</span>
                  </div>
                  {member.about && (
                    <p className="text-sm text-secondary mt-1">{member.about}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fee Details if applicable */}
        {existingProject.feeDetails && existingProject.feeDetails.amount > 0 && (
          <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg">
            <label className="block text-sm font-medium text-blue-400 mb-1">Fee Information</label>
            <div className="text-sm space-y-1">
              <p className="text-primary-text">
                Amount: <span className="font-medium">${existingProject.feeDetails.amount}</span>
              </p>
              {existingProject.feeDetails.dueDate && (
                <p className="text-secondary">
                  Due: {new Date(existingProject.feeDetails.dueDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-secondary">
                Status: {existingProject.feeDetails.paid ? 
                  <span className="text-green-400">Paid</span> : 
                  <span className="text-yellow-400">Pending</span>
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsDisplay;

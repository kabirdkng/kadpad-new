import React from 'react';

const ReviewProcess = ({ existingProject }) => {
  if (existingProject) return null;

  return (
    <div className="card-gradient">
      <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
        <span className="text-xl">📋</span>
        Review Process
      </h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5">
            1
          </div>
          <div>
            <p className="text-sm text-primary-text font-medium">Initial Review</p>
            <p className="text-xs text-secondary">We verify your token contract and basic information</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5">
            2
          </div>
          <div>
            <p className="text-sm text-primary-text font-medium">Team Verification</p>
            <p className="text-xs text-secondary">Our team performs due diligence on your project and team</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-xs font-bold text-accent-primary mt-0.5">
            3
          </div>
          <div>
            <p className="text-sm text-primary-text font-medium">Approval & Sales Setup</p>
            <p className="text-xs text-secondary">Once approved, you'll configure your sales contract details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewProcess;

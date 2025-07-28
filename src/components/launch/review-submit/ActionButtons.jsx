import React from 'react';
import { Send } from 'lucide-react';

const ActionButtons = ({ existingProject, tokenDetails, onSubmitClick }) => {
  const renderActionButton = () => {
    if (!existingProject) {
      return (
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={onSubmitClick}
          disabled={!tokenDetails}
        >
          <Send size={16} />
          Submit for Review
        </button>
      );
    }

    // Don't show any action button if project exists - just show status
    return null;
  };

  return (
    !existingProject && (
      <div className="card text-center">
        <div className="space-y-4">
          {renderActionButton()}
          
          <div className="text-sm text-secondary">
            <p>By submitting, you agree that:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Your token contract has been properly deployed and tested</li>
              <li>• All token details are accurate and verified</li>
              <li>• You understand that sales contract configuration comes after approval</li>
            </ul>
          </div>
        </div>
      </div>
    )
  );
};

export default ActionButtons;

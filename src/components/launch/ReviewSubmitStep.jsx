import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck } from 'lucide-react';
import ProjectSubmitModal from './ProjectSubmitModal';
import { checkProjectByContract } from '../../api';
import { toast } from 'react-toastify';

// Import refactored components
import LoadingState from './review-submit/LoadingState';
import TokenDetailsPreview from './review-submit/TokenDetailsPreview';
import ProjectStatusDisplay from './review-submit/ProjectStatusDisplay';
import ProjectDetailsDisplay from './review-submit/ProjectDetailsDisplay';
import NextStepsCard from './review-submit/NextStepsCard';
import ActionButtons from './review-submit/ActionButtons';
import ReviewProcess from './review-submit/ReviewProcess';

const ReviewSubmitStep = ({ 
  tokenDetails, 
  submissionStatus, 
  project: realtimeProject,
  statusLoading: realtimeStatusLoading,
  isVerified 
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingProject, setExistingProject] = useState(null);

  // Use real-time project data when available, otherwise use local state
  const currentProject = realtimeProject || existingProject;
  const currentStatusLoading = realtimeStatusLoading || isLoading;

  // Fallback function to check existing submissions
  const checkExistingSubmission = useCallback(async () => {
    if (tokenDetails && tokenDetails.contractAddress) {
      setIsLoading(true);
      try {
        const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
        
        const response = await checkProjectByContract(namespace, moduleName);
        
        if (response.data.data.project) {
          const existing = response.data.data.project;
          setExistingProject(existing);
        } else {
          setExistingProject(null);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // 404 is expected when no project exists yet - don't show error
          setExistingProject(null);
        } else if (error.code === 'DUPLICATE_REQUEST') {
          // Duplicate request blocked - this is fine, just ignore it
          return;
        } else {
          console.error('Error checking existing submission:', error);
          toast.error('Failed to check for existing submissions. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [tokenDetails]);

  // Update local state when real-time project data changes
  useEffect(() => {
    if (realtimeProject) {
      setExistingProject(realtimeProject);
    } else if (!realtimeProject && tokenDetails && !realtimeStatusLoading) {
      // Only check existing submission if real-time hook is not loading
      checkExistingSubmission();
    }
  }, [realtimeProject, tokenDetails, realtimeStatusLoading, checkExistingSubmission]);

  const handleProjectSubmit = async (projectData) => {
    setShowSubmitModal(false);
    setIsLoading(true);
    try {
      console.log('Project submitted successfully:', projectData);
      // Update local state with the submitted project data
      setExistingProject(projectData);
      
      // Force a status check after a short delay to ensure backend has processed the submission
      setTimeout(() => {
        checkExistingSubmission();
      }, 1000);
      
      toast.success('Project submitted successfully! Our team will review it within 48 hours.');
    } catch (error) {
      console.error('Error submitting project:', error);
      if (error.response && error.response.data && error.response.data.message.includes('already exists')) {
        toast.error('A project with this module name and namespace already exists. Please check your existing submissions.');
        // Check for existing submission in case of duplicate
        checkExistingSubmission();
      } else {
        toast.error('Failed to submit project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatusLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <ClipboardCheck className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">
          Review & Submit
        </h2>
        <p className="text-secondary max-w-2xl mx-auto">
          {currentProject
            ? "Your submission status updates automatically. Check your progress and next steps below."
            : "Review your token details and submit for our approval process. Our team will review your submission within 48 hours."}
        </p>
      </div>

      {/* Token Details Preview */}
      <TokenDetailsPreview tokenDetails={tokenDetails} />

      {/* Project Status Card - Only show if project exists */}
      {currentProject && (
        <div className="space-y-6">
          {/* Status Display */}
          <ProjectStatusDisplay existingProject={currentProject} />

          {/* Project Details Display */}
          <ProjectDetailsDisplay existingProject={currentProject} />
          
          {/* Next Steps Card - Only show if project exists */}
          <NextStepsCard existingProject={currentProject} />
        </div>
      )}

      {/* Action Section - Only show submit button if no existing project */}
      <ActionButtons 
        existingProject={currentProject} 
        tokenDetails={tokenDetails} 
        onSubmitClick={() => setShowSubmitModal(true)} 
      />

      {/* Review Process - Only show if no existing project */}
      <ReviewProcess existingProject={currentProject} />

      {/* Project Submit Modal */}
      {showSubmitModal && !currentProject && (
        <ProjectSubmitModal 
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleProjectSubmit}
          tokenDetails={tokenDetails}
        />
      )}
    </div>
  );
};

export default ReviewSubmitStep;
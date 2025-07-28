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

const ReviewSubmitStep = ({ tokenDetails, setSubmissionStatus, isVerified }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingProject, setExistingProject] = useState(null);

  const checkExistingSubmission = useCallback(async () => {
    if (tokenDetails && tokenDetails.contractAddress) {
      setIsLoading(true);
      try {
        const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
        
        // Use the new API endpoint to check for any project with this contract
        const response = await checkProjectByContract(namespace, moduleName);
        
        if (response.data.data.project) {
          const existing = response.data.data.project;
          setExistingProject(existing);
          setSubmissionStatus(existing.status);
        } else {
          setExistingProject(null);
          setSubmissionStatus(null);
        }
      } catch (error) {
        // If 404, no project exists
        if (error.response && error.response.status === 404) {
          setExistingProject(null);
          setSubmissionStatus(null);
        } else {
          console.error('Error checking existing submission:', error);
          toast.error('Failed to check for existing submissions. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [tokenDetails, setSubmissionStatus]);

  useEffect(() => {
    checkExistingSubmission();
  }, [checkExistingSubmission]);

  const handleProjectSubmit = async (projectData) => {
    setShowSubmitModal(false);
    setIsLoading(true);
    try {
      // Remove this line:
      // const response = await submitProject(projectData);

      // Instead, just update state with the project data returned from the modal
      setExistingProject(projectData);
      setSubmissionStatus(projectData.status);
    } catch (error) {
      console.error('Error submitting project:', error);
      if (error.response && error.response.data && error.response.data.message.includes('already exists')) {
        toast.error('A project with this module name and namespace already exists. Please check your existing submissions.');
        await checkExistingSubmission();
      } else {
        toast.error('Failed to submit project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
          {existingProject
            ? "Check your submission status and next steps."
            : "Review your token details and submit for our approval process. Our team will review your submission within 48 hours."}
        </p>
      </div>

      {/* Token Details Preview */}
      <TokenDetailsPreview tokenDetails={tokenDetails} />

      {/* Project Status Card - Only show if project exists */}
      {existingProject && (
        <div className="space-y-6">
          {/* Status Display */}
          <ProjectStatusDisplay existingProject={existingProject} />

          {/* Project Details Display */}
          <ProjectDetailsDisplay existingProject={existingProject} />
          
          {/* Next Steps Card - Only show if project exists */}
          <NextStepsCard existingProject={existingProject} />
        </div>
      )}

      {/* Action Section - Only show submit button if no existing project */}
      <ActionButtons 
        existingProject={existingProject} 
        tokenDetails={tokenDetails} 
        onSubmitClick={() => setShowSubmitModal(true)} 
      />

      {/* Review Process - Only show if no existing project */}
      <ReviewProcess existingProject={existingProject} />

      {/* Project Submit Modal */}
      {showSubmitModal && !existingProject && (
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
import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck } from 'lucide-react';
import ProjectSubmitModal from './ProjectSubmitModal';
import { getPublicProjects, submitProject } from '../../api';
import { toast } from 'react-toastify';

const ReviewSubmitStep = ({ tokenDetails, setSubmissionStatus, isVerified }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingProject, setExistingProject] = useState(null);

  const checkExistingSubmission = useCallback(async () => {
    if (tokenDetails && tokenDetails.contractAddress) {
      setIsLoading(true);
      try {
        const response = await getPublicProjects();
        const existing = response.data.data.projects.find(
          project => 
            project.namespace === tokenDetails.contractAddress.split('.')[0] && 
            project.moduleName === tokenDetails.contractAddress.split('.')[1]
        );
        if (existing) {
          if (existing.status === 'launched' || isVerified) {
            setExistingProject(existing);
            setSubmissionStatus(existing.status);
          } else {
            setExistingProject(null);
            setSubmissionStatus(null);
          }
        } else {
          setExistingProject(null);
          setSubmissionStatus(null);
        }
      } catch (error) {
        console.error('Error checking existing submission:', error);
        toast.error('Failed to check for existing submissions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [tokenDetails, setSubmissionStatus, isVerified]);

  useEffect(() => {
    checkExistingSubmission();
  }, [checkExistingSubmission]);

  const handleProjectSubmit = async (projectData) => {
    setShowSubmitModal(false);
    setIsLoading(true);
    try {
      const response = await submitProject(projectData);
      setExistingProject(response.data);
      setSubmissionStatus(response.data.status);
      toast.success('Project submitted successfully!');
    } catch (error) {
      console.error('Error submitting project:', error);
      if (error.response && error.response.data && error.response.data.message.includes('already exists')) {
        toast.error('A project with this module name and namespace already exists. Please check your existing submissions.');
        await checkExistingSubmission(); // Recheck for existing submission
      } else {
        toast.error('Failed to submit project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusMessage = () => {
    if (!existingProject) return '';
    switch (existingProject.status) {
      case 'pending':
        return 'Your submission is currently under review. Please check back later.';
      case 'approved':
        return 'Your submission has been approved.';
      case 'rejected':
        return 'Your submission has been rejected. Please review the feedback and resubmit if necessary.';
      case 'awaiting_fees':
        return 'Your submission has been reviewed. Please pay the required fees to proceed.';
      case 'ready_to_launch':
        return 'Your submission has been verified. You are ready to launch!';
      case 'launched':
        return 'Your project has been successfully launched!';
      default:
        return '';
    }
  };

  const renderTokenInfo = () => {
    if (tokenDetails && tokenDetails.tokendetails) {
      return (
        <div className="mb-4">
          <p className="font-bold">Token Symbol: <span className="font-normal">{tokenDetails.tokendetails.SYMBOL}</span></p>
          <p className="font-bold">Total Supply: <span className="font-normal">{tokenDetails.tokendetails.totalSupply}</span></p>
        </div>
      );
    }
    return null;
  };

  const renderActionButton = () => {
    if (!existingProject) {
      return (
        <button 
          className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          onClick={() => setShowSubmitModal(true)}
        >
          Submit for Review
        </button>
      );
    }

    switch (existingProject.status) {
      case 'awaiting_fees':
        return (
          <button 
            className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={() => {/* Handle fee payment */}}
          >
            Pay Fees
          </button>
        );
      case 'ready_to_launch':
        return (
          <button 
            className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={() => {/* Handle project launch */}}
          >
            Launch Project
          </button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <ClipboardCheck className="w-16 h-16 text-lime-500 mx-auto mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p className="mb-6">Please wait while we fetch the latest status.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <ClipboardCheck className="w-16 h-16 text-lime-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">Review and Submit</h2>
      {renderTokenInfo()}
      <p className="mb-6">
        {existingProject
          ? `Status: ${existingProject.status}. ${renderStatusMessage()}`
          : "Review your launch details and submit for approval. Our team will review your submission within 48 hours."}
      </p>
      {renderActionButton()}
      {showSubmitModal && !existingProject && (
        <ProjectSubmitModal 
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleProjectSubmit}
          tokenDetails={tokenDetails}
          existingProject={existingProject}
        />
      )}
    </div>
  );
};

export default ReviewSubmitStep;
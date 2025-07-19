import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Clock, CheckCircle, AlertCircle, Send, Eye, DollarSign } from 'lucide-react';
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
        await checkExistingSubmission();
      } else {
        toast.error('Failed to submit project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        color: 'yellow',
        icon: Clock,
        title: 'Under Review',
        description: 'Your submission is currently being reviewed by our team.',
        message: 'Our team will review your submission within 48 hours. Please check back later.',
        bgColor: 'bg-yellow-500/5',
        borderColor: 'border-yellow-500/20',
        iconColor: 'text-yellow-400'
      },
      approved: {
        color: 'green',
        icon: CheckCircle,
        title: 'Approved',
        description: 'Your submission has been approved and is ready for sales contract setup.',
        message: 'Congratulations! Your submission has been approved. You can now configure your sales contract.',
        bgColor: 'bg-green-500/5',
        borderColor: 'border-green-500/20',
        iconColor: 'text-green-400'
      },
      rejected: {
        color: 'red',
        icon: AlertCircle,
        title: 'Rejected',
        description: 'Your submission needs modifications before approval.',
        message: 'Your submission has been rejected. Please review the feedback and resubmit if necessary.',
        bgColor: 'bg-red-500/5',
        borderColor: 'border-red-500/20',
        iconColor: 'text-red-400'
      },
      awaiting_fees: {
        color: 'blue',
        icon: DollarSign,
        title: 'Awaiting Fees',
        description: 'Please complete the fee payment to proceed.',
        message: 'Your submission has been reviewed. Please pay the required fees to proceed.',
        bgColor: 'bg-blue-500/5',
        borderColor: 'border-blue-500/20',
        iconColor: 'text-blue-400'
      },
      ready_to_launch: {
        color: 'purple',
        icon: CheckCircle,
        title: 'Ready to Launch',
        description: 'Everything is set up and ready for launch.',
        message: 'Your submission has been verified. You are ready to launch!',
        bgColor: 'bg-purple-500/5',
        borderColor: 'border-purple-500/20',
        iconColor: 'text-purple-400'
      },
      launched: {
        color: 'green',
        icon: CheckCircle,
        title: 'Launched',
        description: 'Your token has been successfully launched.',
        message: 'Your project has been successfully launched!',
        bgColor: 'bg-green-500/5',
        borderColor: 'border-green-500/20',
        iconColor: 'text-green-400'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const renderActionButton = () => {
    if (!existingProject) {
      return (
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowSubmitModal(true)}
          disabled={!tokenDetails}
        >
          <Send size={16} />
          Submit for Review
        </button>
      );
    }

    const status = existingProject.status;
    switch (status) {
      case 'awaiting_fees':
        return (
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {/* Handle fee payment */}}
          >
            <DollarSign size={16} />
            Pay Launch Fees
          </button>
        );
      case 'approved':
        return (
          <div className="text-center">
            <p className="text-sm text-secondary mb-4">
              Your project has been approved! You can now configure your sales contract in the next step.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle size={16} className="text-green-400 mr-2" />
              <span className="text-green-400 font-medium">Ready to Configure Sales</span>
            </div>
          </div>
        );
      case 'ready_to_launch':
        return (
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => {/* Handle project launch */}}
          >
            <CheckCircle size={16} />
            Launch Project
          </button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-primary"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-text mb-4">Loading...</h2>
          <p className="text-secondary">Please wait while we fetch the latest status.</p>
        </div>
      </div>
    );
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
      {tokenDetails && (
        <div className="card">
          <h3 className="text-lg font-semibold text-primary-text mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent-primary" />
            Token Details Preview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Token Name</label>
                <p className="text-primary-text font-medium">{tokenDetails.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Token Symbol</label>
                <p className="text-primary-text font-medium">${tokenDetails.symbol}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Total Supply</label>
                <p className="text-primary-text font-medium">{tokenDetails.supply?.int?.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Contract Address</label>
                <p className="text-primary-text font-mono text-sm break-all">{tokenDetails.contractAddress}</p>
              </div>
              {tokenDetails.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Token Image</label>
                  <img 
                    src={tokenDetails.imageUrl} 
                    alt={tokenDetails.name}
                    className="w-16 h-16 rounded-lg object-cover border border-border-color"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Card */}
      {existingProject && (
        <div className={`card ${getStatusInfo(existingProject.status).bgColor} ${getStatusInfo(existingProject.status).borderColor}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl bg-secondary-bg border ${getStatusInfo(existingProject.status).borderColor} flex items-center justify-center`}>
              {React.createElement(getStatusInfo(existingProject.status).icon, {
                className: `w-6 h-6 ${getStatusInfo(existingProject.status).iconColor}`
              })}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${getStatusInfo(existingProject.status).iconColor}`}>
                {getStatusInfo(existingProject.status).title}
              </h4>
              <p className="text-secondary mb-2">
                {getStatusInfo(existingProject.status).description}
              </p>
              <p className="text-sm text-secondary">
                {getStatusInfo(existingProject.status).message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Section */}
      <div className="card text-center">
        <div className="space-y-4">
          {renderActionButton()}
          
          {!existingProject && (
            <div className="text-sm text-secondary">
              <p>By submitting, you agree that:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Your token contract has been properly deployed and tested</li>
                <li>• All token details are accurate and verified</li>
                <li>• You understand that sales contract configuration comes after approval</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Review Process */}
      {!existingProject && (
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
      )}

      {/* Project Submit Modal */}
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
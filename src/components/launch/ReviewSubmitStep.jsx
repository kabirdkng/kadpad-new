import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Clock, CheckCircle, AlertCircle, Send, Eye, DollarSign, Globe, FileText } from 'lucide-react';
import ProjectSubmitModal from './ProjectSubmitModal';
import { getPublicProjects, submitProject, checkProjectByContract } from '../../api';
import { toast } from 'react-toastify';

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
        description: 'Your submission has been approved.',
        message: 'Congratulations! Your submission has been approved.',
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

    // Don't show any action button if project exists - just show status
    return null;
  };

  const renderNextStepsCard = () => {
    if (!existingProject) return null;

    const status = existingProject.status;
    
    switch (status) {
      case 'pending':
        return (
          <div className="card bg-blue-500/5 border-blue-500/20">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-400 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">Next Steps</h4>
                <p className="text-secondary text-sm mb-3">
                  Your project is currently under review. Our team will evaluate your submission and respond within 48 hours.
                </p>
                <div className="text-xs text-secondary">
                  <p className="mb-1">• Team verification in progress</p>
                  <p className="mb-1">• Token contract validation</p>
                  <p>• Project details review</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'approved':
        return (
          <div className="card bg-green-500/5 border-green-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Project Approved! 🎉</h4>
                <p className="text-secondary text-sm mb-3">
                  Congratulations! Your project has been approved. The admin team will now set launch fees for your project.
                </p>
                <div className="text-xs text-secondary">
                  <p className="mb-1">• Waiting for launch fees to be set</p>
                  <p className="mb-1">• You'll be notified once fees are determined</p>
                  <p>• Sales configuration comes after launch</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'awaiting_fees':
        return (
          <div className="card bg-yellow-500/5 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-yellow-400 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">Payment Required</h4>
                <p className="text-secondary text-sm mb-3">
                  Launch fees have been set for your project. Please complete the payment to proceed.
                </p>
                {existingProject.feeDetails && (
                  <div className="bg-secondary-bg p-3 rounded-lg mb-3">
                    <div className="text-sm space-y-1">
                      <p className="text-primary-text">
                        <span className="text-secondary">Amount:</span> 
                        <span className="font-medium ml-2">${existingProject.feeDetails.amount}</span>
                      </p>
                      {existingProject.feeDetails.dueDate && (
                        <p className="text-primary-text">
                          <span className="text-secondary">Due Date:</span>
                          <span className="ml-2">{new Date(existingProject.feeDetails.dueDate).toLocaleDateString()}</span>
                        </p>
                      )}
                      {existingProject.feeDetails.comment && (
                        <p className="text-secondary text-xs mt-2">
                          Note: {existingProject.feeDetails.comment}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-xs text-secondary">
                  <p className="mb-1">• Contact admin team for payment instructions</p>
                  <p>• Project will be launched once payment is confirmed</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ready_to_launch':
        return (
          <div className="card bg-purple-500/5 border-purple-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-purple-400 mt-1" />
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">Ready for Launch</h4>
                <p className="text-secondary text-sm mb-3">
                  All requirements have been met! Your project is ready to be launched by the admin team.
                </p>
                <div className="text-xs text-secondary">
                  <p className="mb-1">• All fees have been paid</p>
                  <p className="mb-1">• Project verification complete</p>
                  <p>• Admin team will launch your project shortly</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'launched':
        return (
          <div className="card bg-green-500/5 border-green-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
              <div>
                <h4 className="font-semibold text-green-400 mb-2">🎉 Project Launched!</h4>
                <p className="text-secondary text-sm mb-3">
                  Your project has been successfully launched! You can now configure your sales details to start your presale.
                </p>
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <p className="text-green-400 font-medium text-sm mb-2">Ready for Sales Configuration</p>
                  <p className="text-secondary text-xs">
                    Proceed to the next step to configure your presale phases, pricing, and whitelist settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rejected':
        return (
          <div className="card bg-red-500/5 border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 mt-1" />
              <div>
                <h4 className="font-semibold text-red-400 mb-2">Project Rejected</h4>
                <p className="text-secondary text-sm mb-3">
                  Your submission has been rejected. Please review the feedback and make necessary changes before resubmitting.
                </p>
                {existingProject.approvals && existingProject.approvals.length > 0 && (
                  <div className="bg-secondary-bg p-3 rounded-lg mb-3">
                    <p className="text-sm text-secondary mb-2">Admin Feedback:</p>
                    {existingProject.approvals.map((approval, index) => (
                      approval.decision === 'reject' && approval.comment && (
                        <div key={index} className="text-xs text-primary-text">
                          <span className="text-secondary">• </span>
                          {approval.comment}
                        </div>
                      )
                    ))}
                  </div>
                )}
                <div className="text-xs text-secondary">
                  <p className="mb-1">• Review the feedback above</p>
                  <p className="mb-1">• Make necessary improvements to your project</p>
                  <p>• You can resubmit once issues are resolved</p>
                </div>
              </div>
            </div>
          </div>
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

      {/* Project Status Card - Only show if project exists */}
      {existingProject && (
        <div className="space-y-6">
          {/* Status Display */}
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

          {/* Project Details Display */}
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
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(existingProject.status).bgColor} ${getStatusInfo(existingProject.status).iconColor}`}>
                    {getStatusInfo(existingProject.status).title}
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
          {/* Next Steps Card - Only show if project exists */}
          {existingProject && renderNextStepsCard()}
        </div>
      )}

      {/* Action Section - Only show submit button if no existing project */}
      {!existingProject && (
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
      )}

      {/* Review Process - Only show if no existing project */}
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
        />
      )}
    </div>
  );
};

export default ReviewSubmitStep;
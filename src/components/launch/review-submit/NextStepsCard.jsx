import React from 'react';
import { Clock, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';
import FeeDisplay from './FeeDisplay';

const NextStepsCard = ({ existingProject }) => {
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
            <div className="flex items-start justify-between">
              <span className="text-secondary">Amount:</span>
              <div className="text-right">
            <FeeDisplay usdAmount={existingProject.feeDetails.amount} />
              </div>
            </div>
            {existingProject.feeDetails.dueDate && (
              <p className="text-primary-text">
            <span className="text-secondary">Due Date:</span>
            <span className="ml-2">{new Date(existingProject.feeDetails.dueDate).toLocaleDateString()}</span>
              </p>
            )}
            {existingProject.feeDetails.walletAddress && (
              <div className="break-all">
            <span className="text-secondary">Wallet Address:</span>
            <span 
              className="ml-2 cursor-pointer hover:text-yellow-400 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(existingProject.feeDetails.walletAddress);
              }}
              title="Click to copy"
            >
              {existingProject.feeDetails.walletAddress}
            </span>
              </div>
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
                <p>• Admin team will configure your project sales details shortly</p>
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
                Your project has been successfully launched! Our admin team will configure your sales details for you.
              </p>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <p className="text-green-400 font-medium text-sm mb-2">Waiting for Admin Configuration</p>
                <p className="text-secondary text-xs">
                  Our team will set up your presale phases, pricing, and whitelist settings, then notify you to proceed.
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'sales_configured':
      return (
        <div className="card bg-cyan-500/5 border-cyan-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-cyan-400 mt-1" />
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2">🚀 Ready for Deployment!</h4>
              <p className="text-secondary text-sm mb-3">
                Great news! Your sales configuration has been completed by our admin team. You can now proceed to deploy your token contracts.
              </p>
              <div className="bg-cyan-500/10 p-3 rounded-lg">
                <p className="text-cyan-400 font-medium text-sm mb-2">Next: Deploy Token Contracts</p>
                <p className="text-secondary text-xs">
                  You will be automatically redirected to the Launch Token step where you can deploy your sales and treasury contracts.
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

export default NextStepsCard;

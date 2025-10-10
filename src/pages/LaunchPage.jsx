import React, { useState, useEffect } from 'react';
import useWalletStore from '../wallet/walletStore';
import StepIndicator from '../components/launch/StepIndicator';
import CreateVerifyStep from '../components/launch/CreateVerifyStep';
import ReviewSubmitStep from '../components/launch/ReviewSubmitStep';
import LaunchTokenStep from '../components/launch/LaunchTokenStep';
import useProjectSubmissionStatus from '../hooks/useProjectSubmissionStatus';

const StepContent = ({ 
  step, 
  onNextStep, 
  onPrevStep, 
  isVerified, 
  setIsVerified, 
  tokenDetails, 
  setTokenDetails, 
  submissionStatus,
  project,
  statusLoading
}) => {
  const steps = [
    CreateVerifyStep,
    ReviewSubmitStep,
    LaunchTokenStep
  ];

  const StepComponent = steps[step];

  return (
    <div className="w-full">
      <StepComponent 
        isVerified={isVerified} 
        setIsVerified={setIsVerified} 
        tokenDetails={tokenDetails} 
        setTokenDetails={setTokenDetails}
        submissionStatus={submissionStatus}
        project={project}
        statusLoading={statusLoading}
      />
      
      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        {step > 0 ? (
          <button 
            onClick={onPrevStep} 
            className="btn btn-ghost order-2 sm:order-1"
          >
            ← Previous Step
          </button>
        ) : (
          <div className="order-2 sm:order-1"></div>
        )}
        
        {step < steps.length - 1 && (
          <button 
            onClick={onNextStep} 
            className={`btn order-1 sm:order-2 ${
              // Button is disabled if:
              // - On step 0 (CreateVerify) and not verified
              // - On step 1 (Review) and can't proceed (no sales configuration)
              (step === 0 && !isVerified) ||
              (step === 1 && !canProceedFromReviewStep(submissionStatus))
                ? 'btn-ghost opacity-50 cursor-not-allowed' 
                : 'btn-primary'
            }`}
            disabled={
              (step === 0 && !isVerified) ||
              (step === 1 && !canProceedFromReviewStep(submissionStatus))
            }
          >
            {/* Dynamic button text based on current step and status */}
            {step === 0 && isVerified && (submissionStatus === 'sales_configured' || submissionStatus === 'launched') 
              ? 'Go to Launch →' 
              : step === 0 && isVerified 
                ? 'Go to Review →'
                : 'Next Step →'
            }
          </button>
        )}
      </div>
    </div>
  );
};

// Helper function to determine if user can proceed from review step (step 2) to launch step (step 3)
const canProceedFromReviewStep = (submissionStatus) => {
  // Can proceed if status is 'sales_configured' or 'launched'
  return submissionStatus === 'sales_configured' || submissionStatus === 'launched';
};

const LaunchPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);
  const [hasAutoNavigatedAfterVerification, setHasAutoNavigatedAfterVerification] = useState(false);

  // Use the real-time project status hook
  const { 
    project, 
    submissionStatus, 
    isLoading: statusLoading,
    lastUpdated,
    getStatusDisplayName
  } = useProjectSubmissionStatus(tokenDetails, {
    pollingInterval: 8000, // Poll every 8 seconds
    enablePolling: true,
    pollingOnFocus: true,
    showNotifications: true
  });

  // Scroll to main content when step changes
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [currentStep]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset auto-navigation flag when verification status changes
  useEffect(() => {
    if (!isVerified) {
      setHasAutoNavigatedAfterVerification(false);
    }
  }, [isVerified]);

  // Auto-navigate to LaunchTokenStep when project status becomes sales_configured
  useEffect(() => {
    if (
      currentStep === 1 && // Currently on ReviewSubmitStep
      submissionStatus === 'sales_configured' && // Project has sales configured
      !statusLoading // Not loading to avoid navigation during status checks
    ) {
      console.log('Auto-navigating to LaunchTokenStep due to sales_configured status');
      setCurrentStep(2);
    }
  }, [currentStep, submissionStatus, statusLoading]);

  // Auto-navigate after ownership verification is completed (only once per verification)
  useEffect(() => {
    if (
      currentStep === 0 && // Currently on CreateVerifyStep
      isVerified && // Ownership has been verified
      tokenDetails && // Token details are available
      !hasAutoNavigatedAfterVerification // Haven't auto-navigated yet for this verification
    ) {
      // Add a small delay to allow UI to update and prevent conflicts
      const timer = setTimeout(() => {
        console.log('Auto-navigating to next step after ownership verification');
        setHasAutoNavigatedAfterVerification(true);
        // Check if project has sales configured to determine which step to navigate to
        if (submissionStatus === 'sales_configured' || submissionStatus === 'launched') {
          setCurrentStep(2); // Go directly to LaunchTokenStep
        } else {
          setCurrentStep(1); // Go to ReviewSubmitStep
        }
      }, 500); // 500ms delay

      return () => clearTimeout(timer);
    }
  }, [currentStep, isVerified, tokenDetails, submissionStatus, hasAutoNavigatedAfterVerification]);

  const handleNextStep = () => {
    // If on CreateVerify step
    if (currentStep === 0) {
      // Check if verified and if project has sales configured
      if (isVerified && (submissionStatus === 'sales_configured' || submissionStatus === 'launched')) {
        setCurrentStep(2); // Skip to LaunchTokenStep
      } else if (isVerified) {
        setCurrentStep(1); // Go to ReviewSubmitStep
      }
      // If not verified, button should be disabled anyway
      return;
    }
    
    // If on Review step, only allow next if project has sales configured
    if (currentStep === 1) {
      if (canProceedFromReviewStep(submissionStatus)) {
        setCurrentStep(2);
      }
      return;
    }
    
    // Normal next step for any other case
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 2));
  };

  const handlePrevStep = () => {
    // From LaunchToken step (step 2), always go back to CreateVerify (step 0)
    // This maintains consistency since users might have skipped Review step
    if (currentStep === 2) {
      setCurrentStep(0);
      return;
    }
    
    // From Review step (step 1), go back to CreateVerify (step 0)
    if (currentStep === 1) {
      setCurrentStep(0);
      return;
    }
    
    // Fallback: normal previous step
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const stepTitles = [
    "Create & Verify Your Token",
    "Review & Submit",
    "Launch Your Token"
  ];

  const stepDescriptions = [
    "Create your token using our tools and verify ownership with your wallet",
    "Review your details and submit for our approval process",
    "Deploy your token contract after admin configures your sales"
  ];

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-card border border-accent-primary/20 mb-6">
            <span className="text-sm font-medium text-accent-primary">
              🚀 Token Launch Platform
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-4">
            Launch Your <span className="text-gradient">Token</span>
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto mb-8">
            Follow our step-by-step process to launch your token on Kadena. 
            We'll guide you through every step to ensure a successful launch.
          </p>

          {/* Current Step Info */}
          <div className="card max-w-md mx-auto mb-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-accent-primary">{currentStep + 1}</span>
              </div>
              <h3 className="font-semibold text-primary-text mb-1">{stepTitles[currentStep]}</h3>
              <p className="text-sm text-secondary">{stepDescriptions[currentStep]}</p>
              
              {/* Show submission status indicator if applicable */}
              {submissionStatus && (
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(submissionStatus)}`}>
                    Status: {getStatusDisplayName(submissionStatus)}
                  </span>
                  {lastUpdated && (
                    <p className="text-xs text-secondary mt-1">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        <div className='main-content'></div>

        {/* Main Content Card */}
        <div className="card max-w-4xl mx-auto">
          <StepContent 
            step={currentStep} 
            onNextStep={handleNextStep} 
            onPrevStep={handlePrevStep}
            isVerified={isVerified}
            setIsVerified={setIsVerified}
            tokenDetails={tokenDetails}
            setTokenDetails={setTokenDetails}
            submissionStatus={submissionStatus}
            project={project}
            statusLoading={statusLoading}
          />
        </div>

        {/* Help Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h4 className="font-semibold text-primary-text mb-2">Documentation</h4>
            <p className="text-sm text-secondary mb-4">
              Learn how to create and deploy tokens on Kadena
            </p>
            <a 
              href="https://docs.kadpad.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              Read Docs
            </a>
          </div>

          <div className="card text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h4 className="font-semibold text-primary-text mb-2">Community Support</h4>
            <p className="text-sm text-secondary mb-4">
              Get help from our community and team
            </p>
            <a 
              href="https://discord.gg/3jkAcdtAxf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              Join Discord
            </a>
          </div>

          <div className="card text-center group hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛠️</span>
            </div>
            <h4 className="font-semibold text-primary-text mb-2">Development Tools</h4>
            <p className="text-sm text-secondary mb-4">
              Access our suite of development tools
            </p>
            <a 
              href="https://tools.kadena.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              Explore Tools
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for status display
const getStatusColorClasses = (status) => {
  const colorMap = {
    pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
    awaiting_fees: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    ready_to_launch: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    sales_configured: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    launched: 'bg-green-500/10 text-green-400 border border-green-500/20'
  };
  return colorMap[status] || 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
};

export default LaunchPage;
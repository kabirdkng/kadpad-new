import React, { useState, useEffect } from 'react';
import useWalletStore from '../wallet/walletStore';
import StepIndicator from '../components/launch/StepIndicator';
import CreateTokenStep from '../components/launch/CreateTokenStep';
import VerifyOwnershipStep from '../components/launch/VerifyOwnershipStep';
import ReviewSubmitStep from '../components/launch/ReviewSubmitStep';
import LaunchTokenStep from '../components/launch/LaunchTokenStep';
import { getPublicProjects } from '../api';

const StepContent = ({ step, onNextStep, onPrevStep, isVerified, setIsVerified, tokenDetails, setTokenDetails, submissionStatus, setSubmissionStatus }) => {
  const steps = [
    CreateTokenStep,
    VerifyOwnershipStep,
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
        setSubmissionStatus={setSubmissionStatus}
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
              (step === 1 && !isVerified) || (step === 2 && submissionStatus !== 'approved') 
                ? 'btn-ghost opacity-50 cursor-not-allowed' 
                : 'btn-primary'
            }`}
            disabled={(step === 1 && !isVerified) || (step === 2 && submissionStatus !== 'approved')}
          >
            Next Step →
          </button>
        )}
      </div>
    </div>
  );
};

const LaunchPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [tokenDetails, setTokenDetails] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const { account } = useWalletStore();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (tokenDetails && tokenDetails.contractAddress) {
        try {
          const response = await getPublicProjects();
          const existingProject = response.data.data.projects.find(
            project => project.namespace === tokenDetails.contractAddress.split('.')[0] && 
                       project.moduleName === tokenDetails.contractAddress.split('.')[1]
          );
          if (existingProject) {
            setSubmissionStatus(existingProject.status);
          } else {
            setSubmissionStatus(null);
          }
        } catch (error) {
          console.error('Error checking submission status:', error);
        }
      }
    };

    checkSubmissionStatus();
  }, [tokenDetails]);

  const handleNextStep = () => {
    if (currentStep === 1 && !isVerified) {
      return;
    }
    if (currentStep === 2 && submissionStatus !== 'approved') {
      return;
    }
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const stepTitles = [
    "Create Your Token",
    "Verify Ownership", 
    "Review & Submit",
    "Launch Success"
  ];

  const stepDescriptions = [
    "Start by creating your token using our recommended tools",
    "Verify that you own and control the token contract",
    "Review your details and submit for our approval process",
    "Your token is now live and ready for the community"
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
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator currentStep={currentStep} totalSteps={4} />
        </div>

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
            setSubmissionStatus={setSubmissionStatus}
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
              href="https://discord.gg/Me8k8wsd" 
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
            <h4 className="font-semibold text-primary-text mb-2">Token Tools</h4>
            <p className="text-sm text-secondary mb-4">
              Use TokenGo to create your token easily
            </p>
            <a 
              href="https://tokengo.fun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              Open TokenGo
            </a>
          </div>
        </div>

        {/* Progress Info */}
        <div className="mt-12">
          <div className="card max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-bold text-primary-text mb-4">
              Why Choose KadPad for Your Launch?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-primary-text mb-1">Fast & Secure</h4>
                <p className="text-sm text-secondary">
                  Built on Kadena's high-performance blockchain
                </p>
              </div>
              <div>
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="font-semibold text-primary-text mb-1">Expert Support</h4>
                <p className="text-sm text-secondary">
                  Our team reviews every project for quality
                </p>
              </div>
              <div>
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-primary-text mb-1">Fair Launch</h4>
                <p className="text-sm text-secondary">
                  Transparent process for all participants
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;
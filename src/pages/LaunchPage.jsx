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
    <div>
      <StepComponent 
        isVerified={isVerified} 
        setIsVerified={setIsVerified} 
        tokenDetails={tokenDetails} 
        setTokenDetails={setTokenDetails}
        submissionStatus={submissionStatus}
        setSubmissionStatus={setSubmissionStatus}
      />
      <div className="mt-8 flex justify-between items-center">
        {step > 0 && (
          <button onClick={onPrevStep} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            Previous
          </button>
        )}
        {step < steps.length - 1 && (
          <div className="ml-auto">
            <button 
              onClick={onNextStep} 
              className={`bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-300 ${
                (step === 1 && !isVerified) || (step === 2 && submissionStatus !== 'approved') ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={(step === 1 && !isVerified) || (step === 2 && submissionStatus !== 'approved')}
            >
              Next
            </button>
          </div>
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

  return (
    <div className="h-auto text-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl text-white font-bold text-center mb-8">Launch Your Token</h1>
        <StepIndicator currentStep={currentStep} totalSteps={4} />
        <div className="flex justify-center">
          <div className="bg-gray-800 bg-opacity-85 rounded-lg shadow-lg p-8 w-full max-w-4xl">
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
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;
import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ currentStep, totalSteps }) => {
  const steps = [
    { title: "Create", icon: "🚀" },
    { title: "Verify", icon: "🔒" },
    { title: "Review", icon: "📋" },
    { title: "Launch", icon: "✨" }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Desktop Step Indicator */}
      <div className="hidden md:flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${index <= currentStep 
                  ? 'bg-accent-primary border-accent-primary ' 
                  : 'bg-secondary-bg border-border-color text-secondary'
                }
              `}>
                {index < currentStep ? (
                  <Check size={20}/>
                ) : index === currentStep ? (
                  <span className="text-lg font-bold">{index + 1}</span>
                ) : (
                  <span className="text-lg">{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${index <= currentStep ? 'text-accent-primary' : 'text-secondary'}`}>
                  {step.title}
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4 transition-all duration-300
                ${index < currentStep ? 'bg-accent-primary' : 'bg-border-color'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${index <= currentStep ? 'bg-accent-primary' : 'bg-border-color'}
              `}
            />
          ))}
        </div>
        
        {/* Current Step Info */}
        <div className="text-center">
          <div className="text-sm text-secondary mb-1">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <div className="font-medium text-accent-primary">
            {steps[currentStep]?.title}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="progress-bar">
          <div 
            className="progress-fill transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-secondary mt-2">
          <span>Start</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
          <span>Launch</span>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
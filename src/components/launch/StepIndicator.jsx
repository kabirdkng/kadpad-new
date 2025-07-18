// File: src/components/launch/StepIndicator.jsx
import React from 'react';

const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full mx-1 ${
            index <= currentStep ? 'bg-lime-500' : 'bg-gray-400'
          }`}
        />
      ))}
    </div>
  );
};

export default StepIndicator;
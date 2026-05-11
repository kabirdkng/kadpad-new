import React from 'react';
import logo from '/favicon.svg';

const Loader = ({ progress = 0 }) => {
  return (
    <div className="fixed inset-0 bg-primary-bg flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo with Pulse Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-accent-primary/20 animate-ping"></div>
          <div className="relative w-24 h-24 mx-auto">
            <img 
              src={logo} 
              alt="KadPad Logo" 
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-bold text-gradient mb-2">KadPad</h1>
        <p className="text-secondary mb-8">Loading your launchpad experience</p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="progress-bar h-2 mb-4">
            <div 
              className="progress-fill h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Progress Text */}
          <div className="text-sm text-secondary">
            {progress < 30 && "Initializing..."}
            {progress >= 30 && progress < 60 && "Loading assets..."}
            {progress >= 60 && progress < 90 && "Preparing interface..."}
            {progress >= 90 && "Almost ready..."}
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-8">
          <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
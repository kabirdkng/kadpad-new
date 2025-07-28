import React from 'react';

const LoadingState = () => {
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
};

export default LoadingState;

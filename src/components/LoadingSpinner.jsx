const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-primary-bg text-primary-text flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-accent-primary mx-auto mb-4"></div>
        <p className="text-secondary">Loading amazing projects...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

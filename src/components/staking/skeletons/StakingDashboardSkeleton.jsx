const StakingDashboardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg p-6 border border-border-color">
      <div className="animate-pulse space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-14"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-18"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-10"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-14"></div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div className="bg-gray-300 dark:bg-gray-500 h-2 rounded-full w-1/3"></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-full"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboardSkeleton;

const StakingFormSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mx-auto animate-pulse"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto animate-pulse"></div>
      </div>

      {/* Amount Input */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        <div className="relative">
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="absolute right-3 top-3 h-6 bg-gray-400 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Tier Info */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-3 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    </div>
  );
};

export default StakingFormSkeleton;

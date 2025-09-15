const LeaderboardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg border border-border-color">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border-color">
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="p-4 lg:p-6 border-b border-border-color space-y-3 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded mx-auto"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="p-4 lg:p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-secondary-bg rounded-lg animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-4 h-8 bg-gray-300 dark:bg-gray-700 rounded w-24 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
};

export default LeaderboardSkeleton;

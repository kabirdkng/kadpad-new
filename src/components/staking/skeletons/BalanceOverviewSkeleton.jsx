const BalanceOverviewSkeleton = () => {
  return (
    <div className="bg-card rounded-lg p-4 lg:p-6 border border-border-color">
      <div className="animate-pulse space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        </div>

        {/* Balance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-secondary-bg rounded-lg p-4 space-y-3">
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
              </div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>

        {/* Transaction History Header */}
        <div className="pt-4 border-t border-border-color">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28"></div>
        </div>

        {/* Transaction Items */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-secondary-bg rounded">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BalanceOverviewSkeleton;

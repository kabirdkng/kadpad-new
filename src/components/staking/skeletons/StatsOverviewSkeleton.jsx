const StatsOverviewSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-lg p-3 lg:p-4 border border-border-color">
          <div className="animate-pulse">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 lg:w-5 lg:h-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-3 lg:h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 lg:w-20"></div>
            </div>
            <div className="h-5 lg:h-6 bg-gray-300 dark:bg-gray-700 rounded w-12 lg:w-16 mb-1"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverviewSkeleton;

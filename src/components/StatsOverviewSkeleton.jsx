const StatsOverviewSkeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-4 lg:gap-6 mb-12 lg:mb-16">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="card text-center animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-12 mx-auto mb-1"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mx-auto"></div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverviewSkeleton;

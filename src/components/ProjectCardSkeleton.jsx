const ProjectCardSkeleton = () => {
  return (
    <div className="card p-6 animate-pulse">
      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Project Logo Skeleton */}
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div>
            {/* Project Name Skeleton */}
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
            {/* Token Symbol Skeleton */}
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
        {/* Status Badge Skeleton */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16"></div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
          <div className="bg-gray-300 dark:bg-gray-500 h-3 rounded-full w-1/3"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-1"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12 mb-1"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-18 mb-1"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-14 mb-1"></div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-18"></div>
        </div>
      </div>

      {/* Action Button Skeleton */}
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-full"></div>
    </div>
  );
};

export default ProjectCardSkeleton;

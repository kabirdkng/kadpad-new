import ProjectCardSkeleton from './ProjectCardSkeleton';

const SkeletonSection = ({ title, count = 6 }) => {
  return (
    <section className="mb-12 lg:mb-16">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }, (_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
};

export default SkeletonSection;

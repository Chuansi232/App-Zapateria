const StatCardSkeleton = () => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg flex items-center justify-between">
      <div className="flex-grow">
        <div className="h-4 bg-white/10 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="h-8 bg-white/20 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
    </div>
  );
};

export default StatCardSkeleton;

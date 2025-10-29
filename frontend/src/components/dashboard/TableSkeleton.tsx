const TableSkeleton = () => {
  const renderRow = (key: number) => (
    <div key={key} className="flex items-center space-x-4 p-4">
      <div className="flex-1 h-4 bg-white/20 rounded animate-pulse"></div>
      <div className="flex-1 h-4 bg-white/20 rounded animate-pulse"></div>
      <div className="flex-1 h-4 bg-white/10 rounded animate-pulse"></div>
      <div className="flex-1 h-4 bg-white/20 rounded animate-pulse"></div>
    </div>
  );

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
      <div className="h-6 w-1/3 bg-white/20 rounded mb-6 animate-pulse"></div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(renderRow)}
      </div>
    </div>
  );
};

export default TableSkeleton;

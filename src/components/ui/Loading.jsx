import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "default" }) => {
  if (variant === "table") {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg card-shadow">
            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-slate-200 rounded"></div>
                <div className="w-12 h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-8 bg-slate-200 rounded"></div>
                <div className="w-24 h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "kanban") {
    return (
      <div className={cn("flex gap-6 overflow-x-auto pb-4", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80 animate-pulse">
            <div className="bg-white rounded-lg p-4 card-shadow">
              <div className="h-6 bg-slate-200 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="bg-slate-50 p-3 rounded-lg">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  );
};

export default Loading;
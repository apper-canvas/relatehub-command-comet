import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = "neutral",
  className 
}) => {
  const trendColors = {
    up: "text-success",
    down: "text-error", 
    neutral: "text-slate-500"
  };

  const trendIcons = {
    up: "TrendingUp",
    down: "TrendingDown",
    neutral: "Minus"
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-lg card-shadow hover:card-shadow-hover transition-all duration-200 transform hover:scale-[1.02]",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <ApperIcon name={icon} className="w-6 h-6 text-primary" />
        </div>
        {change && (
          <div className={cn("flex items-center text-sm font-medium", trendColors[trend])}>
            <ApperIcon name={trendIcons[trend]} className="w-4 h-4 mr-1" />
            {change}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
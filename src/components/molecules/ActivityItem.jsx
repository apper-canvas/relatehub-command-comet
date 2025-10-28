import ApperIcon from "@/components/ApperIcon";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";

const ActivityItem = ({ activity, className }) => {
  const activityIcons = {
    call: "Phone",
    email: "Mail",
    meeting: "Calendar",
    note: "FileText",
    task: "CheckSquare"
  };

  const activityColors = {
    call: "text-accent bg-accent/10",
    email: "text-primary bg-primary/10", 
    meeting: "text-warning bg-warning/10",
    note: "text-slate-600 bg-slate-100",
    task: "text-success bg-success/10"
  };

  return (
    <div className={cn("flex items-start space-x-3 py-3", className)}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        activityColors[activity.type] || activityColors.note
      )}>
        <ApperIcon 
          name={activityIcons[activity.type] || activityIcons.note} 
          className="w-4 h-4" 
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">
          {activity.subject}
        </p>
        {activity.description && (
          <p className="text-sm text-slate-600 mt-1">
            {activity.description}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default ActivityItem;
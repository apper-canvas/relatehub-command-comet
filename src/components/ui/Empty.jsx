import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  className,
  icon = "Users",
  title = "No data found",
  description = "Get started by adding your first item.",
  actionLabel = "Add New",
  onAction,
  showAction = true
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="gradient-bg p-6 rounded-full mb-6">
        <ApperIcon name={icon} className="w-12 h-12 text-slate-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-600 text-center mb-8 max-w-md">
        {description}
      </p>
      
      {showAction && onAction && (
        <Button
          onClick={onAction}
          className="flex items-center gap-2 gradient-primary text-white"
        >
          <ApperIcon name="Plus" className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;
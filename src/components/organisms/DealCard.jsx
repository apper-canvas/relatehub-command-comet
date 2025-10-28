import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const DealCard = ({ deal, contact, onEdit, onDelete }) => {
  const getProbabilityColor = (probability) => {
    if (probability >= 75) return "border-l-success bg-success/5";
    if (probability >= 50) return "border-l-warning bg-warning/5";
    return "border-l-error bg-error/5";
  };

  const getStageVariant = (stage) => {
    switch (stage) {
      case "Closed Won": return "success";
      case "Closed Lost": return "error";
      case "Negotiation": return "warning";
      case "Proposal": return "accent";
      default: return "primary";
    }
  };

  const daysInStage = Math.floor(
    (new Date() - new Date(deal.stageChangedAt)) / (1000 * 60 * 60 * 24)
  );

return (
    <div
      className={cn(
        "bg-white rounded-lg p-4 card-shadow hover:card-shadow-hover transition-all duration-200 border-l-4",
        getProbabilityColor(deal.probability)
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 truncate">{deal.title}</h3>
          {contact && (
            <p className="text-sm text-slate-600 truncate">
              {contact.firstName} {contact.lastName}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={() => onEdit && onEdit(deal)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(deal)}
            className="text-slate-400 hover:text-error p-1"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Value and Probability */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-semibold text-slate-900">
          ${deal.value.toLocaleString()}
        </span>
        <Badge variant="default" className="text-xs">
          {deal.probability}%
        </Badge>
      </div>

      {/* Stage */}
      <div className="flex items-center justify-between mb-2">
        <Badge variant={getStageVariant(deal.stage)} className="text-xs">
          {deal.stage}
        </Badge>
        <span className="text-xs text-slate-500">
          {daysInStage} day{daysInStage !== 1 ? 's' : ''} in stage
        </span>
      </div>

      {/* Expected Close Date */}
      {deal.expectedCloseDate && (
        <div className="text-xs text-slate-500 flex items-center">
          <ApperIcon name="Calendar" className="w-3 h-3 mr-1" />
          Expected: {new Date(deal.expectedCloseDate).toLocaleDateString()}
        </div>
      )}

      {/* Notes */}
      {deal.notes && (
        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
          {deal.notes}
        </p>
)}
    </div>
  );
};

export default DealCard;
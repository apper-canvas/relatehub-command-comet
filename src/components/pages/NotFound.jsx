import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto gradient-bg rounded-full flex items-center justify-center mb-6">
            <ApperIcon name="Search" className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">Page Not Found</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to a different location.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Home" className="w-4 h-4" />
              Go to Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ApperIcon name="ArrowLeft" className="w-4 h-4" />
              Go Back
            </Button>
          </div>

          <div className="text-sm text-slate-500">
            Need help? Try visiting our main sections:
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => navigate("/contacts")}
              className="text-primary hover:underline text-sm"
            >
              Contacts
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => navigate("/pipeline")}
              className="text-primary hover:underline text-sm"
            >
              Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
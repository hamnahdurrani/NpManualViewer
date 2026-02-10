import { useNavigate } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full mx-4 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}

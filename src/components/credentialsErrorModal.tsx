import {
  AlertCircle,
  WifiOff,
  XCircle,
  Link as LinkIcon,
} from "lucide-react";

interface CredentialsErrorModalProps {
  open: boolean;
  variant: "missing" | "failed";
  onClose: () => void;
  onRetry?: () => void;
}

const CredentialsErrorModal = ({
  open,
  variant,
  onClose,
  onRetry,
}: CredentialsErrorModalProps) => {
  if (!open) return null;

  const isMissing = variant === "missing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isMissing ? (
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-center mb-2">
          Authentication Failed
        </h2>

        {/* Message */}
        <p className="text-sm text-muted-foreground text-center mb-6">
        Unable to start session. Please check your credentials and try again.
        </p>

        {/* Actions */}
        <div className="flex gap-2">
            <button
              onClick={()=>window.location.reload()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Retry
            </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialsErrorModal;

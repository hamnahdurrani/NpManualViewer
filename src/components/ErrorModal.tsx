import { AlertTriangle, Wifi, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SystemErrorModalProps {
  open: boolean;
  name: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "network" | "system" | "session";
}

const ErrorModal = ({
  open,
  name,
  description,
  actionLabel = "Retry Connection",
  onAction,
  variant = "system",
}: SystemErrorModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // Wait for fade out
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible && !open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "bg-card w-full max-w-sm rounded-xl shadow-2xl border border-border p-6 transform transition-all duration-300 scale-100",
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            {variant === "network" ? (
              <Wifi className="w-6 h-6 text-destructive" />
            ) : variant === "session" ? (
              <XCircle className="w-6 h-6 text-destructive" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-destructive" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">{name}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>

          <div className="w-full pt-2">
            <button
              onClick={onAction}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;

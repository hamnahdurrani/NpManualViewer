import React from "react";
import { Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionTimeoutModalProps {
  open: boolean;
  onReconnect: () => void;
}

const SessionTimeoutModal = ({ open, onReconnect }: SessionTimeoutModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
      <div className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border animate-in zoom-in-95 duration-300">
        
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon Bubble */}
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Clock className="h-6 w-6 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold leading-6 text-foreground">
              Session Expired
            </h3>
            <p className="text-sm text-muted-foreground">
              Your session has timed out due to inactivity. Please reconnect to continue your conversation.
            </p>
          </div>

          <div className="w-full mt-4">
            <button
              onClick={onReconnect}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconnect Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;

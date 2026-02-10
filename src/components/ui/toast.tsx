import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircleFillIcon, WarningIcon, InfoIcon } from "./icons";

type ToastOptions = {
  id?: string | number;
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  dismissible?: boolean;
  onDismiss?: (toast: any) => void;
  onAutoClose?: (toast: any) => void;
  className?: string;
  style?: React.CSSProperties;
  closeButton?: boolean;
  icon?: ReactNode; // Custom icon to override default
  [key: string]: any; // Allow other sonner options
};

const iconsByType: Record<"success" | "error" | "info", ReactNode> = {
  success: <CheckCircleFillIcon />,
  error: <WarningIcon />,
  info: <InfoIcon />,
};

export function toast(props: Omit<ToastProps, "id">, options?: ToastOptions) {
  // Extract icon from options to pass to our custom component
  const { icon, ...sonnerOptions } = options || {};
  
  return sonnerToast.custom(
    (id) => <Toast description={props.description} id={id} type={props.type} icon={icon}/>,
    { ...sonnerOptions, unstyled: true} // unstyled prevents sonner from adding its own icon
  );
}

// Add individual toast methods to match sonner API
// Extract duration and id from options and pass them through
toast.success = (description: string, options?: ToastOptions) => {
  return toast({ type: "success", description }, options);
};

toast.error = (description: string, options?: ToastOptions) => {
  return toast({ type: "error", description }, options);
};

toast.info = (description: string, options?: ToastOptions) => {
  return toast({ type: "info", description }, options);
};

// Pass through all other sonner methods
toast.dismiss = sonnerToast.dismiss;
toast.message = sonnerToast.message;
toast.promise = sonnerToast.promise;
toast.loading = sonnerToast.loading;
toast.warning = (description: string, options?: ToastOptions) => {
  return toast({ type: "error", description }, options); // Use error style for warnings
};
toast.custom = sonnerToast.custom;

function Toast(props: ToastProps) {
  const { id, type, description, icon } = props;

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [multiLine, setMultiLine] = useState(false);

  // Use custom icon if provided, otherwise use default
  const displayIcon = icon || iconsByType[type];

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) {
      return;
    }

    const update = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
      const lines = Math.round(el.scrollHeight / lineHeight);
      setMultiLine(lines > 1);
    };

    update(); // initial check
    const ro = new ResizeObserver(update); // re-check on width changes
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div
        className={cn(
          "flex toast-mobile:w-fit w-full flex-row gap-3 rounded-lg bg-zinc-100 p-3 border border-zinc-200 bg-white",
          multiLine ? "items-start" : "items-center"
        )}
        data-testid="toast"
        key={id}
      >
        <div
          className={cn(
            "data-[type=error]:text-red-600 data-[type=success]:text-green-600 data-[type=info]:text-blue-600",
            { "pt-1": multiLine }
          )}
          data-type={type}
        >
          {displayIcon}
        </div>
        <div className="text-sm text-zinc-950" ref={descriptionRef}>
          {description}
        </div>
      </div>
    </div>
  );
}

type ToastProps = {
  id: string | number;
  type: "success" | "error" | "info";
  description: string;
  icon?: ReactNode;
};

import { createContext, useContext, useCallback } from "react";
import { toast as sonnerToast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const ToastContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const opts = duration ? { duration } : undefined;
    switch (type) {
      case "success":
        sonnerToast.success(message, opts);
        break;
      case "error":
        sonnerToast.error(message, opts);
        break;
      case "warning":
        sonnerToast.warning(message, opts);
        break;
      case "info":
      default:
        sonnerToast.info(message, opts);
        break;
    }
  }, []);

  const success = useCallback(
    (message, duration) => {
      sonnerToast.success(message, duration ? { duration } : undefined);
    },
    []
  );

  const error = useCallback(
    (message, duration) => {
      sonnerToast.error(message, duration ? { duration } : undefined);
    },
    []
  );

  const warning = useCallback(
    (message, duration) => {
      sonnerToast.warning(message, duration ? { duration } : undefined);
    },
    []
  );

  const info = useCallback(
    (message, duration) => {
      sonnerToast.info(message, duration ? { duration } : undefined);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <Toaster position="top-center" richColors dir="rtl" toastOptions={{ duration: 4000 }} />
    </ToastContext.Provider>
  );
};

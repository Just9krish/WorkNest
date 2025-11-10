import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export interface AlertDialogOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertDialogContextValue {
  showAlert: (options: AlertDialogOptions) => void;
  hideAlert: () => void;
  isOpen: boolean;
  options: AlertDialogOptions | null;
}

const AlertDialogContext = createContext<AlertDialogContextValue | undefined>(
  undefined
);

export function AlertDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AlertDialogOptions | null>(null);

  const showAlert = useCallback((alertOptions: AlertDialogOptions) => {
    setOptions({
      confirmText: "Confirm",
      cancelText: "Cancel",
      variant: "default",
      ...alertOptions,
    });
    setIsOpen(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsOpen(false);
    // Clear options after animation completes
    setTimeout(() => {
      setOptions(null);
    }, 200);
  }, []);

  const value = useMemo(
    () => ({
      showAlert,
      hideAlert,
      isOpen,
      options,
    }),
    [showAlert, hideAlert, isOpen, options]
  );

  return (
    <AlertDialogContext.Provider value={value}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error("useAlertDialog must be used within AlertDialogProvider");
  }
  return context;
}

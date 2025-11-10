import { useAlertDialog } from "../context/alert-dialog-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function GlobalAlertDialog() {
  const { isOpen, options, hideAlert } = useAlertDialog();

  if (!options) {
    return null;
  }

  const handleConfirm = async () => {
    if (options.onConfirm) {
      await options.onConfirm();
    }
    hideAlert();
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    hideAlert();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={open => !open && hideAlert()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description && (
            <AlertDialogDescription>
              {options.description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {options.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={options.variant || "default"}
            onClick={handleConfirm}
          >
            {options.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

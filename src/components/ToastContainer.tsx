import { useToast } from "./ToastProvider";
import { Toast } from "./Toast";

/**
 * ToastContainer — renders all active toasts in a fixed-position stack.
 *
 * Positioned top-right on desktop, top-center on mobile.
 * Wraps in an `aria-live="polite"` region for screen readers.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      <div className="pointer-events-auto m-4 flex w-full max-w-sm flex-col gap-2 sm:ml-auto sm:mr-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
}

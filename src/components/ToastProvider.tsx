import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

// ── Types ────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, options?: { type?: ToastType; duration?: number }) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 4000;

// ── Provider ─────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (message: string, options?: { type?: ToastType; duration?: number }) => {
      const { type = "info", duration = DEFAULT_DURATION } = options ?? {};

      setToasts((prev) => {
        const next = [...prev, { id: crypto.randomUUID(), message, type, duration }];
        return next.slice(-MAX_TOASTS);
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

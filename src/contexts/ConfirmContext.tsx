import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type {
  ConfirmOptions,
  ConfirmRequest,
} from "@/types/confirm";

/* ── ID helper (no external uuid dependency needed) ─────────────────── */

let _counter = 0;
function generateId(): string {
  return `cfm-${Date.now()}-${++_counter}`;
}

/* ── Context ────────────────────────────────────────────────────────── */

export interface ConfirmContextValue {
  /**
   * Show a confirmation dialog.
   * @returns Promise resolving to `true` if confirmed, `false` if cancelled.
   */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirmContext(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "useConfirmContext must be used within a ConfirmProvider"
    );
  }
  return ctx;
}

/* ── Provider ───────────────────────────────────────────────────────── */

interface ConfirmProviderProps {
  children: ReactNode;
}

export function ConfirmProvider({
  children,
}: ConfirmProviderProps): React.ReactElement {
  // Queue holds pending confirmation requests. Only the first (head) is rendered.
  const [queue, setQueue] = useState<ConfirmRequest[]>([]);

  const current = queue[0];

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      setQueue((prev) => [
        ...prev,
        {
          id: generateId(),
          resolve,
          reject,
          options,
        },
      ]);
    });
  }, []);

  const dismiss = useCallback((id: string, value: boolean) => {
    setQueue((prev) => {
      const [first, ...rest] = prev;
      if (!first || first.id !== id) return prev;
      requestFinished(first, value);
      return rest;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!current) return;
    dismiss(current.id, true);
  }, [current, dismiss]);

  const handleCancel = useCallback(() => {
    if (!current) return;
    dismiss(current.id, false);
  }, [current, dismiss]);

  const value = useMemo<ConfirmContextValue>(
    () => ({ confirm }),
    [confirm]
  );

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {current && (
        <ConfirmDialog
          title={current.options.title}
          message={current.options.message}
          confirmLabel={current.options.confirmLabel ?? "Confirm"}
          cancelLabel={current.options.cancelLabel ?? "Cancel"}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          variant={current.options.variant}
          icon={current.options.icon}
        />
      )}
    </ConfirmContext.Provider>
  );
}

function requestFinished(
  request: ConfirmRequest,
  value: boolean
): void {
  try {
    request.resolve(value);
  } catch {
    // Promise may have been garbage-collected — safe to ignore
  }
}

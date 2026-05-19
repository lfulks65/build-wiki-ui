import { useCallback, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { ConfirmOptions } from "@/types/confirm";

/* ── Variant config ───────────────────────────────────────────────── */

interface VariantStyle {
  confirmBg: string;
  confirmHover: string;
  confirmFocus: string;
  iconBg: string;
  iconBgDark: string;
  iconColor: string;
}

const VARIANT_STYLES: Record<string, VariantStyle> = {
  danger: {
    confirmBg: "bg-red-600",
    confirmHover: "hover:bg-red-700",
    confirmFocus: "focus:ring-red-500",
    iconBg: "bg-red-100",
    iconBgDark: "dark:bg-red-900/40",
    iconColor: "text-red-600",
  },
  warning: {
    confirmBg: "bg-amber-500",
    confirmHover: "hover:bg-amber-600",
    confirmFocus: "focus:ring-amber-500",
    iconBg: "bg-amber-100",
    iconBgDark: "dark:bg-amber-900/40",
    iconColor: "text-amber-600",
  },
  info: {
    confirmBg: "bg-indigo-600",
    confirmHover: "hover:bg-indigo-700",
    confirmFocus: "focus:ring-indigo-500",
    iconBg: "bg-indigo-100",
    iconBgDark: "dark:bg-indigo-900/40",
    iconColor: "text-indigo-600",
  },
};

const DEFAULT_STYLE = VARIANT_STYLES.info;

function getVariantStyle(variant?: string): VariantStyle {
  const style = VARIANT_STYLES[variant ?? ""];
  return style ?? DEFAULT_STYLE;
}

function getIconComponent(
  customIcon?: LucideIcon,
  variant?: string
): React.ComponentType<{ size?: number; className?: string }> {
  if (customIcon) return customIcon;
  switch (variant) {
    case "danger":
      return AlertTriangle;
    case "warning":
      return AlertTriangle;
    case "info":
    default:
      return Info;
  }
}

/* ── Component ─────────────────────────────────────────────────────── */

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
  icon?: LucideIcon;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = "info",
  icon,
}: ConfirmDialogProps): React.ReactElement {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const style = getVariantStyle(variant);
  const IconComponent = getIconComponent(icon, variant);

  // Focus the confirm button on mount
  useEffect(() => {
    confirmBtnRef.current?.focus();
  }, []);

  // Escape key closes dialog (cancels)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  // Focus trap: Tab between cancel and confirm
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled])'
      );
      if (!focusable?.length) return;

      const focusableArray = Array.from(focusable);
      const first = focusableArray[0];
      const last = focusableArray[focusableArray.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200 dark:bg-black/60"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900 animate-in zoom-in-95 duration-200 ease-out"
      >
        {/* Icon */}
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg} ${style.iconBgDark}`}
        >
          <IconComponent className={`h-6 w-6 ${style.iconColor}`} />
        </div>

        {/* Title */}
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirm-dialog-description"
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            className={`rounded-md ${style.confirmBg} ${style.confirmHover} px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 ${style.confirmFocus}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

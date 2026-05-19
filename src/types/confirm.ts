import type { LucideIcon } from "lucide-react";

/* ── Confirmation dialog types ────────────────────────────────────── */

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  icon?: LucideIcon;
}

export interface ConfirmRequest {
  id: string;
  resolve: (value: boolean) => void;
  reject: (reason?: unknown) => void;
  options: ConfirmOptions;
}

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import type { Toast, ToastType } from "./ToastProvider";

const TYPE_CONFIG: Record<ToastType, { icon: React.ReactNode; bar: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    bar: "bg-emerald-500",
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    bar: "bg-red-500",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    bar: "bg-indigo-500",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    bar: "bg-amber-500",
  },
};

const TYPE_TEXT_COLORS: Record<ToastType, string> = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-indigo-500",
  warning: "text-amber-500",
};

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const config = TYPE_CONFIG[toast.type];
  const textClass = TYPE_TEXT_COLORS[toast.type];
  const { id, message, duration } = toast;

  // Visual state
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  // Real-time tracking
  const startedAt = useRef(Date.now());
  const totalPausedMs = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const dismissedRef = useRef(false);
  const idRef = useRef(id);

  // Animate in on mount
  useEffect(() => {
    startedAt.current = Date.now();
    totalPausedMs.current = 0;
    pausedAtRef.current = null;
    idRef.current = id;
    requestAnimationFrame(() => setVisible(true));
    return () => {
      dismissedRef.current = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [id]);

  const tick = useCallback(() => {
    if (dismissedRef.current) return;

    if (pausedAtRef.current != null) {
      // Still paused — keep ticking to keep the RAF chain alive
      animRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = Date.now();
    const wallElapsed = now - startedAt.current;
    const actualElapsed = wallElapsed - totalPausedMs.current;
    const remainingPct = Math.max(0, ((duration - actualElapsed) / duration) * 100);

    setProgress(remainingPct);

    if (remainingPct <= 0.5) {
      animRef.current = null;
      setVisible(false);
      // Dismiss after exit animation
      const timer = setTimeout(() => {
        if (!dismissedRef.current) onDismiss(idRef.current);
      }, 300);
      return () => clearTimeout(timer);
    }

    animRef.current = requestAnimationFrame(tick);
  }, [duration, onDismiss]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [tick]);

  const handlePause = useCallback(() => {
    if (pausedAtRef.current != null) return;
    pausedAtRef.current = Date.now();
  }, []);

  const handleResume = useCallback(() => {
    if (pausedAtRef.current == null) return;
    totalPausedMs.current += Date.now() - pausedAtRef.current;
    pausedAtRef.current = null;
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      if (!dismissedRef.current) onDismiss(idRef.current);
    }, 300);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const role = toast.type === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live="polite"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      className={`
        pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg
        transition-all duration-300 ease-out
        bg-white dark:bg-gray-800
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar}`} />

      {/* Icon */}
      <div className={`flex-shrink-0 ${textClass}`}>
        {config.icon}
      </div>

      {/* Message */}
      <p className="min-w-0 flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
        {message}
      </p>

      {/* Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-full ${config.bar} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

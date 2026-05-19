import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusIndicatorProps {
  /** Whether the browser reports we are online. */
  online: boolean;
  /** Whether a connectivity check is currently in-flight. */
  checking: boolean;
  /** Number of consecutive failed ping attempts while offline. */
  failureCount: number;
  /** Manually trigger a connectivity check now. */
  checkNow: () => void;
}

/**
 * Small badge/pill shown only when offline.
 *
 * Design rationale:
 * - When online: completely invisible (zero visual noise).
 * - When offline: amber badge with pulsing dot + "Offline" text, clickable to retry.
 * - When checking: ping animation on the dot.
 * - Dark mode fully supported via Tailwind `dark:` classes.
 */
export function ConnectionStatusIndicator({
  online,
  checking,
  failureCount,
  checkNow,
}: ConnectionStatusIndicatorProps): React.ReactElement | null {
  // Only show when offline — minimal distraction when things are fine.
  if (online) return null;

  return (
    <button
      onClick={checkNow}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
      title={
        checking
          ? "Checking connection…"
          : `Offline after ${failureCount} failed attempts. Click to retry.`
      }
      aria-label={
        checking
          ? "Checking connection"
          : `Offline — ${failureCount} retry${failureCount !== 1 ? "s" : ""}. Click to retry.`
      }
    >
      {/* Status dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        {checking ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        ) : (
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${checking ? "bg-amber-500" : "bg-red-500"}`}
        />
      </span>
      {/* Label */}
      <span className="hidden sm:inline">{checking ? "Checking" : "Offline"}</span>
    </button>
  );
}

import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

/**
 * ConnectionStatusIndicator — a minimal pill showing offline status.
 *
 * - Hidden when online (zero visual noise).
 * - Shows an amber badge with pulsing dot + "Offline" text when offline.
 * - Clicking the badge triggers a manual retry check.
 * - Tooltip explains the failure count and offers a retry hint.
 *
 * Dark mode compatible via Tailwind `dark:` variants.
 */
export function ConnectionStatusIndicator(): React.ReactElement {
  const { online, failureCount, checkNow } = useConnectionStatus();

  // No visual noise when online
  if (online) {
    return <></>;
  }

  return (
    <button
      onClick={checkNow}
      disabled={!online}
      className="group flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500 transition-colors hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/20"
      title={`Offline after ${failureCount} failed attempt${failureCount !== 1 ? "s" : ""}. Click to retry.`}
      aria-label="Offline — click to retry connection check"
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400" />
      </span>
      {/* Icon */}
      <WifiOff className="h-3.5 w-3.5" />
      {/* Label */}
      <span className="hidden sm:inline">Offline</span>
    </button>
  );
}

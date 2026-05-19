import { Wifi, WifiOff } from "lucide-react";
import { useConnectionState } from "@/hooks/useConnectionStatus";

/* ── Helpers ── */
const FAILURE_THRESHOLD = 3;

function secondsSince(date: Date | null): number {
  if (!date) return Infinity;
  return (Date.now() - date.getTime()) / 1000;
}

/**
 * `ConnectionStatus` — renders the connection indicator in the header.
 *
 * - Green dot + "Connected" when API is reachable (hidden by default, shown on hover)
 * - Yellow pulsing dot when checking
 * - Red dot + "Offline" when connections are failing (always visible)
 */
export function ConnectionStatus(): React.ReactElement {
  const { online, checking, failureCount, checkNow } = useConnectionState();

  const shouldShowIndicator = failureCount > 0 || checking;

  return (
    <div
      className={`group flex items-center gap-1.5 rounded-lg px-2 py-1 transition-opacity duration-200 ${
        shouldShowIndicator
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100"
      }`}
      aria-label={online ? "Connection status: connected" : "Connection status: offline"}
    >
      {/* Checking — yellow pulsing dot */}
      {checking && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
        </span>
      )}

      {/* Connected — green dot */}
      {online && !checking && (
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
      )}

      {/* Offline — red dot, always visible when offline */}
      {!online && !checking && (
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
      )}

      {/* Label — hidden on mobile, shown on hover (connected) or always (offline) */}
      <span
        className={`hidden text-xs font-medium tabular-nums group-hover:inline-block md:inline ${
          online && !checking
            ? "text-emerald-600 dark:text-emerald-400"
            : checking
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400"
        }`}
      >
        {checking ? "Checking…" : online ? "Connected" : "Offline"}
      </span>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────

const PING_INTERVAL_MS = 30_000; // 30 seconds
const FAILURE_THRESHOLD = 3; // How many consecutive failures before showing "offline"

// ── Types ──────────────────────────────────────────────────────────

export interface ConnectionStatusResult {
  /** `true` when we believe the user is online */
  online: boolean;
  /** `true` while a connectivity check is in flight */
  checking: boolean;
  /** Number of consecutive failed ping attempts */
  failureCount: number;
  /** Manually trigger a connectivity check now */
  checkNow: () => void;
}

// ── Hook ───────────────────────────────────────────────────────────

/**
 * Hook that tracks network connectivity status.
 *
 * - Reads `navigator.onLine` for immediate browser-level status.
 * - Monitors `online`/`offline` events for quick reactivity.
 * - When online, performs a periodic ping to `window.location.origin`
 *   to detect captive portals or degraded connectivity.
 * - Counts consecutive failures; once past `FAILURE_THRESHOLD`, the
 *   hook reports `online: false`.
 *
 * @returns Status object for use in UI components.
 */
export function useConnectionStatus(): ConnectionStatusResult {
  const [online, setOnline] = useState<boolean>(() => navigator.onLine);
  const [checking, setChecking] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onlineRef = useRef(online);

  // Keep ref in sync with state
  onlineRef.current = online;

  // ── Ping function ──────────────────────────────────────────────

  const ping = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5_000);

      await fetch(window.location.origin, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Periodic ping (only when online) ───────────────────────────

  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!onlineRef.current) return;

    timerRef.current = setInterval(async () => {
      const ok = await ping();
      if (!ok) {
        setFailureCount((prev) => prev + 1);
      } else {
        setFailureCount(0);
      }
    }, PING_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [ping]);

  // ── Browser online/offline events ──────────────────────────────

  useEffect(() => {
    const handleOnline = (): void => {
      setOnline(true);
      setFailureCount(0);
    };

    const handleOffline = (): void => {
      setOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Derived online status ──────────────────────────────────────

  const effectiveOnline = online && failureCount < FAILURE_THRESHOLD;

  // ── Manual check ───────────────────────────────────────────────

  const checkNow = useCallback(async () => {
    setChecking(true);
    try {
      const ok = await ping();
      if (!ok) {
        setFailureCount((prev) => prev + 1);
      } else {
        setFailureCount(0);
        setOnline(true);
      }
    } finally {
      setChecking(false);
    }
  }, [ping]);

  // Update online state based on failure count
  useEffect(() => {
    setOnline((prev) => {
      if (failureCount >= FAILURE_THRESHOLD) return false;
      if (prev && failureCount < FAILURE_THRESHOLD) return true;
      return prev;
    });
  }, [failureCount]);

  // Expose effective online (failure-aware)
  const resultOnline = failureCount >= FAILURE_THRESHOLD ? false : online;

  return {
    online: resultOnline,
    checking,
    failureCount,
    checkNow,
  };
}

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks browser online/offline state and optionally pings a URL to
 * verify actual connectivity (since `navigator.onLine` can lie when
 * WiFi is up but the internet is down).
 *
 * When offline, clicking the indicator calls `checkNow` to re-ping.
 *
 * Usage:
 *   const { online, checking, failureCount, checkNow } = useConnectionStatus();
 */

interface UseConnectionStatusOptions {
  /** URL to ping for a connectivity check (default: "/" — same origin). */
  pingUrl?: string;
  /** Interval in ms between periodic checks when online (0 = disabled). */
  checkInterval?: number;
}

export function useConnectionStatus({
  pingUrl = "/",
  checkInterval = 60_000,
}: UseConnectionStatusOptions = {}): {
  /** Whether the browser reports we are online. */
  online: boolean;
  /** Whether a connectivity check is currently in-flight. */
  checking: boolean;
  /** Number of consecutive failed ping attempts while offline. */
  failureCount: number;
  /** Manually trigger a connectivity check now. */
  checkNow: () => void;
} {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [checking, setChecking] = useState<boolean>(false);
  const [failureCount, setFailureCount] = useState<number>(0);

  // Keep a mutable ref to the latest pingUrl so the check callback always
  // uses the current value without re-subscribing.
  const pingUrlRef = useRef(pingUrl);
  pingUrlRef.current = pingUrl;

  const checkNow = useCallback(() => {
    setChecking(true);
    fetch(pingUrlRef.current, {
      method: "HEAD",
      cache: "no-store",
    })
      .then((res) => {
        if (res.ok) {
          setOnline(true);
          setFailureCount(0);
        } else {
          // Server returned an error but we *are* connected.
          setOnline(true);
          setFailureCount(0);
        }
      })
      .catch(() => {
        setOnline(false);
        setFailureCount((c) => c + 1);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  useEffect(() => {
    // Listen for browser-level online/offline transitions.
    const handleOnline = () => {
      setOnline(true);
      setFailureCount(0);
    };
    const handleOffline = () => {
      setOnline(false);
      setFailureCount((c) => c + 1);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Periodically check connectivity when online (catches "WiFi but no internet").
  useEffect(() => {
    if (checkInterval <= 0) return;

    const interval = setInterval(() => {
      checkNow();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval, checkNow]);

  return { online, checking, failureCount, checkNow };
}

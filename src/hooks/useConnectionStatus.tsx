import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const FAILURE_THRESHOLD = 3; // only show after 3+ consecutive failures
const CHECK_INTERVAL_ONLINE = 5 * 60 * 1000; // 5 minutes when online
const CHECK_INTERVAL_OFFLINE = 30_000; // 30 seconds when offline

export interface ConnectionState {
  online: boolean;
  checking: boolean;
  lastChecked: Date | null;
  failureCount: number;
  checkNow: () => void;
}

const ConnectionContext = createContext<ConnectionState | null>(null);

function useConnectionState(): ConnectionState {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error("useConnectionState must be used within ConnectionProvider");
  return ctx;
}

/**
 * `ConnectionProvider` — monitors connectivity and broadcasts state
 * to all consumers (Layout banner, Header indicator, etc.).
 */
export function ConnectionProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [failureCount, setFailureCount] = useState(0);

  const onlineRef = useRef(online);
  onlineRef.current = online;

  const checkOnline = useCallback(async () => {
    setChecking(true);
    setLastChecked(new Date());

    if (!navigator.onLine) {
      setFailureCount((prev) => prev + 1);
      setOnline(false);
      setChecking(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);

      await fetch("/", {
        method: "HEAD",
        mode: "same-origin",
        cache: "no-cache",
        signal: controller.signal,
      });

      clearTimeout(timeout);
      setFailureCount(0);
      setOnline(true);
    } catch {
      setFailureCount((prev) => prev + 1);
      setOnline(false);
    } finally {
      setChecking(false);
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkOnline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setFailureCount(0);
      setLastChecked(new Date());
      checkOnline();
    };
    const handleOffline = () => {
      setOnline(false);
      setFailureCount((prev) => prev + 1);
      setLastChecked(new Date());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkOnline]);

  // Periodic re-check
  useEffect(() => {
    const interval = onlineRef.current ? CHECK_INTERVAL_ONLINE : CHECK_INTERVAL_OFFLINE;
    const timer = setInterval(checkOnline, interval);
    return () => clearInterval(timer);
  }, [checkOnline]);

  return (
    <ConnectionContext.Provider value={{ online, checking, lastChecked, failureCount, checkNow: checkOnline }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export { useConnectionState };

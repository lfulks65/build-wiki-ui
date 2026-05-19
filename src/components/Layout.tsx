import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, type NavItem } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ConnectionProvider, useConnectionState } from "@/hooks/useConnectionStatus";
import { RotateCw } from "lucide-react";

/* ── Offline banner — rendered inside provider so it can read state ── */
function OfflineBanner(): React.ReactElement | null {
  const { online, failureCount, lastChecked, checkNow } = useConnectionState();

  const shouldShow =
    !online && failureCount >= 3 && lastChecked &&
    (Date.now() - lastChecked.getTime()) > 3_000;

  if (!shouldShow) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-md dark:bg-amber-600">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          ⚠️
        </span>
        <span className="whitespace-nowrap">
          You&apos;re offline. Some features may be unavailable.
        </span>
      </div>
      <button
        onClick={checkNow}
        className="flex items-center gap-1 rounded-md bg-white/20 px-3 py-1 text-sm font-semibold transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <RotateCw size={14} />
        Retry
      </button>
    </div>
  );
}

interface LayoutProps {
  navItems?: NavItem[];
  children?: ReactNode;
}

export function Layout({ navItems, children }: LayoutProps): React.ReactElement {
  return (
    <ConnectionProvider>
      <OfflineBanner />
      <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        {/* ── Sidebar (fixed left) ── */}
        <Sidebar navItems={navItems} />

        {/* ── Main area ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* ── Header (sticky top, offset when banner is visible) ── */}
          <Header />

          {/* ── Scrollable content ── */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="mx-auto w-full max-w-5xl">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </ConnectionProvider>
  );
}

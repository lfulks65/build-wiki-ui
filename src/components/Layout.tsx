import { useRef, type ReactNode } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { Sidebar, type NavItem } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export interface LayoutProps {
  navItems?: NavItem[];
  children?: ReactNode;
}

export function Layout({ navItems, children }: LayoutProps): React.ReactElement {
  const location = useLocation();
  const hasNavigated = useRef(false);

  // After first render, mark that we have navigated
  // This prevents animation on the initial page load
  if (!hasNavigated.current) {
    hasNavigated.current = true;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* ── Sidebar (fixed left) ── */}
      <Sidebar navItems={navItems} />

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Header (sticky top) ── */}
        <Header />

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto w-full max-w-5xl">
            {/* key triggers React remount on route change → animation fires */}
            <div key={location.pathname}>
              {hasNavigated.current ? (
                <div className="animate-page-enter">
                  {children || <Outlet />}
                </div>
              ) : (
                children || <Outlet />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

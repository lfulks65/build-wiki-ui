import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useRouteFocus } from "@/components/SkipLink";
import { Sidebar, type NavItem } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export interface LayoutProps {
  navItems?: NavItem[];
  children?: ReactNode;
}

export function Layout({ navItems, children }: LayoutProps): React.ReactElement {
  useRouteFocus();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* ── Sidebar (fixed left) ── */}
      <Sidebar navItems={navItems} />

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Header (sticky top) ── */}
        <Header />

        {/* ── Scrollable content ── */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          tabIndex={-1}
        >
          <div className="mx-auto w-full max-w-5xl">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

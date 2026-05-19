import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export function Layout(): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>

        {/* ── Mobile bottom nav ── */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

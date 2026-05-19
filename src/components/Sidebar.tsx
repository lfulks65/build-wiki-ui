import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Folder,
  Search,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────── */

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SidebarProps {
  navItems?: NavItem[];
}

/* ── Default navigation items ─────────────────────────────────────── */

const defaultNavItems: NavItem[] = [
  { label: "Pages", path: "/pages", icon: BookOpen },
  { label: "Assets", path: "/assets", icon: Folder },
  { label: "Search", path: "/search", icon: Search },
  { label: "Curator", path: "/curator", icon: Bot },
  { label: "Settings", path: "/settings", icon: Settings },
];

/* ── Tooltip wrapper ─────────────────────────────────────────────── */

function Tooltip({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative">
      {children}
      {show && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-50 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white shadow-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        >
          {children}
        </span>
      )}
    </span>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export function Sidebar({ navItems = defaultNavItems }: SidebarProps): React.ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navWidthClass = collapsed ? "w-16" : "w-64";

  return (
    <>
      {/* ── Mobile hamburger overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-white text-gray-900
          border-r border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800
          transition-all duration-300 ease-in-out
          ${navWidthClass}
          lg:relative lg:z-auto
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── Logo / title ── */}
        <div
          className={`
            flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-800
            ${collapsed ? "justify-center" : "justify-between"}
          `}
        >
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              Wiki
            </span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* ── Nav items ── */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Tooltip show={collapsed}>
                    <NavLink
                      to={item.path}
                      end={item.path === "/pages" || item.path === "/search" || item.path === "/assets" || item.path === "/curator" || item.path === "/settings"}
                      className={({ isActive }) =>
                        [
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                          isActive
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                          collapsed ? "justify-center" : "",
                        ].join(" ")
                      }
                    >
                      <Icon size={20} className={collapsed ? "" : "shrink-0"} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Collapse / expand toggle ── */}
        <div className="border-t border-gray-200 p-2 dark:border-gray-800">
          <Tooltip show={collapsed}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`
                flex h-9 w-full items-center justify-center rounded-md
                text-gray-500 transition-colors duration-150
                hover:bg-gray-100 hover:text-gray-700
                dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200
              `}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <div className="flex w-full items-center justify-between px-3">
                  <span className="text-sm font-medium">Collapse</span>
                  <ChevronLeft size={18} />
                </div>
              )}
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
}

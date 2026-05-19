import { NavLink } from "react-router-dom";
import { BookOpen, Search, Bot, Settings } from "lucide-react";

export function MobileBottomNav() {
  const items = [
    { label: "Pages", path: "/pages", icon: BookOpen },
    { label: "Search", path: "/search", icon: Search },
    { label: "Curator", path: "/curator", icon: Bot },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-gray-200 bg-white/95 backdrop-blur-sm safe-area-bottom lg:hidden dark:border-gray-800 dark:bg-gray-900/95">
      {items.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400"
            }`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { Star, FileText, ChevronDown } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

const DISPLAY_LIMIT = 8;

/* ── Component ─────────────────────────────────────────────────────── */

/**
 * Quick-access favorites section in the sidebar.
 *
 * - Section header: "Favorites" with star icon, collapsible
 * - List of favorited pages with file icon, click navigates
 * - Empty state collapsed by default
 * - Truncates long titles, shows tooltip on hover
 * - Maximum 8 displayed; "View all" link if more
 */
export function FavoritesList(): React.ReactElement | null {
  const { favorites } = useFavorites();
  const [open, setOpen] = useState(favorites.length > 0);

  // Sort by most recently added (already done by the hook, but ensure)
  const sorted = useMemo(() => {
    return [...favorites].sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );
  }, [favorites]);

  const displayItems = sorted.slice(0, DISPLAY_LIMIT);
  const hasMore = sorted.length > DISPLAY_LIMIT;

  // Collapsed when empty
  if (!open && favorites.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      {/* Separator line above */}
      <div className="h-px bg-gray-200 dark:bg-gray-800" />

      {/* Section header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`
          flex w-full items-center gap-2 px-3 py-2 text-left
          text-xs font-semibold uppercase tracking-wider text-gray-400
          hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400
          transition-colors duration-150
        `}
        aria-expanded={open}
      >
        <Star size={12} className="text-indigo-500 flex-shrink-0" />
        <span className="flex-1 truncate">Favorites</span>
        <span className="text-[10px] text-gray-400">
          {favorites.length}
        </span>
        <ChevronDown
          size={12}
          className={`
            transition-transform duration-200
            ${open ? "" : "-rotate-90"}
          `}
        />
      </button>

      {/* List */}
      {open && (
        <ul
          className={`
            overflow-hidden transition-[max-height] duration-300 ease-in-out
            ${open ? "max-h-[600px]" : "max-h-0"}
          `}
        >
          {favorites.length === 0 ? (
            <li className="px-3 py-2">
              <p className="text-[11px] text-gray-400 dark:text-gray-600 italic">
                Star pages for quick access
              </p>
            </li>
          ) : (
            <>
              {displayItems.map((fav) => (
                <li key={fav.slug}>
                  <NavLink
                    to={`/pages/${fav.slug}`}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                      ].join(" ")
                    }
                  >
                    <FileText
                      size={14}
                      className="flex-shrink-0 text-gray-400 group-hover:text-indigo-500 dark:text-gray-500 dark:group-hover:text-indigo-400"
                    />
                    <span
                      className="truncate"
                      title={fav.title}
                    >
                      {fav.title}
                    </span>
                  </NavLink>
                </li>
              ))}

              {hasMore && (
                <li>
                  <NavLink
                    to="/favorites"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    <span>View all ({favorites.length})</span>
                  </NavLink>
                </li>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  );
}

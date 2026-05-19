import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Star,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  BookmarkPlus,
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

/* ── Types ─────────────────────────────────────────────────────────── */

type SortKey = "added" | "alpha" | "modified";

const SORT_LABELS: Record<SortKey, string> = {
  added: "Recently Added",
  alpha: "Alphabetical",
  modified: "Recently Modified",
};

/* ── Component ─────────────────────────────────────────────────────── */

/**
 * Full page showing all favorites at /favorites.
 */
export function FavoritesPage(): React.ReactElement {
  const { favorites, removeFavorite } = useFavorites();
  const [sortKey, setSortKey] = useState<SortKey>("added");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Set breadcrumbs: Pages > Starred
  useBreadcrumbs();

  const sortedFavorites = useMemo(() => {
    const list = [...favorites];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "added":
          cmp = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case "alpha":
          cmp = a.title.localeCompare(b.title);
          break;
        case "modified":
          // No modified date on favorites, fallback to addedAt
          cmp = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [favorites, sortKey, sortDir]);

  const handleToggleSort = () => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const handleRemove = (slug: string) => {
    removeFavorite(slug);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Star size={22} className="text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Starred Pages
          </h1>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {favorites.length}
          </span>
        </div>

        {/* Sort controls */}
        {favorites.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((s) => !s)}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{SORT_LABELS[sortKey]}</span>
              {sortDir === "asc" ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortKey(key);
                        setShowSortMenu(false);
                      }}
                      className={`
                        flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700
                        ${sortKey === key
                          ? "font-semibold text-indigo-700 dark:text-indigo-300"
                          : "text-gray-700 dark:text-gray-300"
                        }
                      `}
                    >
                      <span>{SORT_LABELS[key]}</span>
                      {sortKey === key && (
                        <span className="text-indigo-500">●</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <button
                    onClick={handleToggleSort}
                    className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    {sortDir === "asc" ? (
                      <>
                        <ArrowUp className="h-3 w-3" />
                        A → Z / Newest first
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-3 w-3" />
                        Z → A / Oldest first
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center dark:border-gray-600">
          <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
            <BookmarkPlus className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            No starred pages yet
          </p>
          <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
            Click the star icon on any page to add it here.
          </p>
          <NavLink
            to="/pages"
            className="mt-4 flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <FileText className="h-3.5 w-3.5" />
            Browse Pages
          </NavLink>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFavorites.map((fav) => (
            <div
              key={fav.slug}
              className={`
                group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all
                hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm
                dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700 dark:hover:bg-gray-800
              `}
            >
              {/* Star icon */}
              <div className="mt-0.5 flex-shrink-0">
                <Star
                  size={18}
                  className="fill-indigo-500 text-indigo-500"
                  style={{
                    filter: "drop-shadow(0 0 3px rgba(99,102,241,0.4))",
                  }}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <NavLink
                  to={`/pages/${fav.slug}`}
                  className="truncate text-sm font-semibold text-gray-900 hover:text-indigo-700 dark:text-gray-100 dark:hover:text-indigo-300"
                >
                  {fav.title}
                </NavLink>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  Added{" "}
                  {new Date(fav.addedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(fav.slug)}
                className="flex-shrink-0 rounded-md p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                aria-label={`Remove ${fav.title} from favorites`}
                title="Remove from favorites"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

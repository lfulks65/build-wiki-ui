import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { useBreadcrumbs, type Breadcrumb } from "@/hooks/useBreadcrumbs";

// ── Constants ──────────────────────────────────────────────────────

/** Maximum visible breadcrumb items on mobile before collapsing. */
const MOBILE_MAX_VISIBLE = 2;

// ── Component ──────────────────────────────────────────────────────

/**
 * Breadcrumb navigation component.
 *
 * - Dynamically renders a breadcrumb trail based on the current route.
 * - The last crumb is plain text (current page); all others are clickable links.
 * - On mobile (< md breakpoint), overflow items are collapsed behind a "…"
 *   dropdown that reveals the hidden crumbs.
 * - Keyboard accessible: Tab through links, Escape closes dropdown.
 */
export function Breadcrumbs(): React.ReactElement | null {
  const crumbs = useBreadcrumbs();

  // Nothing to render when we're at the root
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <BreadcrumbList crumbs={crumbs} />
    </nav>
  );
}

// ── Internal: breadcrumb list ──────────────────────────────────────

function BreadcrumbList({ crumbs }: { crumbs: Breadcrumb[] }) {
  // On mobile we collapse everything except the first + last items
  // when there are more than MOBILE_MAX_VISIBLE crumbs.
  const shouldCollapse = crumbs.length > MOBILE_MAX_VISIBLE;

  // visible crumbs on desktop: everything
  // visible crumbs on mobile: first + last (if collapsed)
  const desktopCrumbs = crumbs;

  // Mobile: show first item, then "...", then last item
  const mobileFirst = crumbs[0];
  const mobileHidden = crumbs.slice(1, -1);
  const mobileLast = crumbs[crumbs.length - 1];

  return (
    <>
      {/* ── Desktop (md+) ── */}
      <ol className="hidden items-center md:flex" aria-label="Breadcrumb">
        {desktopCrumbs.map((crumb, i) => (
          <Fragment key={`${crumb.label}-${i}`}>
            {i > 0 && <ChevronRight size={14} className="mx-2 text-gray-400" aria-hidden />}
            <li>
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="text-gray-900 dark:text-gray-100 font-medium"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>

      {/* ── Mobile (< md) ── */}
      {shouldCollapse ? (
        <ol className="flex items-center md:hidden" aria-label="Breadcrumb">
          {/* First crumb */}
          <li>
            {mobileFirst.path ? (
              <Link
                to={mobileFirst.path}
                className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
              >
                {mobileFirst.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
                {mobileFirst.label}
              </span>
            )}
          </li>

          {/* Collapsed "..." dropdown */}
          <ChevronRight size={14} className="mx-2 text-gray-400" aria-hidden />
          <li>
            <CollapsedCrumbs hidden={mobileHidden} />
          </li>

          {/* Last crumb */}
          <ChevronRight size={14} className="mx-2 text-gray-400" aria-hidden />
          <li>
            {mobileLast.path ? (
              <Link
                to={mobileLast.path}
                className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-150"
              >
                {mobileLast.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
                {mobileLast.label}
              </span>
            )}
          </li>
        </ol>
      ) : (
        <ol className="flex items-center md:hidden" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <Fragment key={`m-${crumb.label}-${i}`}>
              {i > 0 && <ChevronRight size={14} className="mx-2 text-gray-400" aria-hidden />}
              <li>
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      )}
    </>
  );
}

// ── Internal: collapsed crumbs dropdown ────────────────────────────

function CollapsedCrumbs({ hidden }: { hidden: Breadcrumb[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, handleClickOutside]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded px-1"
        aria-expanded={open}
        aria-label="Show hidden breadcrumbs"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
          role="menu"
        >
          {hidden.map((crumb, i) => (
            <div key={`${crumb.label}-${i}`} role="menuitem">
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors duration-150"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="block px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

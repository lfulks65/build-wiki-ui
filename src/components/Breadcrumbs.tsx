import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { useBreadcrumbs, type Breadcrumb } from "@/hooks/useBreadcrumbs";

// ── Constants ──────────────────────────────────────────────────────

/** Minimum crumbs to trigger mobile collapse: first + last 2 = 3 visible. */
const MOBILE_COLLAPSE_THRESHOLD = 3;

// ── Component ──────────────────────────────────────────────────────

/**
 * Breadcrumb navigation component.
 *
 * - Dynamically renders a breadcrumb trail based on the current route.
 * - The last crumb is plain text (current page); all others are clickable links.
 * - On mobile (< md breakpoint), overflow items are collapsed behind a "…"
 *   dropdown that reveals the hidden crumbs.  Keeps first + last 2 visible.
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
  // On mobile we collapse everything between the first and last 2 items
  // when there are more than MOBILE_COLLAPSE_THRESHOLD crumbs.
  const shouldCollapse = crumbs.length > MOBILE_COLLAPSE_THRESHOLD;

  // ── Desktop (md+) — show everything ──
  return (
    <>
      <ol className="hidden items-center md:flex" aria-label="Breadcrumb desktop">
        {crumbs.map((crumb, i) => (
          <Fragment key={`d-${i}`}>
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
        <ol className="flex items-center md:hidden" aria-label="Breadcrumb mobile">
          {/* First crumb (always visible) */}
          <li>
            <CrumbLink crumb={crumbs[0]} />
          </li>

          {/* Chevron before collapse */}
          <ChevronRight size={14} className="mx-2 text-gray-400" aria-hidden />

          {/* Collapsed "..." dropdown */}
          <li>
            <CollapsedCrumbs hidden={crumbs.slice(1, -2)} />
          </li>

          {/* Chevron after collapse */}
          <ChevronRight size={14} className="mx-2 text-gray-400" aria-hidden />

          {/* Last 2 crumbs always visible */}
          {crumbs.slice(-2).map((crumb, i) => (
            <Fragment key={`m-last-${i}`}>
              {i > 0 && <ChevronRight size={14} className="mx-2 text-gray-400" aria-hidden />}
              <li>
                <CrumbLink crumb={crumb} />
              </li>
            </Fragment>
          ))}
        </ol>
      ) : (
        <ol className="flex items-center md:hidden" aria-label="Breadcrumb mobile">
          {crumbs.map((crumb, i) => (
            <Fragment key={`m-all-${i}`}>
              {i > 0 && <ChevronRight size={14} className="mx-2 text-gray-400" aria-hidden />}
              <li>
                <CrumbLink crumb={crumb} />
              </li>
            </Fragment>
          ))}
        </ol>
      )}
    </>
  );
}

// ── Internal: single crumb link or plain text ──────────────────────

function CrumbLink({ crumb }: { crumb: Breadcrumb }) {
  if (crumb.path) {
    return (
      <Link
        to={crumb.path}
        className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
      >
        {crumb.label}
      </Link>
    );
  }
  return (
    <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">
      {crumb.label}
    </span>
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

  if (hidden.length === 0) return null;

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

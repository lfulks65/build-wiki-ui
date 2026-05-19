import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { useScrollSpy } from '@/hooks/useScrollSpy';

/* ── Types ──────────────────────────────────────────────────────────── */

interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
  children: HeadingItem[];
}

/* ── Helpers ────────────────────────────────────────────────────────── */

/** Turn heading text into a URL-safe slug ID. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Parse ## and ### headings from markdown into a nested list. */
function parseHeadings(markdown: string): HeadingItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const raw: Array<{ level: 2 | 3; text: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length === 2 ? 2 : 3;
    raw.push({ level, text: match[2].trim() });
  }

  if (raw.length < 2) return []; // Need at least 3 headings total

  const result: HeadingItem[] = [];
  for (const h of raw) {
    const item: HeadingItem = {
      id: slugify(h.text),
      text: h.text,
      level: h.level,
      children: [],
    };

    if (h.level === 2 || result.length === 0) {
      result.push(item);
    } else {
      // h.level === 3 → attach to previous H2
      const parent = result[result.length - 1];
      parent.children.push(item);
    }
  }

  return result;
}

/* ── Component ──────────────────────────────────────────────────────── */

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export default function TableOfContents({
  content,
  className = '',
}: TableOfContentsProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  const headings = useMemo(() => parseHeadings(content), [content]);

  // Collect all IDs for the scrollspy
  const allIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (items: HeadingItem[]) => {
      for (const h of items) {
        ids.push(h.id);
        walk(h.children);
      }
    };
    walk(headings);
    return ids;
  }, [headings]);

  const activeId = useScrollSpy(allIds, {
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0.1,
  });

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Smooth-scroll to a heading element. */
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Close mobile overlay on selection
    setMobileOpen(false);

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update URL hash without jumping
    history.replaceState(null, '', `#${id}`);
  }, []);

  // Don't render anything when there are fewer than 3 headings
  if (headings.length < 2) return null;

  /* ── Inner nav tree ─────────────────────────────────────────────── */

  function NavTree({
    items,
    depth = 0,
  }: {
    items: HeadingItem[];
    depth?: number;
  }) {
    return (
      <ul className="space-y-1">
        {items.map((h) => {
          const isCollapsed = collapsed.has(h.id);
          const isActive = activeId === h.id;
          const hasChildren = h.children.length > 0;

          return (
            <li key={h.id}>
              <div className="group flex items-center">
                {/* Collapse toggle for H2 with children */}
                {hasChildren && h.level === 2 ? (
                  <button
                    onClick={() => toggleCollapse(h.id)}
                    className="mr-1 flex h-5 w-5 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
                  >
                    {isCollapsed ? (
                      <ChevronRight size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                ) : (
                  <span className="mr-1 w-5" /> /* spacer */
                )}

                <button
                  onClick={() => scrollTo(h.id)}
                  className={`
                    flex w-full items-center gap-1.5 rounded-md px-2 py-1.5
                    text-left transition-all duration-150
                    ${
                      h.level === 3
                        ? 'pl-5 text-sm text-gray-600 dark:text-gray-400'
                        : 'text-sm text-gray-700 dark:text-gray-300'
                    }
                    ${
                      isActive
                        ? 'border-l-2 border-indigo-600 font-medium text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                        : 'border-l-2 border-transparent hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }
                  `}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {h.text}
                </button>
              </div>

              {/* Render children when not collapsed */}
              {hasChildren && h.level === 2 && !isCollapsed && (
                <NavTree items={h.children} depth={depth + 1} />
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  /* ── Mobile overlay ─────────────────────────────────────────────── */

  return (
    <>
      {/* Floating toggle button (mobile only) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 shadow-lg text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:focus:ring-offset-gray-950 lg:hidden"
        aria-label="Open table of contents"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white dark:bg-gray-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              On this page
            </h2>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Close table of contents"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable nav */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <NavTree items={headings} />
          </div>
        </div>
      )}

      {/* Desktop sidebar (hidden on mobile) */}
      <aside
        className={`
          hidden lg:block
          sticky top-0 h-[calc(100vh-4rem)]
          overflow-y-auto
          border-l border-gray-200 bg-white/80
          dark:border-gray-800 dark:bg-gray-950/80
          backdrop-blur-sm
          transition-colors
          ${className}
        `}
      >
        <div className="px-4 py-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            On this page
          </h2>
          <NavTree items={headings} />
        </div>
      </aside>
    </>
  );
}

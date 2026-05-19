/** Expandable row component with animated height transition. */

import { ReactNode, useRef, useState, useEffect } from 'react';

export interface ExpandableRowProps {
  /** The collapsed / summary view shown when the row is closed. */
  summary: ReactNode;
  /** The detail content revealed on expansion. */
  children: ReactNode;
  /** Whether the row starts open. Defaults to `false`. */
  defaultOpen?: boolean;
}

/** Animated expand / collapse container. */
export default function ExpandableRow({
  summary,
  children,
  defaultOpen = false,
}: ExpandableRowProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(defaultOpen ? 9999 : 0);

  useEffect(() => {
    if (contentRef.current) {
      const h = isOpen ? contentRef.current.scrollHeight : 0;
      setHeight(h);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const toggle = () => setIsOpen((o) => !o);

  return (
    <div className="border border-gray-200 dark:border-gray-700/60 rounded-lg overflow-hidden transition-shadow hover:shadow-sm">
      {/* Summary row (clickable) */}
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center transition-transform duration-200 text-gray-400">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
        <span className="flex-1">{summary}</span>
      </button>

      {/* Expandable details */}
      <div
        ref={contentRef}
        style={{ height: isOpen ? height : 0, overflow: 'hidden' }}
        className="transition-[height] duration-200 ease-out"
      >
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-sm border-t border-gray-200 dark:border-gray-700/60">
          {children}
        </div>
      </div>
    </div>
  );
}

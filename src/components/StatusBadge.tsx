/** Status badge component for the Curator Dashboard.

 * Maps human-readable status strings to colour-coded badges. */

type Size = 'sm' | 'md';

const statusStyles: Record<string, { bg: string; text: string }> = {
  // Green
  running: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  ready: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  active: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  // Amber
  processing: {
    bg: 'bg-amber-50 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
  },
  queued: {
    bg: 'bg-amber-50 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
  },
  // Gray
  idle: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-300',
  },
  paused: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-300',
  },
  // Red
  failed: {
    bg: 'bg-red-50 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
  },
  stopped: {
    bg: 'bg-red-50 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
  },
  // Indigo
  done: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/40',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  completed: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/40',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
};

// Default fallback styles
const defaultStyle = {
  bg: 'bg-gray-100 dark:bg-gray-700',
  text: 'text-gray-600 dark:text-gray-300',
};

export type { Size };

/** Capitalise the first letter and lower-case the rest. */
function titleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Props for {@link StatusBadge}. */
export interface StatusBadgeProps {
  /** The status string to display (e.g. "running", "failed"). */
  status: string;
  /** Badge size. Defaults to `'md'`. */
  size?: Size;
}

/** A colour-coded badge showing a status value. */
export default function StatusBadge({
  status,
  size = 'md',
}: StatusBadgeProps): JSX.Element {
  const key = status.toLowerCase().trim();
  const style = statusStyles[key] ?? defaultStyle;
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`${padding} ${style.bg} ${style.text} font-medium rounded-full inline-flex items-center whitespace-nowrap`}
    >
      {titleCase(status)}
    </span>
  );
}

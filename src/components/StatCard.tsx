/** Reusable stat card for the Curator Dashboard. */

import { ReactNode, useCallback, useMemo } from 'react';

export interface StatCardProps {
  /** Label shown below the value. */
  label: string;
  /** The main number / value to display. */
  value: number | string;
  /** Optional SVG icon rendered at the top of the card. */
  icon?: ReactNode;
  /** Percentage trend. Prepend `'+'` or `'-'` in the string.
   *  Positive trends get green, negative get red. */
  trend?: string;
  /** When `true`, show a skeleton placeholder instead of the value. */
  loading?: boolean;
  /** Optional click handler — makes the card interactive with hover effects. */
  onClick?: () => void;
}

/** An SVG chevron-up. */
function ChevronUp(): JSX.Element {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

/** An SVG chevron-down. */
function ChevronDown(): JSX.Element {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/** Animated skeleton bar — matches the card layout. */
function SkeletonBar({ width = 'w-12' }: { width?: string }): JSX.Element {
  return (
    <div
      className={`h-9 ${width} rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse bg-[length:200%_100%]`}
      style={{ animationDuration: '1.5s' }}
    />
  );
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  loading = false,
  onClick,
}: StatCardProps): JSX.Element {
  const isPositive = trend !== undefined && trend.startsWith('+');
  const isNegative = trend !== undefined && trend.startsWith('-');
  const clickable = typeof onClick === 'function';

  // Use useCallback for stable event handler reference
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Build dynamic classes
  const baseClasses = useMemo(() => {
    const base = 'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/60 p-5 transition-all duration-200';
    if (clickable) {
      return `${base} hover:scale-[1.02] hover:shadow-md cursor-pointer`;
    }
    return `${base} hover:scale-[1.02] hover:shadow-md`;
  }, [clickable]);

  const iconClasses = useMemo(() => {
    const base = 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors';
    return clickable ? `${base}` : base;
  }, [clickable]);

  if (loading) {
    return (
      <div className={baseClasses}>
        <div className="flex items-center justify-between mb-3">
          <span className={iconClasses}>{icon}</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-400 dark:text-gray-500">
            <SkeletonBar width="w-10" />
          </span>
        </div>
        <SkeletonBar />
        <div className="text-sm text-gray-300 dark:text-gray-600 mt-0.5">
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group ${baseClasses}`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); } : undefined}
    >
      {/* Icon + label row */}
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <span className={iconClasses}>
            {icon}
          </span>
        )}
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : isNegative
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {isPositive ? <ChevronUp /> : isNegative ? <ChevronDown /> : null}
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        {value}
      </div>

      {/* Label */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
}

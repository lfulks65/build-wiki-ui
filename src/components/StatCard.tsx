/** Reusable stat card for the Curator Dashboard. */

import { ReactNode } from 'react';

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

export default function StatCard({
  label,
  value,
  icon,
  trend,
}: StatCardProps): JSX.Element {
  const isPositive = trend !== undefined && trend.startsWith('+');
  const isNegative = trend !== undefined && trend.startsWith('-');

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/60 p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
      {/* Icon + label row */}
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <span className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
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

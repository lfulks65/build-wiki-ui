import React, { useMemo } from 'react'
import { LucideIcon } from 'lucide-react'

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface CommandPaletteItemProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  shortcut?: string
  active: boolean
  onClick: () => void
  query?: string
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerText.indexOf(lowerQuery)
  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-200 text-indigo-900 dark:bg-indigo-700 dark:text-indigo-100 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function CommandPaletteItem({
  icon: Icon,
  title,
  subtitle,
  shortcut,
  active,
  onClick,
  query,
}: CommandPaletteItemProps) {
  const hasQuery = !!query?.length

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75',
        'border-b border-gray-100 dark:border-gray-800/50 last:border-b-0',
        active
          ? 'bg-indigo-50 dark:bg-indigo-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
      )}
      aria-selected={active}
    >
      <div className={cn(
        'shrink-0 w-9 h-9 flex items-center justify-center rounded-lg',
        active
          ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800/50 dark:text-indigo-300'
          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      )}>
        <Icon size={18} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn(
          'text-sm font-medium truncate',
          hasQuery ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-gray-100',
        )}>
          {hasQuery ? highlightMatch(title, query) : title}
        </div>
        {subtitle && (
          <div className={cn(
            'text-xs truncate mt-0.5',
            active
              ? 'text-indigo-500 dark:text-indigo-400'
              : 'text-gray-500 dark:text-gray-400',
          )}>
            {subtitle}
          </div>
        )}
      </div>

      {shortcut && (
        <div className="shrink-0 flex items-center gap-1">
          <kbd className={cn(
            'text-[10px] font-mono px-1.5 py-0.5 rounded border',
            active
              ? 'bg-indigo-100 border-indigo-200 text-indigo-600 dark:bg-indigo-800/60 dark:border-indigo-700 dark:text-indigo-300'
              : 'bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500',
          )}>
            {shortcut}
          </kbd>
        </div>
      )}
    </button>
  )
}

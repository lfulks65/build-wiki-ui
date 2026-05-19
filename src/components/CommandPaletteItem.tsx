import { LucideIcon } from 'lucide-react'

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
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 font-semibold">
        {text.slice(idx, idx + query.length)}
      </span>
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
        ${active ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
      `}
    >
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center shrink-0
        ${active
          ? 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-300'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}
      `}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {highlightMatch(title, query ?? '')}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </div>
        )}
      </div>
      {shortcut && (
        <div className="flex gap-1 shrink-0">
          {shortcut.split('').map((key, i) => (
            <kbd
              key={i}
              className={`
                px-1.5 py-0.5 rounded text-xs font-mono border
                ${active
                  ? 'bg-indigo-100 dark:bg-indigo-800/50 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}
              `}
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </button>
  )
}

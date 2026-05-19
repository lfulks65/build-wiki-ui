import {
  Book,
  Command,
  LayoutDashboard,
  List,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CommandPaletteItem from './CommandPaletteItem'
import { useCommandPalette } from '../hooks/useCommandPalette'
import { mockPages } from '../lib/mock-pages'

interface NavCommand {
  type: 'navigation'
  icon: typeof Book
  title: string
  path: string
  shortcut?: string
}

interface ActionCommand {
  type: 'action'
  icon: typeof Sun
  title: string
  action: 'navigate' | 'toggleTheme' | 'toggleSidebar'
  path?: string
  shortcut?: string
}

interface PageCommand {
  type: 'page'
  icon: typeof List
  title: string
  path: string
  description: string
}

type CommandItem = NavCommand | ActionCommand | PageCommand

function matchesQuery(item: CommandItem, query: string): boolean {
  const q = query.toLowerCase()
  return (
    item.title.toLowerCase().includes(q) ||
    'path' in item && item.path.toLowerCase().includes(q) ||
    'description' in item && item.description.toLowerCase().includes(q)
  )
}

export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  const allCommands = useMemo<CommandItem[]>(() => {
    const nav: NavCommand[] = [
      { type: 'navigation', icon: LayoutDashboard, title: 'Go to Pages', path: '/pages', shortcut: '⌘P' },
      { type: 'navigation', icon: Book, title: 'Go to Assets', path: '/assets', shortcut: '⌘A' },
      { type: 'navigation', icon: Search, title: 'Go to Search', path: '/search', shortcut: '⌘S' },
      { type: 'navigation', icon: LayoutDashboard, title: 'Go to Curator', path: '/curator', shortcut: '⌘C' },
      { type: 'navigation', icon: Settings, title: 'Go to Settings', path: '/settings', shortcut: '⌘,' },
    ]

    const actions: ActionCommand[] = [
      { type: 'action', icon: Book, title: 'New Page', action: 'navigate', path: '/pages/new', shortcut: '⌘N' },
      { type: 'action', icon: Sun, title: 'Toggle Theme', action: 'toggleTheme', shortcut: '⌘T' },
      { type: 'action', icon: PanelLeftOpen, title: 'Toggle Sidebar', action: 'toggleSidebar', shortcut: '⌘B' },
    ]

    const pages: PageCommand[] = mockPages.map(p => ({
      type: 'page' as const,
      icon: List,
      title: p.title,
      path: `/pages/${p.slug}`,
      description: p.description,
    }))

    return [...nav, ...actions, ...pages]
  }, [])

  const filteredCommands = useMemo(() => {
    if (!query) return allCommands
    return allCommands.filter(cmd => matchesQuery(cmd, query))
  }, [allCommands, query])

  const groupedCommands = useMemo(() => {
    const sections: { name: string; items: CommandItem[] }[] = []

    const navItems = filteredCommands.filter(c => c.type === 'navigation')
    const actionItems = filteredCommands.filter(c => c.type === 'action')
    const pageItems = filteredCommands.filter(c => c.type === 'page')

    if (navItems.length) sections.push({ name: 'Navigation', items: navItems })
    if (actionItems.length) sections.push({ name: 'Actions', items: actionItems })
    if (pageItems.length) sections.push({ name: 'Pages', items: pageItems })

    return sections
  }, [filteredCommands])

  const flatItems = useMemo(() =>
    groupedCommands.flatMap(s => s.items),
    [groupedCommands],
  )

  useEffect(() => {
    if (flatItems.length > 0 && selectedIndex >= flatItems.length) {
      setSelectedIndex(0)
    }
  }, [flatItems.length, selectedIndex])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  const handleSelect = useCallback((cmd: CommandItem) => {
    close()
    if (cmd.type === 'action') {
      if (cmd.action === 'navigate' && cmd.path) {
        window.location.href = cmd.path
      } else if (cmd.action === 'toggleTheme') {
        const next = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system'
        setTheme(next)
        if (next === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (next === 'light') {
          document.documentElement.classList.remove('dark')
        }
        // system: just remove class, let media query handle
      } else if (cmd.action === 'toggleSidebar') {
        const sidebar = document.getElementById('wiki-sidebar')
        if (sidebar) {
          sidebar.classList.toggle('hidden')
        }
      }
    } else if ('path' in cmd && cmd.path) {
      window.location.href = cmd.path
    }
  }, [close, theme])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        if (flatItems.length > 0) {
          setSelectedIndex(prev => (prev + 1) % flatItems.length)
        }
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (flatItems.length > 0) {
          setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length)
        }
        break
      }
      case 'Enter': {
        e.preventDefault()
        if (flatItems.length > 0 && flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex])
        }
        break
      }
    }
  }, [flatItems, selectedIndex, handleSelect])

  const getShortcut = (cmd: CommandItem): string | undefined => {
    return 'shortcut' in cmd ? cmd.shortcut : undefined
  }

  const getSubtitle = (cmd: CommandItem): string | undefined => {
    if ('description' in cmd && cmd.type === 'page') return cmd.path
    if ('path' in cmd) return cmd.path
    return undefined
  }

  if (!isOpen) return null

  return (
    <div className="command-palette-backdrop" onClick={close}>
      <div
        className="animate-in w-full max-w-lg mx-4 mt-16 overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="shrink-0 text-gray-400 dark:text-gray-500" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="flex-1 py-4 text-lg bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />
          <kbd className="shrink-0 text-xs font-mono text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1">
          {groupedCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Command size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            groupedCommands.map((section) => (
              <div key={section.name}>
                <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.name}
                </div>
                {section.items.map((item) => {
                  const globalIdx = flatItems.indexOf(item)
                  return (
                    <CommandPaletteItem
                      key={globalIdx}
                      icon={item.icon}
                      title={item.title}
                      subtitle={getSubtitle(item)}
                      shortcut={getShortcut(item)}
                      active={globalIdx === selectedIndex}
                      onClick={() => handleSelect(item)}
                      query={query}
                    />
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 mr-1">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5">ESC</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  )
}

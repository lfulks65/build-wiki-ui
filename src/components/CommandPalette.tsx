import {
  Book,
  Command,
  LayoutDashboard,
  List,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import CommandPaletteItem from './CommandPaletteItem'
import { useCommandPalette } from '../hooks/useCommandPalette'

export interface CommandItem {
  title: string
  action: () => void
  icon: LucideIcon
  shortcut?: string
  description?: string
  path?: string
  category?: string
  keywords?: string[]
}

const allItems: CommandItem[] = [
  {
    title: 'Pages',
    description: 'Browse all wiki pages',
    action: () => {
      window.location.href = '/pages'
    },
    icon: LayoutDashboard,
    shortcut: '⌘P',
    category: 'Navigation',
  },
  {
    title: 'New Page',
    description: 'Create a new wiki page',
    action: () => alert('New page dialog'),
    icon: Book,
    shortcut: '⌘N',
    category: 'Actions',
  },
  {
    title: 'Assets',
    description: 'Browse and manage assets',
    action: () => {
      window.location.href = '/assets'
    },
    icon: List,
    shortcut: '⌘L',
    category: 'Navigation',
  },
  {
    title: 'Search',
    description: 'Search across pages',
    action: () => {
      window.location.href = '/search'
    },
    icon: Search,
    shortcut: '⌘S',
    category: 'Navigation',
  },
  {
    title: 'Curator',
    description: 'Curate content and manage pages',
    action: () => {
      window.location.href = '/curator'
    },
    icon: LayoutDashboard,
    category: 'Navigation',
  },
  {
    title: 'Settings',
    description: 'Configure your wiki preferences',
    action: () => {
      window.location.href = '/settings'
    },
    icon: Settings,
    shortcut: '⌘,',
    category: 'Navigation',
  },
  {
    title: 'Toggle Light Theme',
    description: 'Switch to light theme',
    action: () => {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    },
    icon: Sun,
    shortcut: '⌘T',
    category: 'Theme',
  },
  {
    title: 'Toggle Sidebar',
    description: 'Toggle the sidebar visibility',
    action: () => {
      const sidebar = document.getElementById('wiki-sidebar')
      if (sidebar) {
        sidebar.classList.toggle('collapsed')
      }
    },
    icon: PanelLeftOpen,
    shortcut: '⌘B',
    category: 'Layout',
  },
]

function matchesQuery(item: CommandItem, query: string): boolean {
  const q = query.toLowerCase()
  return (
    item.title.toLowerCase().includes(q) ||
    (item.path !== undefined && item.path.toLowerCase().includes(q)) ||
    (item.description !== undefined && item.description.toLowerCase().includes(q)) ||
    (item.keywords !== undefined && item.keywords.some(k => k.toLowerCase().includes(q)))
  )
}

export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [close])

  const filtered = query.length === 0
    ? allItems
    : allItems.filter(item => matchesQuery(item, query))

  const handleSelect = useCallback(
    (item: CommandItem) => {
      item.action()
      close()
    },
    [close],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % filtered.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length)
          break
        case 'Enter':
          e.preventDefault()
          if (filtered[selectedIndex]) {
            handleSelect(filtered[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          close()
          break
      }
    },
    [filtered, selectedIndex, handleSelect, close],
  )

  if (!isOpen) return null

  return (
    <div className="command-palette-backdrop">
      <div
        className="animate-in w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden"
        role="dialog"
        aria-label="Command Palette"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800">
          <Command className="text-gray-400" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            className="flex-1 py-3 text-sm bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <kbd className="text-[10px] font-mono text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found
            </div>
          ) : (
            filtered.map((item, index) => (
              <CommandPaletteItem
                key={item.title}
                icon={item.icon}
                title={item.title}
                subtitle={item.description}
                shortcut={item.shortcut}
                active={index === selectedIndex}
                onClick={() => handleSelect(item)}
                query={query}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

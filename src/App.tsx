import {
  Book,
  ChevronRight,
  Command,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
} from 'lucide-react'
import React, { useState } from 'react'
import CommandPalette from './components/CommandPalette'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { icon: LayoutDashboard, label: 'Pages', path: '/pages' },
    { icon: Book, label: 'Assets', path: '/assets' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: LayoutDashboard, label: 'Curator', path: '/curator' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  const demoPages = [
    { title: 'Getting Started', slug: 'getting-started' },
    { title: 'Page List', slug: 'page-list' },
    { title: 'Curator Dashboard', slug: 'curator-dashboard' },
    { title: 'Assets Management', slug: 'assets' },
    { title: 'Command Palette', slug: 'command-palette' },
    { title: 'Theme Customization', slug: 'theme-customization' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside
        id="wiki-sidebar"
        className={`
          ${sidebarOpen ? 'w-64' : 'w-0'} 
          transition-all duration-300 overflow-hidden
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          flex flex-col shrink-0
        `}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Command className="text-indigo-500" size={24} />
            <span className="font-bold text-lg">Build Wiki</span>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              <ChevronRight size={14} className="ml-auto opacity-50" />
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">Recent Pages</p>
          <div className="space-y-1">
            {demoPages.map(page => (
              <button
                key={page.slug}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left truncate"
              >
                <FileText size={14} />
                <span className="truncate">{page.title}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Build Wiki</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Press</span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">
              ⌘K
            </kbd>
            <span>to open Command Palette</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to Build Wiki
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                A modern wiki platform with quick navigation via the Command Palette.
              </p>
            </div>

            {/* Demo Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Go to Pages', desc: 'Browse all wiki pages', shortcut: '⌘P' },
                  { label: 'New Page', desc: 'Create a new wiki page', shortcut: '⌘N' },
                  { label: 'Toggle Theme', desc: 'Switch light/dark mode', shortcut: '⌘T' },
                  { label: 'Toggle Sidebar', desc: 'Show/hide sidebar', shortcut: '⌘B' },
                  { label: 'Search', desc: 'Search across pages', shortcut: '⌘S' },
                  { label: 'Settings', desc: 'Configure your wiki', shortcut: '⌘,' },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={() => window.location.href = `/pages/${action.label.toLowerCase().replace(/\s/g, '-')}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Book size={16} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{action.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{action.desc}</div>
                    </div>
                    <kbd className="text-[10px] font-mono text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
                      {action.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            </div>

            {/* Pages Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Pages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoPages.map(page => (
                  <button
                    key={page.slug}
                    onClick={() => window.location.href = `/pages/${page.slug}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {page.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        /pages/{page.slug}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Command Palette — rendered outside Layout, overlays everything */}
      <CommandPalette />
    </div>
  )
}

export default App

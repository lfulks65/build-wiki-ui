import { useState, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type FontSize = 'small' | 'medium' | 'large'
export type EditorFont = 'JetBrains Mono' | 'Fira Code' | 'Source Code Pro'
export type ViewMode = 'split' | 'edit' | 'preview'
export type AutoSaveInterval = 'off' | '30s' | '1min' | '5min'
export type DateFormat = 'iso' | 'us' | 'eu' | 'relative'

export interface SettingsState {
  // Appearance
  theme: Theme
  fontSize: FontSize
  editorFont: EditorFont

  // Editor
  viewMode: ViewMode
  lineWrap: boolean
  autoSave: AutoSaveInterval
  spellCheck: boolean

  // Wiki
  vaultPath: string
  defaultTemplate: string
  autoFrontmatter: boolean
  dateFormat: DateFormat

  // Keyboard shortcuts reference (read-only, not stored)
  shortcuts: ShortcutEntry[]
}

export interface ShortcutEntry {
  key: string
  label: string
  description: string
}

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'system',
  fontSize: 'medium',
  editorFont: 'JetBrains Mono',

  viewMode: 'split',
  lineWrap: true,
  autoSave: '1min',
  spellCheck: true,

  vaultPath: '~/.wiki/vault',
  defaultTemplate: '---\ntitle: "New Page"\ndate: {{date}}\ntags: []\n---\n\n# New Page\n\nStart writing here…',
  autoFrontmatter: true,
  dateFormat: 'iso',

  shortcuts: [
    { key: '⌘K', label: 'Command Palette', description: 'Open command palette for quick navigation' },
    { key: '⌘S', label: 'Save Page', description: 'Save the current page' },
    { key: '⌘B', label: 'Bold', description: 'Toggle bold formatting' },
    { key: '⌘I', label: 'Italic', description: 'Toggle italic formatting' },
    { key: '⌘F', label: 'Search', description: 'Open search interface' },
    { key: '⌘/', label: 'Toggle Preview', description: 'Switch between edit and preview modes' },
    { key: 'Esc', label: 'Close Modal', description: 'Close modal or blur active input' },
  ],
}

const STORAGE_KEY = 'wiki-settings'

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch {
    // Corrupted data — fall back to defaults
  }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(settings: SettingsState): void {
  try {
    const { shortcuts, ...toSave } = settings
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings())

  const updateSetting = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value }
        saveSettings(next)
        return next
      })
    },
    [],
  )

  const resetSettings = useCallback(() => {
    const defaults = DEFAULT_SETTINGS
    saveSettings(defaults)
    setSettings(defaults)
  }, [])

  return { settings, updateSetting, resetSettings }
}

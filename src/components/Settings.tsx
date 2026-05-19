import React, { useEffect } from 'react'
import {
  Monitor,
  Type,
  Settings as SettingsIcon,
  Keyboard,
  Info,
  LayoutTemplate,
  WrapText,
  Save,
  SpellCheck,
  Vault,
  Template,
  FileText,
  Clock,
  GitBranch,
} from 'lucide-react'
import SettingsSection from './SettingsSection'
import ToggleSwitch from './ToggleSwitch'
import { useSettings, type FontSize, type EditorFont, type Theme, type AutoSaveInterval } from '../hooks/useSettings'

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

const EDITOR_FONTS: { value: EditorFont; label: string }[] = [
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
]

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: <Monitor className="w-4 h-4" />,
  },
]

const AUTO_SAVE_INTERVALS: { value: AutoSaveInterval; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: '30s', label: '30 seconds' },
  { value: '1min', label: '1 minute' },
  { value: '5min', label: '5 minutes' },
]

const DATE_FORMATS: { value: 'iso' | 'us' | 'eu' | 'relative'; label: string; example: string }[] = [
  { value: 'iso', label: 'ISO 8601', example: '2025-01-15' },
  { value: 'us', label: 'US', example: '01/15/2025' },
  { value: 'eu', label: 'EU', example: '15/01/2025' },
  { value: 'relative', label: 'Relative', example: '2 days ago' },
]

export default function Settings() {
  const { settings, updateSetting, resetSettings } = useSettings()

  // Apply font scale CSS variable when font size changes
  useEffect(() => {
    const root = document.documentElement
    const scales: Record<FontSize, string> = {
      small: '0.875',
      medium: '1',
      large: '1.125',
    }
    root.style.setProperty('--font-scale', scales[settings.fontSize])
  }, [settings.fontSize])

  // Apply editor font to document body
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--editor-font', settings.editorFont)
    const editorEl = document.getElementById('wiki-editor')
    if (editorEl) {
      editorEl.style.fontFamily = `"${settings.editorFont}", monospace`
    }
  }, [settings.editorFont])

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your wiki experience. Preferences are saved automatically.
        </p>
      </div>

      {/* Appearance Section */}
      <SettingsSection
        title="Appearance"
        description="Theme, typography, and visual preferences"
        icon={Monitor}
      >
        {/* Theme Selector */}
        <div className="py-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
            Theme
          </label>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateSetting('theme', option.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                  ${
                    settings.theme === option.value
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }
                `}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="py-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
            Font Size
          </label>
          <div className="flex gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => updateSetting('fontSize', size.value)}
                className={`
                  flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                  ${
                    settings.fontSize === size.value
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }
                `}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Font */}
        <div className="py-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
            Editor Font
          </label>
          <div className="flex gap-2">
            {EDITOR_FONTS.map((font) => (
              <button
                key={font.value}
                onClick={() => updateSetting('editorFont', font.value)}
                className={`
                  flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                  ${
                    settings.editorFont === font.value
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }
                `}
                style={{ fontFamily: `"${font.value}", monospace` }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* Editor Section */}
      <SettingsSection
        title="Editor"
        description="Editor behavior and editing preferences"
        icon={LayoutTemplate}
      >
        {/* Default View Mode */}
        <div className="py-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 block">
            Default View Mode
          </label>
          <div className="flex gap-2">
            {[
              { value: 'split' as const, label: 'Split' },
              { value: 'edit' as const, label: 'Edit Only' },
              { value: 'preview' as const, label: 'Preview Only' },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => updateSetting('viewMode', mode.value)}
                className={`
                  flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                  ${
                    settings.viewMode === mode.value
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }
                `}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Line Wrapping */}
        <ToggleSwitch
          checked={settings.lineWrap}
          onChange={(checked) => updateSetting('lineWrap', checked)}
          label="Line Wrapping"
          description="Wrap long lines in the editor"
        />

        {/* Auto-save */}
        <div className="py-3">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 block">
            Auto-save
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Automatically save changes at regular intervals</p>
          <select
            value={settings.autoSave}
            onChange={(e) => updateSetting('autoSave', e.target.value as AutoSaveInterval)}
            className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {AUTO_SAVE_INTERVALS.map((interval) => (
              <option key={interval.value} value={interval.value}>
                {interval.label}
              </option>
            ))}
          </select>
        </div>

        {/* Spell Check */}
        <ToggleSwitch
          checked={settings.spellCheck}
          onChange={(checked) => updateSetting('spellCheck', checked)}
          label="Spell Check"
          description="Highlight misspelled words in the editor"
        />
      </SettingsSection>

      {/* Wiki Section */}
      <SettingsSection
        title="Wiki"
        description="Vault configuration and page generation"
        icon={Vault}
      >
        {/* Vault Path */}
        <div className="py-3">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 block">
            Vault Path
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            The local directory where your wiki vault is stored
          </p>
          <input
            type="text"
            readOnly
            value={settings.vaultPath}
            className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400 font-mono"
          />
        </div>

        {/* Default Template */}
        <div className="py-3">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 block">
            Default Page Template
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Markdown template used when creating new pages
          </p>
          <textarea
            value={settings.defaultTemplate}
            onChange={(e) => updateSetting('defaultTemplate', e.target.value)}
            rows={6}
            className="w-full max-w-xl px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            placeholder="# New Page\n\nStart writing here…"
          />
        </div>

        {/* Auto-generate Frontmatter */}
        <ToggleSwitch
          checked={settings.autoFrontmatter}
          onChange={(checked) => updateSetting('autoFrontmatter', checked)}
          label="Auto-generate Frontmatter"
          description="Automatically add YAML frontmatter to new pages"
        />

        {/* Date Format */}
        <div className="py-3">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 block">
            Date Format
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            How dates are formatted in frontmatter and display
          </p>
          <select
            value={settings.dateFormat}
            onChange={(e) =>
              updateSetting(
                'dateFormat',
                e.target.value as 'iso' | 'us' | 'eu' | 'relative',
              )
            }
            className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {DATE_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label} ({format.example})
              </option>
            ))}
          </select>
        </div>
      </SettingsSection>

      {/* Keyboard Shortcuts Section */}
      <SettingsSection
        title="Keyboard Shortcuts"
        description="Reference of available keyboard shortcuts"
        icon={Keyboard}
      >
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {settings.shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              <kbd className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {shortcut.key}
              </kbd>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {shortcut.label}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {shortcut.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* About Section */}
      <SettingsSection
        title="About"
        description="Version information and links"
        icon={Info}
      >
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          <div className="py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
            <span className="text-sm font-mono text-gray-900 dark:text-gray-100">1.0.0-dev</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Repository</span>
            <a
              href="https://github.com/lfulks65/build-wiki-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <GitBranch size={14} />
              GitHub
            </a>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Documentation</span>
            <a
              href="https://github.com/lfulks65/build-wiki-ui/wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <FileText size={14} />
              Docs
            </a>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={resetSettings}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Clock size={14} />
            Reset to Defaults
          </button>
        </div>
      </SettingsSection>
    </div>
  )
}

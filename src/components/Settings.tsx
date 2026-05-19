import { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Database,
  Globe,
  Shield,
} from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'system';
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure your Build Wiki experience
        </p>
      </div>

      {/* Appearance */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sun className="w-5 h-5 text-gray-400" />
          Appearance
        </h2>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <label className="text-sm font-medium">Theme</label>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  const html = document.documentElement;
                  if (t === 'dark') html.classList.add('dark');
                  else html.classList.remove('dark');
                  localStorage.setItem('theme', t);
                }}
                className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  theme === t
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {t === 'light' && <Sun className="w-4 h-4" />}
                {t === 'dark' && <Moon className="w-4 h-4" />}
                {t === 'system' && <Monitor className="w-4 h-4" />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-400" />
          Notifications
        </h2>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Page updates</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notify when pages are modified
              </p>
            </div>
            <Toggle defaultChecked={true} />
          </div>
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-3" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Curator jobs</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notify when curator tasks complete
              </p>
            </div>
            <Toggle defaultChecked={false} />
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" />
          Data
        </h2>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Vault path</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                /Users/dev/wiki/vault
              </p>
            </div>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Change
            </button>
          </div>
          <div className="h-px bg-gray-100 dark:bg-gray-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export wiki</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Download all pages as a markdown bundle
              </p>
            </div>
            <button className="btn-secondary text-sm">Export</button>
          </div>
        </div>
      </section>

      {/* Advanced */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-400" />
          Advanced
        </h2>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Debug mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable verbose logging
              </p>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          <div className="h-px bg-gray-100 dark:bg-gray-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reset settings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Restore all settings to defaults
              </p>
            </div>
            <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
              Reset
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Toggle({ defaultChecked }: { defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => setChecked(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

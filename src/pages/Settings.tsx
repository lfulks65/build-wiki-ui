/**
 * Settings — comprehensive configuration center with tab navigation.
 *
 * Tabs: General | Vaults | API Keys | System | About
 *
 * @module pages/Settings
 */

import { useState, type ReactNode } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Edit3,
  Eye,
  Code,
  List,
  Rows,
  Trash2,
  RotateCcw,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Type,
  Palette,
  Key,
  FolderOpen,
  Activity,
  Info,
  ArrowLeft,
  EyeOff,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { VaultManager } from "@/components/VaultManager";
import { ApiKeyManager } from "@/components/ApiKeyManager";
import { SystemStatus } from "@/components/SystemStatus";

/* ── Reusable sub-components ───────────────────────────────────────── */

interface RadioCardProps {
  selected: boolean;
  icon: typeof Sun;
  label: string;
  description?: string;
  onClick: () => void;
}

function RadioCard({ selected, icon: Icon, label, description, onClick }: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
        selected
          ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-750"
      }`}
      aria-pressed={selected}
    >
      <Icon
        size={24}
        className={`transition-colors duration-200 ${
          selected
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
        }`}
      />
      <span
        className={`text-sm font-medium ${
          selected
            ? "text-indigo-700 dark:text-indigo-300"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {label}
      </span>
      {description && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
      )}
    </button>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
        {description && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
        )}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
          checked ? "bg-indigo-600 dark:bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5 bg-gray-900 dark:bg-gray-100" : "translate-x-0 bg-gray-100 dark:bg-gray-300"
          }`}
        />
      </button>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  const isDanger = variant === "danger";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="flex items-center gap-3">
          {isDanger ? (
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-500" />
          )}
          <h3 id="dialog-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                : "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tab types ─────────────────────────────────────────────────────── */

type TabId = "general" | "vaults" | "api-keys" | "system" | "about";

interface TabDef {
  id: TabId;
  label: string;
  icon: typeof Palette;
  description: string;
}

const TABS: TabDef[] = [
  { id: "general", label: "General", icon: Palette, description: "Appearance, editor, and display settings" },
  { id: "vaults", label: "Vaults", icon: FolderOpen, description: "Manage registered wiki vaults" },
  { id: "api-keys", label: "API Keys", icon: Key, description: "Configure API keys for integrations" },
  { id: "system", label: "System", icon: Activity, description: "System health dashboard and actions" },
  { id: "about", label: "About", icon: Info, description: "Version information and credits" },
];

/* ── Theme preview thumbnails ──────────────────────────────────────── */

function ThemePreview({ theme }: { theme: string }) {
  const bg = theme === "dark" ? "bg-gray-900" : theme === "system" ? "bg-gray-100" : "bg-white";
  const fg = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const border = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const accent = theme === "dark" ? "text-indigo-400" : "text-indigo-600";
  const muted = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`rounded-lg border ${border} ${bg} p-3 shadow-sm`}>
      <div className={`text-xs font-semibold ${fg}`}>Getting Started</div>
      <div className={`mt-1 text-[10px] ${muted}`}>How to use your wiki</div>
      <div className={`mt-2 h-1.5 w-16 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className={`mt-1 h-1.5 w-12 rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`} />
    </div>
  );
}

/* ── Editor preview thumbnail ──────────────────────────────────────── */

function EditorPreview({ mode }: { mode: string }) {
  const isSplit = mode === "split";
  const isPreview = mode === "preview";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-900 shadow-sm">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 border-b border-gray-700 px-3 py-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </div>
      {/* Content */}
      <div className="flex h-20">
        {isSplit && (
          <div className="w-1/2 border-r border-gray-700 p-2 font-mono text-[8px] text-gray-300">
            <div className="text-emerald-400"># Heading</div>
            <div className="mt-1 text-gray-400">Some content here…</div>
            <div className="mt-1 text-blue-400">*italic*</div>
          </div>
        )}
        {isPreview && (
          <div className="w-1/2 p-2 font-mono text-[8px] text-gray-300">
            <div className="text-lg font-bold text-white">Heading</div>
            <div className="mt-1 text-gray-400">Some content here…</div>
            <div className="mt-1 italic text-gray-300">italic</div>
          </div>
        )}
        {!isSplit && !isPreview && (
          <div className="w-full p-2 font-mono text-[8px] text-gray-300">
            <div className="text-emerald-400"># Heading</div>
            <div className="mt-1 text-gray-400">Some content here…</div>
            <div className="mt-1 text-blue-400">*italic*</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Display preview toggles ───────────────────────────────────────── */

function DisplayTogglePreview({ showToc, showBreadcrumbs }: { showToc: boolean; showBreadcrumbs: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
      {/* Breadcrumbs bar */}
      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
        {showBreadcrumbs && (
          <>
            <span className="font-medium">Home</span>
            <span>/</span>
            <span>Pages</span>
            <span>/</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">Article</span>
          </>
        )}
        {!showBreadcrumbs && <span className="text-gray-300 dark:text-gray-600">Breadcrumbs hidden</span>}
      </div>
      <div className="mt-2 flex gap-2">
        {/* Mock page content */}
        <div className={`flex-1 space-y-1.5 rounded p-2 ${showToc ? "ml-0" : ""}`}>
          <div className="h-2 w-3/4 rounded bg-gray-300 dark:bg-gray-600" />
          <div className="h-1.5 w-full rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-1.5 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-1.5 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        {/* TOC sidebar */}
        {showToc && (
          <div className="w-16 space-y-1 rounded border border-gray-200 bg-white p-1.5 dark:border-gray-600 dark:bg-gray-800">
            <div className="h-1 w-full rounded bg-indigo-200 dark:bg-indigo-800" />
            <div className="h-1 w-4/5 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-1 w-3/5 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-1 w-2/3 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section components ────────────────────────────────────────────── */

function AppearanceSection() {
  const { settings, setTheme, setFontSize, toggleReducedMotion } = useSettings();

  const themeOptions: Array<{ value: typeof settings.theme; icon: typeof Sun; label: string }> = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const fontSizes: Array<{ value: typeof settings.fontSize; label: string; preview: string }> = [
    { value: "sm", label: "Small", preview: "Aa" },
    { value: "md", label: "Medium", preview: "Aa" },
    { value: "lg", label: "Large", preview: "Aa" },
  ];

  return (
    <section className="space-y-6">
      {/* Theme selector with preview thumbnails */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Palette size={14} className="mr-1 inline text-indigo-500" />
          Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, icon, label }) => (
            <div key={value} className="space-y-2">
              <RadioCard
                selected={settings.theme === value}
                icon={icon}
                label={label}
                onClick={() => setTheme(value)}
              />
              <ThemePreview theme={value} />
            </div>
          ))}
        </div>
      </div>

      {/* Font size with preview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Type size={14} className="mr-1 inline text-blue-500" />
          Font Size
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {fontSizes.map(({ value, label, preview }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFontSize(value)}
              className={`group flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                settings.fontSize === value
                  ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
              }`}
            >
              <span
                className={`font-medium transition-colors ${
                  settings.fontSize === value ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"
                }`}
                style={{ fontSize: value === "sm" ? "12px" : value === "md" ? "14px" : "16px" }}
              >
                {preview}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reduced motion */}
      <ToggleSwitch
        checked={settings.reducedMotion}
        onChange={toggleReducedMotion}
        label="Reduce motion"
        description="Minimize animations and transitions"
      />
    </section>
  );
}

function EditorSection() {
  const { settings, setEditorMode, toggleAutoSave, setTabSize } = useSettings();

  const editorOptions: Array<{ value: typeof settings.editorMode; icon: typeof Edit3; label: string }> = [
    { value: "split", icon: Rows, label: "Split" },
    { value: "preview", icon: Eye, label: "Preview" },
    { value: "source", icon: Code, label: "Source" },
  ];

  return (
    <section className="space-y-6">
      {/* Editor mode with mini preview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Edit3 size={14} className="mr-1 inline text-blue-500" />
          Default editor mode
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {editorOptions.map(({ value, icon, label }) => (
            <div key={value} className="space-y-2">
              <RadioCard
                selected={settings.editorMode === value}
                icon={icon}
                label={label}
                onClick={() => setEditorMode(value)}
              />
              <EditorPreview mode={value} />
            </div>
          ))}
        </div>
      </div>

      {/* Auto-save */}
      <ToggleSwitch
        checked={settings.autoSave}
        onChange={toggleAutoSave}
        label="Auto-save"
        description="Automatically save edits as you type"
      />

      {/* Tab size */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Type size={14} className="mr-1 inline text-blue-500" />
          Tab size
        </h3>
        <div className="flex gap-2">
          {([2, 4] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setTabSize(size)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium font-mono transition-all ${
                settings.tabSize === size
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
              }`}
            >
              {size} spaces
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function DisplaySection() {
  const { settings, toggleShowToc, toggleShowBreadcrumbs } = useSettings();

  return (
    <section className="space-y-6">
      <ToggleSwitch
        checked={settings.showToc}
        onChange={toggleShowToc}
        label="Show table of contents"
        description="Display a navigation sidebar on long pages"
      />

      <ToggleSwitch
        checked={settings.showBreadcrumbs}
        onChange={toggleShowBreadcrumbs}
        label="Show breadcrumbs"
        description="Display the page hierarchy in the header"
      />

      {/* Live preview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Live Preview
        </h3>
        <DisplayTogglePreview showToc={settings.showToc} showBreadcrumbs={settings.showBreadcrumbs} />
      </div>
    </section>
  );
}

function DataSection() {
  const { resetAll, clearConfig } = useSettings();
  const [showClearConfigConfirm, setShowClearConfigConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [reset, setReset] = useState(false);

  const handleClearConfig = () => {
    try {
      localStorage.removeItem("wiki-config");
      clearConfig();
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    resetAll();
    setReset(true);
    setTimeout(() => setReset(false), 3000);
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        <Trash2 size={18} className="text-red-500" />
        Data
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Clear API keys & config
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Remove all stored API keys and configuration values
            </p>
          </div>
          <button
            onClick={() => setShowClearConfigConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {cleared ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Trash2 size={16} />
            )}
            {cleared ? "Cleared" : "Clear"}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Reset all settings
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/60">
              Restore every setting to its default value
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:border-red-800 dark:bg-red-900 dark:hover:bg-red-800"
          >
            {reset ? (
              <Check size={16} />
            ) : (
              <RotateCcw size={16} />
            )}
            {reset ? "Reset!" : "Reset"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfigConfirm}
        title="Clear configuration?"
        description="This will remove all stored API keys and configuration from localStorage. You will need to reconfigure your integrations."
        confirmLabel="Clear"
        onConfirm={handleClearConfig}
        onCancel={() => setShowClearConfigConfirm(false)}
      />

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset all settings?"
        description="This will restore every setting to its default value. This action cannot be undone."
        confirmLabel="Reset"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </section>
  );
}

function AboutSection() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <Type size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Wiki</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Version 0.1.0 — Alpha
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Built with</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">React + Tauri 2 + Rust</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Styling</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">Tailwind CSS</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Routing</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">React Router</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Query</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">TanStack Query</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          A beautiful, fast local wiki powered by a Rust backend.
          Manage your vaults, configure API integrations, and stay organized.
        </p>
      </div>
    </section>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export function Settings(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Customize your experience — preferences are saved to this browser.
        </p>
      </header>

      {/* Tab navigation */}
      <nav className="mb-6" role="tablist" aria-label="Settings sections">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab content */}
      <div role="tabpanel" id={`panel-${activeTab}`}>
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Palette size={18} className="text-indigo-500" />
                Appearance
              </h2>
              <AppearanceSection />
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Edit3 size={18} className="text-blue-500" />
                Editor
              </h2>
              <EditorSection />
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <List size={18} className="text-emerald-500" />
                Display
              </h2>
              <DisplaySection />
            </div>
            <DataSection />
          </div>
        )}

        {activeTab === "vaults" && (
          <div className="space-y-6">
            <VaultManager />
          </div>
        )}

        {activeTab === "api-keys" && (
          <div className="space-y-6">
            <ApiKeyManager />
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6">
            <SystemStatus />
          </div>
        )}

        {activeTab === "about" && (
          <AboutSection />
        )}
      </div>
    </div>
  );
}

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
  Tabs,
  Save,
  Columns,
  PanelTop,
  Trash2,
  RotateCcw,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

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

/* ── Sections ──────────────────────────────────────────────────────── */

function AppearanceSection() {
  const { settings, setTheme, setFontSize, toggleReducedMotion } = useSettings();

  const themeOptions: Array<{ value: typeof settings.theme; icon: typeof Sun; label: string }> = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const fontSizes: Array<{ value: typeof settings.fontSize; label: string }> = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        <Sun size={18} className="text-amber-500" />
        Appearance
      </h2>

      {/* Theme selector */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, icon, label }) => (
            <RadioCard
              key={value}
              selected={settings.theme === value}
              icon={icon}
              label={label}
              onClick={() => setTheme(value)}
            />
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Font Size
        </label>
        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
          {fontSizes.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFontSize(value)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                settings.fontSize === value
                  ? "bg-white shadow dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              aria-pressed={settings.fontSize === value}
            >
              {label}
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
    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        <Edit3 size={18} className="text-blue-500" />
        Editor
      </h2>

      {/* Editor mode */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Default editor mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {editorOptions.map(({ value, icon, label }) => (
            <RadioCard
              key={value}
              selected={settings.editorMode === value}
              icon={icon}
              label={label}
              onClick={() => setEditorMode(value)}
            />
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
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tab size
        </label>
        <div className="flex gap-2">
          {([2, 4] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setTabSize(size)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                settings.tabSize === size
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750"
              }`}
              aria-pressed={settings.tabSize === size}
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
    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        <List size={18} className="text-emerald-500" />
        Display
      </h2>

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
    </section>
  );
}

function DataSection() {
  const { resetAll } = useSettings();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [reset, setReset] = useState(false);

  const handleClear = () => {
    try {
      localStorage.removeItem("wiki-settings");
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
              Clear preferences
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Remove all stored settings from localStorage
            </p>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
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
        open={showClearConfirm}
        title="Clear preferences?"
        description="This will remove all your stored settings from localStorage. You will need to reconfigure your preferences."
        confirmLabel="Clear"
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
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

/* ── Page ──────────────────────────────────────────────────────────── */

export function Settings(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Customize your experience — preferences are saved to this browser.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <AppearanceSection />
        <EditorSection />
        <DisplaySection />
        <DataSection />
      </div>
    </div>
  );
}

/**
 * ApiKeyManager — manages API key configuration: list, add, edit, delete,
 * and test connections.
 *
 * @module components/ApiKeyManager
 */

import { useState, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Loader2,
  Check,
  AlertTriangle,
  Shield,
  Key,
  Plug,
  Zap,
  Cloud,
  Cpu,
  ChevronDown,
} from "lucide-react";
import {
  listApiKeys,
  getApiKey,
  setApiKey,
  deleteApiKey,
  testApiKeyConnection,
  REQUIRED_API_KEYS,
  API_KEY_TYPES,
  type ApiKeyEntry,
} from "@/lib/api";
import { useSettings } from "@/hooks/useSettings";

/* ── Key type icons ────────────────────────────────────────────────── */

const KEY_ICONS: Record<string, typeof Shield> = {
  OPENROUTER_API_KEY: Plug,
  GROQ_API_KEY: Zap,
  GEMINI_API_KEY: Cloud,
  AWS_ACCESS_KEY_ID: Cpu,
  AWS_SECRET_ACCESS_KEY: Shield,
};

const KEY_DESCRIPTIONS: Record<string, string> = {
  OPENROUTER_API_KEY: "OpenRouter API — LLM inference routing",
  GROQ_API_KEY: "Groq API — Fast inference API",
  GEMINI_API_KEY: "Google Gemini API — Multimodal models",
  AWS_ACCESS_KEY_ID: "AWS access key for S3 blob storage",
  AWS_SECRET_ACCESS_KEY: "AWS secret key (required with access key)",
};

/* ── Dialogs ───────────────────────────────────────────────────────── */

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
      >
        <div className="flex items-center gap-3">
          <AlertTriangle
            className={`h-5 w-5 shrink-0 ${isDanger ? "text-red-500" : "text-amber-500"}`}
          />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
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
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (key: string, value: string) => void;
  loadKey: (key: string) => Promise<string>;
  existingKey?: string | null;
  loading: boolean;
  testFn?: (key: string) => Promise<boolean>;
}

function AddEditDialog({
  open,
  onClose,
  onSave,
  loadKey,
  existingKey,
  loading,
  testFn,
}: AddEditDialogProps) {
  const [selectedKey, setSelectedKey] = useState(existingKey ?? "");
  const [value, setValue] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [testing, setTesting] = useState(false);

  const loaded = useRef(false);

  // When dialog opens, load existing value
  const prevKey = useRef(existingKey);
  if (open && existingKey && existingKey !== prevKey.current) {
    prevKey.current = existingKey;
    loaded.current = false;
    setValue("");
    setShowValue(false);
    loadKey(existingKey).then((v) => setValue(v)).catch(() => {});
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {existingKey ? "Edit API Key" : "Add API Key"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {existingKey ? KEY_DESCRIPTIONS[existingKey] : "Configure an API key for the wiki."}
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Key type
            </label>
            <select
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                loaded.current = false;
                loadKey(e.target.value)
                  .then((v) => { setValue(v); setShowValue(false); })
                  .catch(() => setValue(""));
              }}
              disabled={!!existingKey}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 disabled:opacity-60"
            >
              <option value="">Select a key type…</option>
              {API_KEY_TYPES.map((k) => (
                <option key={k} value={k}>
                  {k} {REQUIRED_API_KEYS[k] ? "(required)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Key value
            </label>
            <div className="relative">
              <input
                type={showValue ? "text" : "password"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="sk-abc123…"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowValue(!showValue)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {testFn && selectedKey && (
            <button
              type="button"
              onClick={async () => {
                setTesting(true);
                try {
                  const ok = await testFn(selectedKey);
                  if (!ok) alert("Connection test failed — key may be invalid.");
                  else alert("Connection test succeeded!");
                } catch {
                  alert("Connection test failed.");
                } finally {
                  setTesting(false);
                }
              }}
              disabled={testing}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {testing ? <Loader2 size={12} className="animate-spin" /> : <Plug size={12} />}
              Test connection
            </button>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(selectedKey, value);
              onClose();
            }}
            disabled={loading || !selectedKey}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */

export function ApiKeyManager() {
  const { setConfig, getConfig } = useSettings();
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<Record<string, "testing" | "success" | "error">>({});

  const loadKeys = useCallback(() => {
    setLoading(true);
    listApiKeys()
      .then(setKeys)
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  loadKeys();

  // ── Actions ────────────────────────────────────────────────────────

  const handleAdd = useCallback(() => {
    setEditingKey(null);
    setAddEditOpen(true);
  }, []);

  const handleEdit = useCallback((key: string) => {
    setEditingKey(key);
    setAddEditOpen(true);
  }, []);

  const handleSave = useCallback(
    async (key: string, value: string) => {
      if (!key) return;
      setSavingKey(key);
      try {
        if (value) {
          await setConfig(key, value);
        }
        setKeys((prev) =>
          prev.map((k) => (k.key === key ? { ...k, hasValue: !!value } : k))
        );
      } catch {
        // ignore
      } finally {
        setSavingKey(null);
      }
    },
    [setConfig]
  );

  const handleDelete = useCallback(
    async (key: string) => {
      setSavingKey(key);
      try {
        setConfig(key, "");
        setKeys((prev) =>
          prev.map((k) => (k.key === key ? { ...k, hasValue: false } : k))
        );
      } catch {
        // ignore
      } finally {
        setSavingKey(null);
        setConfirmDelete(null);
      }
    },
    [setConfig]
  );

  const handleTest = useCallback(async (key: string) => {
    setTestStatus((prev) => ({ ...prev, [key]: "testing" }));
    try {
      const ok = await testApiKeyConnection(key);
      setTestStatus((prev) => ({ ...prev, [key]: ok ? "success" : "error" }));
    } catch {
      setTestStatus((prev) => ({ ...prev, [key]: "error" }));
    }
  }, []);

  const loadKeyForEdit = useCallback(
    async (key: string): Promise<string> => {
      return await getApiKey(key, true);
    },
    []
  );

  /* ── Render ───────────────────────────────────────────────────────── */

  return (
    <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Key size={18} className="text-purple-500" />
            API Keys
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Configure API keys for LLM providers, storage, and integrations.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Plus size={14} />
          Add Key
        </button>
      </div>

      {/* Key list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : (
          keys.map((entry) => {
            const Icon = KEY_ICONS[entry.key] ?? Shield;
            const isTesting = testStatus[entry.key] === "testing";
            const testResult = testStatus[entry.key] === "success"
              ? "success"
              : testStatus[entry.key] === "error"
                ? "error"
                : null;

            return (
              <div
                key={entry.key}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-750/50"
              >
                {/* Status dot */}
                <div className="flex-shrink-0">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      entry.hasValue
                        ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                        : "bg-red-400"
                    }`}
                    title={entry.hasValue ? "Key is configured" : "Key is missing"}
                  />
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Icon size={16} className="text-gray-600 dark:text-gray-300" />
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {entry.key}
                    </span>
                    {entry.required && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {KEY_DESCRIPTIONS[entry.key] ?? ""}
                  </p>
                </div>

                {/* Masked value */}
                <div className="flex-shrink-0">
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                    {entry.hasValue ? "••••••••••••" : "— not set —"}
                  </code>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(entry.key)}
                    disabled={savingKey === entry.key}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                    title="Edit"
                  >
                    {savingKey === entry.key ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Pencil size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(entry.key)}
                    disabled={savingKey === entry.key}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                  {/* Test connection (only for known provider keys) */}
                  {["OPENROUTER_API_KEY", "GROQ_API_KEY", "GEMINI_API_KEY"].includes(entry.key) && (
                    <button
                      onClick={() => handleTest(entry.key)}
                      disabled={isTesting || !entry.hasValue}
                      className={`rounded-md p-1.5 transition-colors disabled:opacity-50 ${
                        testResult === "success"
                          ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          : testResult === "error"
                            ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      }`}
                      title="Test connection"
                    >
                      {isTesting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : testResult === "success" ? (
                        <Check size={16} />
                      ) : testResult === "error" ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <Plug size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <AddEditDialog
        open={addEditOpen}
        onClose={() => setAddEditOpen(false)}
        onSave={handleSave}
        loadKey={loadKeyForEdit}
        existingKey={editingKey}
        loading={savingKey !== null}
        testFn={handleTest}
      />
      {confirmDelete && (
        <ConfirmDialog
          open={!!confirmDelete}
          title="Remove API key?"
          description={`Remove "${confirmDelete}"? This will clear the stored value.`}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </section>
  );
}

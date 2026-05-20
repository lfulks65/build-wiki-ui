/**
 * VaultManager — manages vault registration, cloning, default selection,
 * and removal.
 *
 * @module components/VaultManager
 */

import { useState, useCallback } from "react";
import {
  Plus,
  GitBranch,
  FolderOpen,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Key,
  ExternalLink,
} from "lucide-react";
import {
  listVaults,
  initVault,
  cloneVault,
  setDefaultVault,
  removeVault,
  openVault,
  type VaultRegistryEntry,
} from "@/lib/api";

/* ── Types ─────────────────────────────────────────────────────────── */

interface NewVaultDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, path: string) => void;
  loading: boolean;
}

interface CloneVaultDialogProps {
  open: boolean;
  onClose: () => void;
  onClone: (url: string, path: string) => void;
  loading: boolean;
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

/* ── Dialogs ───────────────────────────────────────────────────────── */

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

function NewVaultDialog({ open, onClose, onCreate, loading }: NewVaultDialogProps) {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          New Vault
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Register a new vault from your local filesystem.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vault name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Wiki Vault"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vault path
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/Users/me/wiki/vault"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
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
              onCreate(name.trim(), path.trim());
              onClose();
            }}
            disabled={loading || !name.trim() || !path.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function CloneVaultDialog({ open, onClose, onClone, loading }: CloneVaultDialogProps) {
  const [url, setUrl] = useState("");
  const [path, setPath] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Clone Vault
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Clone a git repository as a new vault.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Git URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/org/repo.git"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Local path
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/Users/me/wiki/cloned-vault"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
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
              onClone(url.trim(), path.trim());
              onClose();
            }}
            disabled={loading || !url.trim() || !path.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Clone
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Format helpers ────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ── Main Component ────────────────────────────────────────────────── */

export function VaultManager() {
  const [vaults, setVaults] = useState<VaultRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newVaultOpen, setNewVaultOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const activeVault = vaults.find((v) => v.isDefault);

  // Load vaults
  const loadVaults = useCallback(() => {
    setLoading(true);
    listVaults()
      .then(setVaults)
      .catch(() => setVaults([]))
      .finally(() => setLoading(false));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  loadVaults();

  // ── Actions ────────────────────────────────────────────────────────

  const handleCreate = useCallback(async (name: string, path: string) => {
    setActionLoading("create");
    try {
      const entry = await initVault(name, path);
      setVaults((prev) => [...prev, entry]);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleClone = useCallback(async (url: string, path: string) => {
    setActionLoading("clone");
    try {
      const entry = await cloneVault(url, path);
      setVaults((prev) => [...prev, entry]);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleSetDefault = useCallback(async (id: string) => {
    setActionLoading(`set-${id}`);
    try {
      await setDefaultVault(id);
      await loadVaults();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }, [loadVaults]);

  const handleOpen = useCallback(async (id: string) => {
    setActionLoading(`open-${id}`);
    try {
      await openVault(id);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleRemove = useCallback(async (id: string) => {
    setActionLoading(`remove-${id}`);
    try {
      await removeVault(id);
      setVaults((prev) => prev.filter((v) => v.id !== id));
      if (detailId === id) setDetailId(null);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
      setConfirmRemove(null);
    }
  }, [detailId]);

  const detailVault = detailId ? vaults.find((v) => v.id === detailId) : null;

  /* ── Render ───────────────────────────────────────────────────────── */

  return (
    <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <FolderOpen size={18} className="text-blue-500" />
            Vaults
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Manage registered wiki vaults — create, clone, set default, and remove.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewVaultOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Plus size={14} />
            New Vault
          </button>
          <button
            onClick={() => setCloneOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Copy size={14} />
            Clone Vault
          </button>
        </div>
      </div>

      {/* Vault list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : vaults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen size={40} className="text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              No vaults registered
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Create or clone a vault to get started.
            </p>
          </div>
        ) : (
          vaults.map((vault) => (
            <div
              key={vault.id}
              className={`group px-6 py-4 transition-colors ${
                detailId === vault.id ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {vault.name}
                    </h3>
                    {vault.isDefault && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 truncate max-w-xs">
                      <FolderOpen size={12} />
                      {vault.path}
                    </span>
                    {vault.branch && (
                      <span className="flex items-center gap-1">
                        <GitBranch size={12} />
                        {vault.branch}
                      </span>
                    )}
                    <span>{vault.pageCount} pages</span>
                    <span>{vault.assetCount} assets</span>
                    {vault.lastModified && (
                      <span>{formatRelativeTime(vault.lastModified)}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpen(vault.id)}
                    disabled={actionLoading === `open-${vault.id}`}
                    className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                    title="Open vault"
                  >
                    {actionLoading === `open-${vault.id}` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ExternalLink size={16} />
                    )}
                  </button>
                  {!vault.isDefault && (
                    <button
                      onClick={() => handleSetDefault(vault.id)}
                      disabled={actionLoading === `set-${vault.id}`}
                      className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                      title="Set as default"
                    >
                      {actionLoading === `set-${vault.id}` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setDetailId(detailId === vault.id ? null : vault.id)}
                    className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Details"
                  >
                    {detailId === vault.id ? "▾" : "▸"}
                  </button>
                  <button
                    onClick={() => setConfirmRemove(vault.id)}
                    disabled={actionLoading === `remove-${vault.id}`}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-50"
                    title="Remove from registry"
                  >
                    {actionLoading === `remove-${vault.id}` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {detailVault && (
                <div className="mt-3 ml-7 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-500">ID:</span>{" "}
                      {detailVault.id}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-500">Branch:</span>{" "}
                      {detailVault.branch ?? "N/A (not a git repo)"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-500">Pages:</span>{" "}
                      {detailVault.pageCount}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-500">Assets:</span>{" "}
                      {detailVault.assetCount}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-500">Default:</span>{" "}
                      {detailVault.isDefault ? "Yes" : "No"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-500">
                        Last Modified:
                      </span>{" "}
                      {detailVault.lastModified
                        ? new Date(detailVault.lastModified).toLocaleString()
                        : "Never"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action loading indicator */}
      {actionLoading && actionLoading.startsWith("create") && (
        <div className="flex items-center justify-center gap-2 border-t border-gray-200 px-6 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          Creating vault...
        </div>
      )}
      {actionLoading && actionLoading.startsWith("clone") && (
        <div className="flex items-center justify-center gap-2 border-t border-gray-200 px-6 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          Cloning vault...
        </div>
      )}

      {/* Dialogs */}
      <NewVaultDialog
        open={newVaultOpen}
        onClose={() => setNewVaultOpen(false)}
        onCreate={handleCreate}
        loading={actionLoading === "create"}
      />
      <CloneVaultDialog
        open={cloneOpen}
        onClose={() => setCloneOpen(false)}
        onClone={handleClone}
        loading={actionLoading === "clone"}
      />
      {confirmRemove && (
        <ConfirmDialog
          open={!!confirmRemove}
          title="Remove vault from registry?"
          description={`This will remove "${vaults.find((v) => v.id === confirmRemove)?.name}" from the registry. Vault files on disk will NOT be deleted.`}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={() => handleRemove(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </section>
  );
}

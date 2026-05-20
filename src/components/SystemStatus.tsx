/**
 * SystemStatus — health dashboard showing vault health, worker status,
 * disk usage, recent errors, and quick actions.
 *
 * @module components/SystemStatus
 */

import { useState, useCallback, useEffect } from "react";
import {
  Activity,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Wrench,
  Trash2,
  Search,
  Clock,
  Server,
} from "lucide-react";
import {
  getSystemStatus,
  indexRebuild,
  lintVault,
  organizeStatus,
  clearCache,
  listVaults,
  type SystemStatus,
  type VaultRegistryEntry,
} from "@/lib/api";

/* ── Format helpers ────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ── Main Component ────────────────────────────────────────────────── */

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [vaults, setVaults] = useState<VaultRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [sysStatus, vaultData] = await Promise.all([
        getSystemStatus(),
        listVaults(),
      ]);
      setStatus(sysStatus);
      setVaults(vaultData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  loadData();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, [loadData]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleIndexRebuild = useCallback(
    async (vaultId: string) => {
      setActionLoading(`rebuild-${vaultId}`);
      setActionMessage(`Rebuilding index for ${vaults.find((v) => v.id === vaultId)?.name ?? vaultId}…`);
      try {
        await indexRebuild(vaultId);
        setActionMessage("Index rebuild complete!");
        await loadData();
      } catch {
        setActionMessage("Index rebuild failed.");
      } finally {
        setActionLoading(null);
        setTimeout(() => setActionMessage(null), 3000);
      }
    },
    [vaults, loadData]
  );

  const handleLint = useCallback(
    async (vaultId: string) => {
      setActionLoading(`lint-${vaultId}`);
      try {
        const errors = await lintVault(vaultId);
        if (errors.length === 0) {
          setActionMessage("Lint passed — no issues found!");
        } else {
          setActionMessage(`Lint found ${errors.length} issue(s).`);
        }
      } catch {
        setActionMessage("Lint failed.");
      } finally {
        setActionLoading(null);
        setTimeout(() => setActionMessage(null), 4000);
      }
    },
    []
  );

  const handleOrganize = useCallback(async () => {
    setActionLoading("organize");
    setActionMessage("Running organization check…");
    try {
      await organizeStatus();
      setActionMessage("Organization check complete!");
      await loadData();
    } catch {
      setActionMessage("Organization check failed.");
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  }, [loadData]);

  const handleClearCache = useCallback(async () => {
    setActionLoading("cache");
    setActionMessage("Clearing cache…");
    try {
      await clearCache();
      setActionMessage("Cache cleared!");
    } catch {
      setActionMessage("Cache clear failed.");
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  }, []);

  /* ── Render ───────────────────────────────────────────────────────── */

  const hasErrors = status?.vaults.some((v) => v.error) ?? false;
  const workerRunning = status?.worker.running ?? false;

  return (
    <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Activity size={18} className="text-emerald-500" />
            System Status
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Real-time health dashboard — auto-refreshes every 30 seconds.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      )}

      {/* Action message */}
      {actionMessage && (
        <div
          className={`flex items-center justify-center gap-2 border-b px-6 py-2 text-sm ${
            actionMessage.includes("failed")
              ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
          }`}
        >
          {actionMessage.includes("failed") ? (
            <XCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {actionMessage}
        </div>
      )}

      {status && !loading && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {/* ── Vault Health ─────────────────────────────────────────── */}
          <div className="px-6 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Server size={14} className="text-indigo-500" />
              Vault Health
              {hasErrors && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <AlertTriangle size={12} /> Issues found
                </span>
              )}
            </h3>
            <div className="space-y-2">
              {status.vaults.map((health, idx) => {
                const vault = vaults[idx];
                return (
                  <div
                    key={vault?.id || idx}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-3">
                      {health.pathExists ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : health.error ? (
                        <XCircle size={16} className="text-red-500" />
                      ) : (
                        <Activity size={16} className="text-amber-500" />
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {vault?.name ?? "Vault"}
                        </span>
                        {health.error && (
                          <p className="text-xs text-red-500">{health.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {health.pathExists ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={12} /> Path
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <XCircle size={12} /> Path
                          </span>
                        )}
                        {health.gitRepoValid ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={12} /> Git
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <AlertTriangle size={12} /> Git
                          </span>
                        )}
                        {health.indexUpToDate ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={12} /> Index
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <AlertTriangle size={12} /> Index
                          </span>
                        )}
                      </div>
                      {vault && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleIndexRebuild(vault.id)}
                            disabled={actionLoading === `rebuild-${vault.id}`}
                            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                            title="Rebuild index"
                          >
                            {actionLoading === `rebuild-${vault.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Search size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => handleLint(vault.id)}
                            disabled={actionLoading === `lint-${vault.id}`}
                            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                            title="Run lint"
                          >
                            {actionLoading === `lint-${vault.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Wrench size={14} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Worker Status ────────────────────────────────────────── */}
          <div className="px-6 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Server size={14} className="text-blue-500" />
              Worker
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  workerRunning
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {workerRunning ? "Running" : "Stopped"}
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">PID</span>
                <p className="mt-0.5 text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                  {status.worker.pid ?? "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">Uptime</span>
                <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {status.worker.uptime
                    ? formatUptime(status.worker.uptime)
                    : "N/A"}
                </p>
              </div>
              <div className="col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">Log path</span>
                <p className="mt-0.5 text-sm font-mono text-gray-900 dark:text-gray-100">
                  {status.worker.logPath ?? "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Disk Usage ───────────────────────────────────────────── */}
          <div className="px-6 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <HardDrive size={14} className="text-amber-500" />
              Disk Usage
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">Vault Size</span>
                <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatBytes(status.disk.vaultSize)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">Blob Store</span>
                <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatBytes(status.disk.blobSize)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Recent Errors ────────────────────────────────────────── */}
          <div className="px-6 py-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <AlertTriangle size={14} className="text-red-500" />
              Recent Errors
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {status.recentErrors.length}
              </span>
            </h3>
            {status.recentErrors.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No recent errors — system is clean.
              </p>
            ) : (
              <div className="space-y-2">
                {status.recentErrors.map((err, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{err.message}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={10} />
                        {new Date(err.timestamp).toLocaleString()}
                        <span className="rounded bg-gray-200 px-1.5 text-[10px] uppercase text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                          {err.level}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOrganize}
            disabled={actionLoading === "organize"}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {actionLoading === "organize" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Wrench size={14} />
            )}
            Run Organize
          </button>
          <button
            onClick={handleClearCache}
            disabled={actionLoading === "cache"}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {actionLoading === "cache" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Clear Cache
          </button>
          {vaults.length > 0 && (
            <button
              onClick={() => handleIndexRebuild(vaults[0].id)}
              disabled={actionLoading === `rebuild-${vaults[0].id}`}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {actionLoading === `rebuild-${vaults[0].id}` ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              Rebuild Index
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

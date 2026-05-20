/**
 * Asset management hook — provides CRUD, filtering, sorting, and ingest
 * state for the AssetBrowser page.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  listAssets,
  getAssetDetail,
  deleteAsset,
  reprocessAsset,
  organizeAsset,
} from "@/lib/api";
import type {
  AssetSummary,
  AssetRecord,
  AssetType,
  AssetStatus,
  ViewMode,
  SortOption,
  IngestProgress,
} from "@/types/wiki";

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

const typeOrder: Record<AssetType, number> = {
  image: 1,
  pdf: 2,
  audio: 3,
  video: 4,
  markdown: 5,
  other: 6,
};

const statusOrder: Record<AssetStatus, number> = {
  complete: 1,
  processing: 2,
  queued: 3,
  failed: 4,
};

function compareAssets(a: AssetSummary, b: AssetSummary, sortBy: SortOption, sortOrder: "asc" | "desc"): number {
  let cmp = 0;
  switch (sortBy) {
    case "name":
      cmp = a.filename.localeCompare(b.filename);
      break;
    case "modified": {
      const da = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const db = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      cmp = da - db;
      break;
    }
    case "type":
      cmp = (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
      break;
  }
  return sortOrder === "asc" ? cmp : -cmp;
}

function filterAssets(
  assets: AssetSummary[],
  search: string,
  type: AssetType | "all",
  status: AssetStatus | "all"
): AssetSummary[] {
  return assets.filter((a) => {
    if (search && !a.filename.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (type !== "all" && a.type !== type) {
      return false;
    }
    if (status !== "all" && a.status !== status) {
      return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAssets() {
  // Data
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<AssetRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("modified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<AssetType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<AssetStatus | "all">("all");

  // Selection & batch
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Ingest
  const [ingestProgress, setIngestProgress] = useState<IngestProgress[]>([]);
  const [ingestComplete, setIngestComplete] = useState<string | null>(null);

  // Refs for polling
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---------------------------------------------------------------------------
  // Load assets list
  // ---------------------------------------------------------------------------

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAssets();
      setAssets(result);
    } catch (e) {
      console.error("Failed to load assets:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // ---------------------------------------------------------------------------
  // Poll for in-progress assets
  // ---------------------------------------------------------------------------

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      loadAssets();
    }, 5000);
  }, [loadAssets]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Select / deselect
  // ---------------------------------------------------------------------------

  const selectAsset = useCallback(
    async (id: string) => {
      setSelected(id);
      setDetailLoading(true);
      setDetailError(null);
      try {
        const record = await getAssetDetail(id);
        setDetail(record);
      } catch (e: unknown) {
        setDetailError(e instanceof Error ? e.message : "Failed to load asset");
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  const deselectAsset = useCallback(() => {
    setSelected(null);
    setDetail(null);
    setDetailError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Bulk selection
  // ---------------------------------------------------------------------------

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const filtered = getFilteredAssets();
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteAsset(id);
        setAssets((prev) => prev.filter((a) => a.id !== id));
        if (selected === id) deselectAsset();
        if (selectedIds.has(id)) {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      } catch (e) {
        console.error("Delete failed:", e);
      }
    },
    [selected, selectedIds, deselectAsset]
  );

  const handleReprocess = useCallback(
    async (id: string) => {
      try {
        await reprocessAsset(id);
        setAssets((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "processing" as AssetStatus } : a))
        );
        startPolling();
      } catch (e) {
        console.error("Reprocess failed:", e);
      }
    },
    [startPolling]
  );

  const handleOrganize = useCallback(
    async (id: string) => {
      try {
        await organizeAsset(id);
        setAssets((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "queued" as AssetStatus } : a))
        );
        startPolling();
      } catch (e) {
        console.error("Organize failed:", e);
      }
    },
    [startPolling]
  );

  const handleBulkDelete = useCallback(async () => {
    for (const id of selectedIds) {
      await deleteAsset(id);
    }
    setAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  // ---------------------------------------------------------------------------
  // Ingest
  // ---------------------------------------------------------------------------

  const ingestFile = useCallback((file: File): string => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setIngestProgress((prev) => [
      ...prev,
      { fileId, filename: file.name, status: "uploading", progress: 0 },
    ]);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIngestProgress((prev) =>
          prev.map((p) => (p.fileId === fileId ? { ...p, status: "processing", progress: 100 } : p))
        );
        // Mark all complete after a short delay
        setTimeout(() => {
          setIngestProgress((prev) =>
            prev.map((p) =>
              p.fileId === fileId ? { ...p, status: "complete", progress: 100 } : p
            )
          );
        }, 800);
      } else {
        setIngestProgress((prev) =>
          prev.map((p) => (p.fileId === fileId ? { ...p, progress } : p))
        );
      }
    }, 300);

    return fileId;
  }, []);

  const clearIngestProgress = useCallback(() => {
    setIngestProgress([]);
    setIngestComplete(null);
    loadAssets();
  }, [loadAssets]);

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const getFilteredAssets = useCallback((): AssetSummary[] => {
    const filtered = filterAssets(assets, search, filterType, filterStatus);
    return filtered.sort((a, b) => compareAssets(a, b, sortBy, sortOrder));
  }, [assets, search, filterType, filterStatus, sortBy, sortOrder]);

  const selectedAsset = assets.find((a) => a.id === selected) ?? null;

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // Data
    assets,
    setAssets,
    loading,
    setLoading,
    selected,
    setSelected,
    selectedAsset,
    detail,
    detailLoading,
    detailError,
    setDetail,

    // View
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    search,
    setSearch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,

    // Selection
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    hasSelection: selectedIds.size > 0,

    // Actions
    selectAsset,
    deselectAsset,
    handleDelete,
    handleReprocess,
    handleOrganize,
    handleBulkDelete,
    startPolling,
    stopPolling,

    // Ingest
    ingestFile,
    ingestProgress,
    setIngestProgress,
    ingestComplete,
    setIngestComplete,
    clearIngestProgress,

    // Derived
    filteredAssets: getFilteredAssets(),
  };
}

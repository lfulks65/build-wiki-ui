/**
 * AssetGrid — the main asset listing area of the AssetBrowser.
 *
 * Features:
 *  - Grid and list view toggle
 *  - Filter bar: search, type filter, status filter
 *  - Sort options: name, date added, type
 *  - Click to select, double-click to open detail
 *  - Loading skeletons (4-8 placeholders)
 *  - Empty state: "Drop files here to get started"
 *  - Batch selection with checkboxes + bulk actions
 */

import { useMemo } from "react";
import {
  Grid3x3,
  List,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Eye,
  Trash2,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import AssetCard from "./AssetCard";
import { Skeleton } from "./Skeleton";
import type { AssetSummary, AssetType, AssetStatus } from "@/types/wiki";

/* -------------------------------------------------------------------------- */
/* Filter bar                                                                 */
/* -------------------------------------------------------------------------- */

export interface AssetFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterType: AssetType | "all";
  onTypeChange: (v: AssetType | "all") => void;
  filterStatus: AssetStatus | "all";
  onStatusChange: (v: AssetStatus | "all") => void;
  sortBy: string;
  onSortChange: (v: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (v: "asc" | "desc") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
  assetCount: number;
}

const assetTypes: { value: AssetType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "image", label: "Images" },
  { value: "pdf", label: "PDFs" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "markdown", label: "Markdown" },
];

const assetStatuses: { value: AssetStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "complete", label: "Complete" },
  { value: "processing", label: "Processing" },
  { value: "queued", label: "Queued" },
  { value: "failed", label: "Failed" },
];

const sortOptions: { value: string; label: string }[] = [
  { value: "modified", label: "Date Added" },
  { value: "name", label: "Name" },
  { value: "type", label: "Type" },
];

export function FilterBar({
  search,
  onSearchChange,
  filterType,
  onTypeChange,
  filterStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  assetCount,
}: AssetFilterBarProps): JSX.Element {
  return (
    <div className="space-y-3">
      {/* Search + view toggle row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
        </div>
        <button
          onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
          className={`
            p-2 rounded-lg border transition-colors
            ${
              viewMode === "grid"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }
          `}
          title={viewMode === "grid" ? "List view" : "Grid view"}
        >
          {viewMode === "grid" ? (
            <List className="w-4 h-4" />
          ) : (
            <Grid3x3 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => onTypeChange(e.target.value as AssetType | "all")}
          className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {assetTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value as AssetStatus | "all")}
          className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {assetStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1 ml-auto">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Count */}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
          {assetCount} asset{assetCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bulk actions                                                               */
/* -------------------------------------------------------------------------- */

export function BulkActions({
  count,
  onDeselect,
  onOrganize,
  onDelete,
}: {
  count: number;
  onDeselect: () => void;
  onOrganize: () => void;
  onDelete: () => void;
}): JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2">
      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
        {count} selected
      </span>
      <button
        onClick={onOrganize}
        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
      >
        Organize
      </button>
      <button
        onClick={onDelete}
        className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
      >
        Delete
      </button>
      <div className="flex-1" />
      <button
        onClick={onDeselect}
        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        Deselect all
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({ assetCount }: { assetCount: number }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
      <p className="text-base font-medium text-gray-500 dark:text-gray-400">
        {assetCount === 0
          ? "Drop files here to get started"
          : "No assets match your filters"}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        {assetCount === 0
          ? "Drag & drop images, PDFs, audio, or video files"
          : "Try adjusting your filter or search criteria"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main grid/list component                                                   */
/* -------------------------------------------------------------------------- */

export interface AssetGridProps {
  assets: AssetSummary[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onOrganize: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSearchChange: (v: string) => void;
  onTypeChange: (v: AssetType | "all") => void;
  onStatusChange: (v: AssetStatus | "all") => void;
  onSortChange: (v: string) => void;
  onSortOrderChange: (v: "asc" | "desc") => void;
  onViewModeChange: (v: "grid" | "list") => void;
  onDeselectAll: () => void;
  onBulkOrganize: () => void;
  onBulkDelete: () => void;
  loading: boolean;
  viewMode: "grid" | "list";
  search: string;
  filterType: AssetType | "all";
  filterStatus: AssetStatus | "all";
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSelectAll: () => void;
  selectAllChecked: boolean;
  totalAssets: number;
}

export default function AssetGrid({
  assets,
  selectedIds,
  onSelect,
  onOpenDetail,
  onOrganize,
  onDelete,
  onToggleSelect,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onSortChange,
  onSortOrderChange,
  onViewModeChange,
  onDeselectAll,
  onBulkOrganize,
  onBulkDelete,
  loading,
  viewMode,
  search,
  filterType,
  filterStatus,
  sortBy,
  sortOrder,
  onSelectAll,
  selectAllChecked,
  totalAssets,
}: AssetGridProps): JSX.Element {
  const hasFilters = search || filterType !== "all" || filterStatus !== "all";
  const displayCount = loading ? 0 : assets.length;

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <FilterBar
        search={search}
        onSearchChange={onSearchChange}
        filterType={filterType}
        onTypeChange={onTypeChange}
        filterStatus={filterStatus}
        onStatusChange={onStatusChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        assetCount={displayCount}
      />

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <BulkActions
          count={selectedIds.size}
          onDeselect={onDeselectAll}
          onOrganize={onBulkOrganize}
          onDelete={onBulkDelete}
        />
      )}

      {/* Content */}
      {loading ? (
        /* Skeletons */
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              : "space-y-2"
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              variant={viewMode === "grid" ? "card" : "list"}
              className={viewMode === "grid" ? "h-52" : ""}
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState assetCount={totalAssets} />
      ) : viewMode === "grid" ? (
        /* Grid view */
        <>
          {/* Select all header */}
          {assets.length > 0 && (
            <div className="flex items-center gap-2 pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAllChecked && assets.length > 0}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Select all ({assets.length})
                </span>
              </label>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedIds.has(asset.id)}
                onSelect={onSelect}
                onOpenDetail={onOpenDetail}
                onOrganize={onOrganize}
                onDelete={onDelete}
                onToggleSelect={onToggleSelect}
                viewMode="grid"
              />
            ))}
          </div>
        </>
      ) : (
        /* List view */}
        <div className="space-y-1.5">
          {/* Header row */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAllChecked && assets.length > 0}
                onChange={onSelectAll}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
            <span className="w-8" />
            <span className="flex-1">Filename</span>
            <span className="w-16 text-center">Type</span>
            <span className="w-24 text-center">Status</span>
            <span className="w-24 text-center hidden md:block">Date</span>
          </div>
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isSelected={selectedIds.has(asset.id)}
              onSelect={onSelect}
              onOpenDetail={onOpenDetail}
              onOrganize={onOrganize}
              onDelete={onDelete}
              onToggleSelect={onToggleSelect}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}

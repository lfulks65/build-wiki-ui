/**
 * AssetCard — individual card for the AssetGrid.
 *
 * Features:
 *  - Thumbnail preview for images (uses file URL or placeholder)
 *  - Type-specific icon for non-image assets
 *  - Status badge with colour coding
 *  - Filename with truncation + tooltip
 *  - Relative timestamp
 *  - Hover: scale + shadow + action overlay
 *  - Context menu (right-click)
 */

import { useRef, useEffect, useState, MouseEvent, MouseEvent as ReactMouseEvent } from "react";
import {
  Image as ImageIcon,
  FileText,
  Music,
  Video,
  FileCode,
  File,
  MoreVertical,
  Eye,
  FolderOpen,
  Trash2,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import type { AssetSummary, AssetType } from "@/types/wiki";

/* -------------------------------------------------------------------------- */
/* Type icons                                                                 */
/* -------------------------------------------------------------------------- */

const typeIcons: Record<AssetType, JSX.Element> = {
  image: <ImageIcon className="w-10 h-10 text-blue-500" />,
  pdf: <FileText className="w-10 h-10 text-red-500" />,
  audio: <Music className="w-10 h-10 text-purple-500" />,
  video: <Video className="w-10 h-10 text-pink-500" />,
  markdown: <FileCode className="w-10 h-10 text-cyan-500" />,
  other: <File className="w-10 h-10 text-gray-500" />,
};

const typeIconLarge: Record<AssetType, JSX.Element> = {
  image: <ImageIcon className="w-6 h-6 text-blue-500" />,
  pdf: <FileText className="w-4 h-4 text-red-500" />,
  audio: <Music className="w-4 h-4 text-purple-500" />,
  video: <Video className="w-4 h-4 text-pink-500" />,
  markdown: <FileCode className="w-4 h-4 text-cyan-500" />,
  other: <File className="w-4 h-4 text-gray-500" />,
};

/* -------------------------------------------------------------------------- */
/* Context menu                                                               */
/* -------------------------------------------------------------------------- */

function ContextMenu({
  x,
  y,
  onClose,
  onOpen,
  onOrganize,
  onDelete,
}: {
  x: number;
  y: number;
  onClose: () => void;
  onOpen: () => void;
  onOrganize: () => void;
  onDelete: () => void;
}): JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
      style={{ left: x, top: y }}
      role="menu"
    >
      <button
        onClick={() => {
          onClose();
          onOpen();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        role="menuitem"
      >
        <Eye className="w-4 h-4" />
        Open
      </button>
      <button
        onClick={() => {
          onClose();
          onOrganize();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        role="menuitem"
      >
        <FolderOpen className="w-4 h-4" />
        Organize
      </button>
      <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
      <button
        onClick={() => {
          onClose();
          onDelete();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        role="menuitem"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Card props & component                                                     */
/* -------------------------------------------------------------------------- */

export interface AssetCardProps {
  asset: AssetSummary;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onOrganize: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  viewMode?: "grid" | "list";
}

export default function AssetCard({
  asset,
  isSelected,
  onSelect,
  onOpenDetail,
  onOrganize,
  onDelete,
  onToggleSelect,
  viewMode = "grid",
}: AssetCardProps): JSX.Element {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const relativeTime = useRelativeTime(asset.addedAt);

  // Image thumbnail
  const isImage = asset.type === "image";
  const thumbnailSrc = asset.thumbnail;

  const handleContextMenu = (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: ReactMouseEvent) => {
    if (e.detail === 2) {
      // Double click → open detail
      onOpenDetail(asset.id);
    } else {
      // Single click → select
      onSelect(asset.id);
    }
  };

  // -----------------------------------------------------------------------
  // List view row
  // -----------------------------------------------------------------------

  if (viewMode === "list") {
    return (
      <div
        className={`
          group flex items-center gap-3 rounded-lg border px-3 py-2 transition-all
          cursor-pointer
          ${
            isSelected
              ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }
        `}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="row"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(asset.id);
          }
        }}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(asset.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />

        {/* Type icon or thumbnail */}
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          {isImage && thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={asset.filename}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            typeIconLarge[asset.type]
          )}
        </div>

        {/* Filename */}
        <span className="flex-1 min-w-0 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {asset.filename}
        </span>

        {/* Type */}
        <span className="hidden sm:inline-flex text-xs text-gray-500 dark:text-gray-400 capitalize">
          {asset.type}
        </span>

        {/* Status */}
        <StatusBadge status={asset.status} size="sm" />

        {/* Date */}
        <span className="hidden md:inline text-xs text-gray-400 dark:text-gray-500 tabular-nums">
          {relativeTime}
        </span>

        {/* Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(asset.id);
            }}
            className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Grid view card
  // -----------------------------------------------------------------------

  return (
    <>
      <div
        className={`
          group relative rounded-xl border transition-all duration-200 cursor-pointer
          overflow-hidden
          ${
            isSelected
              ? "border-blue-400 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-900/20 shadow-md"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5"
          }
        `}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="row"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(asset.id);
          }
        }}
      >
        {/* Thumbnail / Preview area */}
        <div className="relative h-36 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
          {isImage && thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={asset.filename}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
              {typeIcons[asset.type]}
              <span className="text-xs capitalize font-medium">{asset.type}</span>
            </div>
          )}

          {/* Status badge (top-right) */}
          <div className="absolute top-2 right-2">
            <StatusBadge status={asset.status} size="sm" />
          </div>

          {/* Checkbox overlay */}
          <div className="absolute top-2 left-2">
            <label
              onClick={(e) => e.stopPropagation()}
              className="cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelect(asset.id);
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Hover action overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-colors flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100">
            <div className="flex gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(asset.id);
                }}
                className="rounded-full bg-white/90 dark:bg-gray-800/90 p-1.5 shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOrganize(asset.id);
                }}
                className="rounded-full bg-white/90 dark:bg-gray-800/90 p-1.5 shadow-sm hover:bg-white dark:hover:bg-gray-700 transition-colors"
                title="Organize"
              >
                <FolderOpen className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(asset.id);
                }}
                className="rounded-full bg-white/90 dark:bg-gray-800/90 p-1.5 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Info area */}
        <div className="px-3 py-2.5">
          <p
            className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
            title={asset.filename}
          >
            {asset.filename}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
              {asset.type}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {relativeTime}
            </span>
          </div>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpen={() => {
            setContextMenu(null);
            onOpenDetail(asset.id);
          }}
          onOrganize={() => {
            setContextMenu(null);
            onOrganize(asset.id);
          }}
          onDelete={() => {
            setContextMenu(null);
            onDelete(asset.id);
          }}
        />
      )}
    </>
  );
}

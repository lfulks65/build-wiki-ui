import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

/* ── AssetBrowser — file / asset manager ──────────────────────────── */

interface Asset {
  id: string;
  name: string;
  size: string;
  type: string;
}

const demoAssets: Asset[] = [
  { id: "1", name: "architecture-diagram.png", size: "245 KB", type: "image/png" },
  { id: "2", name: "logo-vector.svg", size: "12 KB", type: "image/svg+xml" },
  { id: "3", name: "api-spec.yaml", size: "38 KB", type: "text/yaml" },
];

export function AssetBrowser(): React.ReactElement {
  const { confirm } = useConfirm();
  const [assets, setAssets] = useState<Asset[]>(demoAssets);

  const handleDeleteAsset = useCallback(
    async (asset: Asset) => {
      const ok = await confirm({
        title: "Delete Asset",
        message: `Are you sure you want to delete "${asset.name}"? This will remove it from all pages that reference it.`,
        variant: "danger",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      });
      if (ok) {
        setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      }
    },
    [confirm],
  );

  const handleClearAll = useCallback(async () => {
    if (assets.length === 0) return;
    const ok = await confirm({
      title: "Delete All Assets",
      message: "Are you sure you want to delete all assets? This action cannot be undone.",
      variant: "danger",
      confirmLabel: "Delete All",
      cancelLabel: "Keep Assets",
    });
    if (ok) {
      setAssets([]);
    }
  }, [confirm, assets.length]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Assets
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage wiki assets ({assets.length} files)
          </p>
        </div>
        {assets.length > 1 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-600 dark:bg-gray-900">
          <Trash2 className="mb-3 h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            No assets
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Upload files to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {asset.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {asset.size} · {asset.type}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAsset(asset)}
                className="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                aria-label={`Delete ${asset.name}`}
                title="Delete asset"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

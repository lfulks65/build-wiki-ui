import { useState, useCallback } from "react";
import { Trash2, X } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

/* ── PageEditor — edit a wiki page ───────────────────────────────── */

export function PageEditor(): React.ReactElement {
  const { confirm } = useConfirm();
  const [unsaved, setUnsaved] = useState(false);

  const handleDiscard = useCallback(async () => {
    if (!unsaved) return;
    const ok = await confirm({
      title: "Discard Changes",
      message:
        "Are you sure you want to discard your changes? This action cannot be undone.",
      variant: "danger",
      confirmLabel: "Discard",
      cancelLabel: "Keep Editing",
    });
    if (ok) {
      setUnsaved(false);
    }
  }, [confirm, unsaved]);

  const handleToggleUnsaved = useCallback(() => {
    setUnsaved((prev) => !prev);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Page Editor
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Edit wiki page content
            {unsaved && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                unsaved changes
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleDiscard}
          disabled={!unsaved}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          <X className="h-4 w-4" />
          Discard Changes
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={handleToggleUnsaved}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {unsaved ? "Mark Unsaved" : "Simulate Edits"}
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {unsaved
            ? "You have unsaved changes. Click Discard to confirm."
            : "Click 'Simulate Edits' to test the discard confirmation dialog."}
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          Editor area placeholder
        </p>
      </div>
    </div>
  );
}

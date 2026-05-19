/* ── PageEditor — split-pane editor with live preview ────────────── */

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readPage, writePage } from "@/lib/api";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Skeleton } from "@/components/Skeleton";

type Mode = "edit" | "new";

export function PageEditor(): React.ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { slug } = useParams<{ slug: string }>() ?? {};
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handledSuccessRef = useRef(false);

  // Determine mode: if slug is "new" or undefined → new mode, otherwise edit
  const mode: Mode = slug === "new" || !slug ? "new" : "edit";

  // For edit mode, also extract the clean page path (strip trailing /edit if needed)
  const pagePath = mode === "edit" ? slug : "";

  // Load existing content in edit mode
  const {
    data: existingContent,
    isLoading: isLoadingPage,
    error: loadError,
  } = useQuery({
    queryKey: ["page", pagePath],
    queryFn: () => readPage(pagePath),
    enabled: mode === "edit",
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const [editorContent, setEditorContent] = useState(existingContent ?? "");

  // Sync editor when page loads in edit mode
  useEffect(() => {
    if (existingContent !== undefined && mode === "edit") {
      setEditorContent(existingContent);
    }
  }, [existingContent, mode]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      writePage(path, content),
    onSuccess: (_data, variables) => {
      // Invalidate page query to refetch
      queryClient.invalidateQueries({ queryKey: ["page", variables.path] });
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });

  const handleSave = useCallback(() => {
    if (mode === "edit" && pagePath) {
      saveMutation.mutate({ path: pagePath, content: editorContent });
    } else if (mode === "new") {
      // For new pages, save to a generated path
      const newSlug = editorContent
        .split("\n")[0]
        .replace(/^#+\s*/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const path = (newSlug || "untitled") + ".md";
      saveMutation.mutate({ path, content: editorContent });
    }
  }, [mode, pagePath, editorContent, saveMutation]);

  // Save on Cmd/Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // Navigate to viewer after successful save
  useEffect(() => {
    if (saveMutation.isSuccess && !handledSuccessRef.current) {
      handledSuccessRef.current = true;
      if (pagePath) {
        navigate("/pages/" + pagePath);
      } else if (mode === "new") {
        navigate("/pages");
      }
    }
    // Reset ref when mutation completes (success or error) to allow future saves
    if (!saveMutation.isPending) {
      handledSuccessRef.current = false;
    }
  }, [saveMutation.isSuccess, saveMutation.isPending, navigate, pagePath, mode]);

  // Show load error in edit mode
  if (mode === "edit" && isLoadingPage) {
    return (
      <div className="p-6">
        <Skeleton variant="card" />
        <div className="mt-4 space-y-3">
          <Skeleton />
          <Skeleton />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (mode === "edit" && loadError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-red-600 dark:text-red-400">
          Failed to load page
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {loadError.message}
        </p>
        <button
          onClick={() => navigate("/pages")}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to pages
        </button>
      </div>
    );
  }

  // Show save error
  const saveError = saveMutation.error?.message;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {mode === "new" ? "New Page" : "Edit: " + pagePath}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Cmd/Ctrl+S to save
          </span>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() =>
              navigate(
                mode === "edit" ? "/pages/" + pagePath : "/pages"
              )
            }
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Split pane editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor (left) */}
        <div className="flex-1 overflow-auto border-r border-gray-200 dark:border-gray-700">
          <textarea
            ref={textareaRef}
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Write your markdown here..."
            className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-gray-900 outline-none dark:text-gray-100"
            spellCheck={false}
          />
        </div>

        {/* Live preview (right) */}
        <div className="min-w-0 flex-1 overflow-auto">
          <div className="p-4">
            {editorContent.trim() ? (
              <MarkdownRenderer content={editorContent} />
            ) : (
              <p className="text-sm text-gray-400 italic">
                Start typing to see preview...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Save error toast */}
      {saveError && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          Save failed: {saveError}
          <button
            onClick={handleSave}
            className="ml-2 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Save success toast */}
      {saveMutation.isSuccess && (
        <div className="border-t border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
          Page saved successfully!
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { readPage, writePage } from "@/lib/api";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useVersionHistory } from "@/hooks/useVersionHistory";
import { RevisionBadge } from "@/components/RevisionBadge";
import { VersionHistory } from "@/components/VersionHistory";

export function PageEditor() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isNew = !slug;

  const { data: existingContent, isLoading } = useApiQuery(
    ["page-editor", slug || ""],
    () => readPage(slug || ""),
    { enabled: !isNew && !!slug },
  );

  const [content, setContent] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Version history hook
  const {
    addRevision,
    getRevisions,
    getRevisionCount,
    getLastSaved,
    restoreRevision,
  } = useVersionHistory();

  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    if (existingContent) setContent(existingContent);
  }, [existingContent]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = useCallback(async () => {
    if (!slug || !content.trim()) return;
    setSaving(true);
    try {
      await writePage(slug, content);
      // Save a revision
      addRevision(slug, content, editMessage.trim() || "Manual save");
      showToast("Page saved successfully!");
      setEditMessage("");
      setTimeout(() => navigate(`/pages/${slug}`), 600);
    } catch (e) {
      showToast("Failed to save: " + (e instanceof Error ? e.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  }, [slug, content, editMessage, addRevision, navigate]);

  // Cmd/Ctrl+S shortcut
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

  // Auto-save revision every 30 seconds of editing (debounced)
  const autoSaveRef = useRef<number | null>(null);
  useEffect(() => {
    // Clear any pending auto-save
    if (autoSaveRef.current) {
      window.clearTimeout(autoSaveRef.current);
      autoSaveRef.current = null;
    }

    // Only auto-save for existing pages that have content
    if (isNew || !slug || !content.trim()) return;

    // Schedule next auto-save in 30 seconds
    autoSaveRef.current = window.setTimeout(() => {
      addRevision(slug, contentRef.current, "Auto-save (30s)");
    }, 30_000);

    return () => {
      if (autoSaveRef.current) {
        window.clearTimeout(autoSaveRef.current);
        autoSaveRef.current = null;
      }
    };
  }, [content, isNew, slug, addRevision]);

  // Handle restore from history
  const handleRestore = useCallback(
    (restoredContent: string, _message: string) => {
      setContent(restoredContent);
      showToast("Version restored — save to apply changes");
    },
    [showToast],
  );

  // Simple markdown→HTML preview
  const previewHtml = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/#{1,6}\s(.+)/g, (_, t) =>
      `<h2 style="font-size:1.25rem;font-weight:700;margin:1rem 0 0.5rem">${t}</h2>`,
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      "<code style='background:#f3f4f6;padding:0.15em 0.4em;border-radius:3px;font-size:0.875em'>$1</code>",
    )
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  // Revision data for badge and history panel
  const revisionCount = getRevisionCount(slug || "");
  const lastSaved = getLastSaved(slug || "");
  const revisions = getRevisions(slug || "");

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-96 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 p-6">
      {/* Toast notification */}
      {toast && (
        <div className="fixed right-6 top-20 z-50 animate-in fade-in slide-in-from-top-2 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-white dark:text-gray-900">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {isNew ? "New Page" : `Editing: ${slug}`}
          </h1>
          {revisionCount > 0 && (
            <RevisionBadge
              revisionCount={revisionCount}
              lastSaved={lastSaved}
              onClick={() => setHistoryOpen(true)}
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isNew}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save (⌘S)"}
          </button>
        </div>
      </div>

      {/* Edit summary field */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="edit-message"
          className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
        >
          Edit message
        </label>
        <input
          id="edit-message"
          type="text"
          value={editMessage}
          onChange={(e) => setEditMessage(e.target.value)}
          placeholder="Describe what you changed…"
          className="w-full max-w-sm rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-600"
        />
      </div>

      {/* Split pane: editor + preview */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Markdown
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full w-full resize-none rounded-lg border border-gray-300 bg-white p-4 font-mono text-sm leading-relaxed text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-600"
            placeholder={
              isNew
                ? "# New Page\n\nStart writing your wiki page here..."
                : "Write your markdown here..."
            }
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Preview
          </label>
          <div className="h-full overflow-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: content
                  ? `<p>${previewHtml}</p>`
                  : '<p class="text-gray-400 italic">Preview will appear here...</p>',
              }}
            />
          </div>
        </div>
      </div>

      {/* Version History Panel */}
      {historyOpen && (
        <VersionHistory
          pageSlug={slug || ""}
          currentContent={content}
          revisions={revisions}
          hasRevisions={revisionCount > 0}
          lastSaved={lastSaved}
          onClose={() => setHistoryOpen(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
}

import { useRef, useState, type ChangeEvent } from "react";
import { MarkdownToolbar } from "@/components/MarkdownToolbar";

/* ── Types ──────────────────────────────────────────────────────── */

interface PageEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
}

/* ── Component ──────────────────────────────────────────────────── */

export function PageEditor({
  initialContent = "",
  onSave,
}: PageEditorProps): React.ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState<string>(initialContent);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave?.(content);
    setIsSaved(true);
    // Briefly show saved indicator
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S / Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar — sticky above the editor area */}
      <MarkdownToolbar textareaRef={textareaRef} />

      {/* Editor body */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <div className="flex h-full flex-col gap-4">
          {/* Page title input */}
          <input
            type="text"
            placeholder="Page title"
            className="w-full border-0 border-b border-gray-200 bg-transparent px-0 pb-2 text-2xl font-bold text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-0 dark:border-gray-800 dark:text-gray-100 dark:placeholder-gray-600"
          />

          {/* Markdown content textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Start writing in Markdown..."
              className="h-full w-full resize-none rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm leading-relaxed text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-600"
              spellCheck={false}
            />

            {/* Save indicator */}
            <div className="absolute right-3 top-3 flex items-center gap-2">
              {isSaved ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                  Saved
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  Unsaved
                </span>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {content.length} characters
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaved}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRef, useState, type RefObject } from "react";
import {
  Bold,
  Italic,
  Heading,
  Link,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

interface ToolbarButton {
  label: string;
  icon: React.ComponentType<{ size: number }>;
  ariaLabel: string;
  action: (textarea: HTMLTextAreaElement) => void;
}

/* ── Cursor helpers ─────────────────────────────────────────────── */

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = "",
): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + (selected || "text") + after;

  textarea.setRangeText(replacement, start, end, "select");
  textarea.focus();

  // Dispatch input event for React controlled components
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

/* ── Formatting actions ─────────────────────────────────────────── */

const actions: Record<string, (before: string, after?: string) => void> = {
  bold: (t) => insertAtCursor(t, "**"),
  italic: (t) => insertAtCursor(t, "*"),
  heading: (t) => insertAtCursor(t, "## "),
  link: (t) => insertAtCursor(t, "[", "](url)"),
  bulletList: (t) => insertAtCursor(t, "- "),
  orderedList: (t) => insertAtCursor(t, "1. "),
  code: (t) => insertAtCursor(t, "`"),
  blockquote: (t) => insertAtCursor(t, "> "),
  hr: (t) => {
    const start = t.selectionStart;
    t.setRangeText("\n---\n", start, t.selectionEnd, "end");
    t.focus();
    t.dispatchEvent(new Event("input", { bubbles: true }));
  },
};

/* ── Toolbar button definitions ─────────────────────────────────── */

const buttons: ToolbarButton[] = [
  {
    label: "Bold",
    icon: Bold,
    ariaLabel: "Bold (**text**)",
    action: (t) => actions.bold(t),
  },
  {
    label: "Italic",
    icon: Italic,
    ariaLabel: "Italic (*text*)",
    action: (t) => actions.italic(t),
  },
  {
    label: "Heading",
    icon: Heading,
    ariaLabel: "Heading (## heading)",
    action: (t) => actions.heading(t),
  },
  {
    label: "Link",
    icon: Link,
    ariaLabel: "Link ([text](url))",
    action: (t) => actions.link(t),
  },
  {
    label: "Bullet List",
    icon: List,
    ariaLabel: "Bullet list (- item)",
    action: (t) => actions.bulletList(t),
  },
  {
    label: "Numbered List",
    icon: ListOrdered,
    ariaLabel: "Ordered list (1. item)",
    action: (t) => actions.orderedList(t),
  },
  {
    label: "Code",
    icon: Code,
    ariaLabel: "Inline code (`code`)",
    action: (t) => actions.code(t),
  },
  {
    label: "Quote",
    icon: Quote,
    ariaLabel: "Blockquote (> quote)",
    action: (t) => actions.blockquote(t),
  },
  {
    label: "Horizontal Rule",
    icon: Minus,
    ariaLabel: "Horizontal rule (---)",
    action: (t) => actions.hr(t),
  },
];

/* ── Toolbar group separators (indexes where new groups start) ──── */

const separatorAfter = [2, 5]; // after heading, after ordered list

/* ── Component ──────────────────────────────────────────────────── */

export function MarkdownToolbar({
  textareaRef,
}: MarkdownToolbarProps): React.ReactElement {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleClick = (label: string, actionFn: (t: HTMLTextAreaElement) => void) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    actionFn(textarea);
    setActiveButton(label);
    setTimeout(() => setActiveButton(null), 200);
  };

  return (
    <div className="sticky top-16 z-20 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-1.5">
        {buttons.map((btn, index) => {
          const Icon = btn.icon;
          const isSeparator = separatorAfter.includes(index);
          const isActive = activeButton === btn.label;

          return (
            <>
              <button
                key={btn.label}
                type="button"
                onClick={() => handleClick(btn.label, btn.action)}
                title={btn.label}
                aria-label={btn.ariaLabel}
                tabIndex={0}
                className={`
                  flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm
                  transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                  ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  }
                `}
              >
                <Icon size={16} className="shrink-0" />
              </button>
              {isSeparator && (
                <div className="mx-1 h-5 w-px shrink-0 bg-gray-200 dark:bg-gray-700" />
              )}
            </>
          );
        })}
      </div>
    </div>
  );
}

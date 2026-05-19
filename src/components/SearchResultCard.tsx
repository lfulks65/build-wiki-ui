import React from "react";

export interface SearchResultCardProps {
  title: string;
  snippet: string;
  path: string;
  date: string;
  type: "page" | "asset" | "chunk";
  active: boolean;
  onClick: () => void;
  highlightTerms?: string[];
}

/**
 * Wralls matching terms in <mark> tags within the snippet for visual highlighting.
 */
function highlightSnippet(snippet: string, terms: string[]): string {
  if (!terms || terms.length === 0) return snippet;

  let highlighted = snippet;
  for (const term of terms) {
    if (!term) continue;
    const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
    highlighted = highlighted.replace(regex, "<mark>$1</mark>");
  }
  return highlighted;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Type icon mapping.
 */
const typeIcons: Record<string, string> = {
  page: "📄",
  asset: "📎",
  chunk: "📝",
};

/**
 * Format date to a readable string.
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  title,
  snippet,
  path,
  date,
  type,
  active,
  onClick,
  highlightTerms = [],
}) => {
  const highlightedSnippet = highlightSnippet(snippet, highlightTerms);

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className={`
        w-full text-left p-4 rounded-xl border transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
        ${
          active
            ? "border-indigo-300 bg-indigo-50 shadow-md"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }
      `}
    >
      {/* Title + Type Icon */}
      <div className="flex items-start gap-2 mb-1">
        <span className="text-lg mt-0.5 flex-shrink-0">{typeIcons[type]}</span>
        <h3 className="text-base font-semibold text-gray-900 leading-snug">
          {title}
        </h3>
      </div>

      {/* Snippet with highlighted matches */}
      <p
        className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2"
        dangerouslySetInnerHTML={{
          __html: highlightedSnippet,
        }}
      />
      {/* Amber highlight for <mark> tags via CSS */}
      <style>{`
        .search-result-card mark {
          background-color: #fde68a;
          color: #92400e;
          padding: 0 2px;
          border-radius: 2px;
        }
      `}</style>

      {/* Meta: path + date */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="font-mono truncate max-w-[200px]" title={path}>
          {path}
        </span>
        <span className="flex-shrink-0">{formatDate(date)}</span>
      </div>
    </button>
  );
};

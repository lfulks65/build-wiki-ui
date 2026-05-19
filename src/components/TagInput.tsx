import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { X, Tag } from "lucide-react";
import { slugifyTag, humanizeTag } from "@/utils/tags";

/* ── Types ────────────────────────────────────────────────────────── */

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[]; // existing tags for autocomplete
  maxTags?: number;
}

const MAX_DEFAULT = 10;

/* ── Helper: find matching suggestion ─────────────────────────────── */

function findMatchingSuggestion(input: string, suggestions: string[]): string | null {
  if (!input) return null;
  const lower = input.toLowerCase();
  // Exact match first
  const exact = suggestions.find(
    (s) => s.toLowerCase() === lower
  );
  if (exact) return exact;
  // Prefix match
  const prefix = suggestions.find(
    (s) => s.toLowerCase().startsWith(lower)
  );
  return prefix ?? null;
}

/* ── Component ────────────────────────────────────────────────────── */

/**
 * Tag input for the PageEditor.
 *
 * Features:
 * - Type tag name and press Enter/comma to add
 * - Each tag rendered as a removable badge inside the input
 * - Autocomplete dropdown from existing tags
 * - Backspace removes last tag when input is empty
 * - Max 10 tags per page (with warning)
 * - Duplicate prevention
 * - Accessible: keyboard navigation for autocomplete
 */
export function TagInput({
  tags,
  onChange,
  suggestions = [],
  maxTags = MAX_DEFAULT,
}: TagInputProps): React.ReactElement {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxReached = tags.length >= maxTags;

  // Filter and sort suggestions
  const filteredSuggestions = useMemo(() => {
    if (!input.trim()) return [];
    const lower = input.toLowerCase();
    return suggestions
      .filter(
        (s) =>
          s.toLowerCase().includes(lower) &&
          !tags.some((t) => slugifyTag(t) === slugifyTag(s))
      )
      .sort((a, b) => {
        // Exact/prefix matches first
        const aStarts = a.toLowerCase().startsWith(lower);
        const bStarts = b.toLowerCase().startsWith(lower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      });
  }, [input, suggestions, tags]);

  const addTag = useCallback(
    (tagName: string) => {
      const slug = slugifyTag(tagName);
      if (!slug) return;

      // Prevent duplicates
      if (tags.some((t) => slugifyTag(t) === slug)) return;

      // Respect max
      if (tags.length >= maxTags) return;

      const newTags = [...tags, tagName];
      onChange(newTags);
      setInput("");
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    },
    [tags, onChange, maxTags]
  );

  const removeTag = useCallback(
    (tagName: string) => {
      onChange(tags.filter((t) => slugifyTag(t) !== slugifyTag(tagName)));
    },
    [tags, onChange]
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Enter or comma to add
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          addTag(filteredSuggestions[selectedIndex]);
        } else if (input.trim()) {
          addTag(input.trim());
        }
        return;
      }

      // Arrow down for autocomplete navigation
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setShowSuggestions(true);
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }

      // Arrow up for autocomplete navigation
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setShowSuggestions(true);
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        return;
      }

      // Escape to close suggestions
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        return;
      }

      // Backspace to remove last tag when input is empty
      if (e.key === "Backspace" && !input && tags.length > 0) {
        e.preventDefault();
        removeTag(tags[tags.length - 1]);
        return;
      }
    },
    [
      input,
      tags,
      selectedIndex,
      filteredSuggestions,
      addTag,
      removeTag,
    ]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Support comma as delimiter
      if (value.includes(",")) {
        const parts = value.split(",");
        const lastPart = parts[parts.length - 1];
        if (lastPart.trim()) {
          addTag(lastPart.trim());
        }
        setInput("");
      } else {
        setInput(value);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    },
    [addTag]
  );

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      addTag(suggestion);
    },
    [addTag]
  );

  // Handle suggestion hover
  const handleSuggestionHover = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`
          min-h-[42px] rounded-lg border px-3 py-2 flex flex-wrap items-center gap-1.5
          transition-colors duration-150
          ${
            maxReached
              ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20"
              : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
          }
          focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1
          dark:focus-within:ring-offset-gray-950
        `}
      >
        {/* Tag badges */}
        {tags.map((tag) => (
          <span
            key={slugifyTag(tag)}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            <Tag size={12} className="opacity-60" />
            {humanizeTag(slugifyTag(tag))}
            <button
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full p-0.5 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 dark:hover:bg-indigo-800 dark:hover:text-indigo-200"
              aria-label={`Remove tag ${tag}`}
              tabIndex={-1}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (filteredSuggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={
            tags.length === 0
              ? "Add tags… (press Enter or comma)"
              : "Add more tags…"
          }
          className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100"
          aria-label="Add a tag"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && filteredSuggestions.length > 0}
          aria-controls="tag-suggestions-list"
          role="combobox"
          autoComplete="off"
        />
      </div>

      {/* Warning when max reached */}
      {maxReached && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          Maximum {maxTags} tags reached
        </p>
      )}

      {/* Autocomplete dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          id="tag-suggestions-list"
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={slugifyTag(suggestion)}
              role="option"
              aria-selected={selectedIndex === index}
              className={`
                flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                ${
                  selectedIndex === index
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                }
              `}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => handleSuggestionHover(index)}
            >
              <Tag size={14} className="opacity-50" />
              <span>{humanizeTag(slugifyTag(suggestion))}</span>
              {selectedIndex === index && (
                <span className="ml-auto text-xs text-indigo-400">↵</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { searchPages } from "@/lib/api";
import { SearchResultCard } from "@/components/SearchResultCard";
import { TagFilter } from "@/components/TagFilter";
import { FilterType, SearchHit } from "@/types/search";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Local storage keys */
const RECENT_SEARCHES_KEY = "wiki.recentSearches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  if (!query.trim()) return;
  const recent = getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([query, ...recent].slice(0, MAX_RECENT)));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {}
}

/** Map SearchResult (from API) → SearchHit (for rendering) */
function mapToHit(result: { title: string; path: string; snippet: string; type: string }): SearchHit {
  return {
    source: result.type === "asset" ? "asset" : "page",
    id: result.path,
    title: result.title,
    snippet: result.snippet,
    path: result.path,
    date: new Date().toISOString(),
    score: 0.9,
  };
}

/* ------------------------------------------------------------------ */
/*  Count-Up Animation                                                 */
/* ------------------------------------------------------------------ */

function CountUpNumber({ target, className = "" }: { target: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const duration = 400; // ms
  const start = useRef(performance.now());

  useEffect(() => {
    start.current = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - start.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <span className={className}>{display}</span>;
}

/* ------------------------------------------------------------------ */
/*  SearchPage: Full-page search experience                            */
/* ------------------------------------------------------------------ */

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchContent, setSearchContent] = useState(true);
  const [recentSearches] = useState(() => getRecentSearches());

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Sync query from URL on mount and on popstate
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

  // Debounced query for API calls
  const debouncedQuery = useDebounce(query, 300);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const runSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchPages(debouncedQuery);
        if (!cancelled) {
          const mapped: SearchHit[] = data.map(mapToHit);
          // Client-side filter by type if not "all"
          const filtered =
            filter === "all"
              ? mapped
              : filter === "pages"
              ? mapped.filter((r) => r.source === "page")
              : mapped.filter((r) => r.source === "asset");

          setResults(filtered);
          setHasSearched(true);
          saveRecentSearch(debouncedQuery);
        }
      } catch {
        if (!cancelled) {
          setError("Search failed. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    runSearch();
    return () => { cancelled = true; };
  }, [debouncedQuery, filter]);

  // Toggle tag selection
  const handleTagSelect = useCallback((slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug)
        ? prev.filter((t) => t !== slug)
        : [...prev, slug]
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  // Sync query to URL
  const updateUrl = useCallback((q: string) => {
    const params = new URLSearchParams(window.location.search);
    if (q.trim()) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, []);

  // Keyboard navigation for results list
  const handleSelectResult = useCallback(
    (index: number) => {
      const hit = results[index];
      if (hit) {
        if (hit.source === "page") {
          navigate(`/pages/${hit.path}`);
        } else {
          navigate(`/assets/${hit.id}`);
        }
      }
    },
    [results, navigate]
  );

  const { activeIndex, handleKeyDown } = useKeyboardNavigation({
    count: results.length,
    onSelect: handleSelectResult,
  });

  // Auto-scroll active result into view
  useEffect(() => {
    if (activeIndex >= 0 && resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-result-index="${activeIndex}"]`
      ) as HTMLElement | null;
      activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex]);

  // Extract terms to highlight from the query
  const highlightTerms = useMemo(() => {
    return debouncedQuery
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }, [debouncedQuery]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
    setSelectedTags([]);
    inputRef.current?.focus();
    updateUrl("");
  }, [updateUrl]);

  // Handle query input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      updateUrl(e.target.value);
    },
    [updateUrl]
  );

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Remove a recent search
  const handleRemoveRecent = useCallback((searchTerm: string) => {
    // Just clear the cached value — it'll be reloaded on next mount
    try {
      const recent = getRecentSearches().filter((q) => q !== searchTerm);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch {}
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Render: different states                                         */
  /* ---------------------------------------------------------------- */

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* ---- Search Input ---- */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <SearchIcon />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search your wiki..."
          className="
            w-full h-14 pl-12 pr-24
            rounded-xl border border-gray-300 bg-white
            text-lg text-gray-900 placeholder-gray-400
            shadow-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            transition-shadow duration-150
          "
          aria-label="Search query"
        />
        {/* Keyboard shortcut hint */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {hasSearched && (
            <span className="text-xs text-gray-400">
              <CountUpNumber target={results.length} className="font-semibold text-indigo-500" />
              result{results.length !== 1 ? "s" : ""}
            </span>
          )}
          {!hasSearched && !loading && (
            <kbd className="hidden sm:inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              /
            </kbd>
          )}
        </div>
        {query && (
          <button
            onClick={handleClear}
            className="
              absolute inset-y-0 right-0 flex items-center pr-10
              text-gray-400 hover:text-gray-600 transition-colors
            "
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {/* ---- Filter Chips ---- */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" role="tablist">
        {(["all", "pages", "assets"] as FilterType[]).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-150 whitespace-nowrap
              ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ---- Options row: search content checkbox + recent searches ---- */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search in page content toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={searchContent}
            onChange={(e) => setSearchContent(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Search in page content
          </span>
        </label>

        {/* Recent searches */}
        {recentSearches.length > 0 && !hasSearched && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400">Recent:</span>
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setQuery(term);
                  updateUrl(term);
                  inputRef.current?.focus();
                }}
                className="group flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                {term}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRecent(term);
                  }}
                  className="ml-0.5 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-opacity"
                >
                  <ClearIcon className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- Tag Filter ---- */}
      {hasSearched && results.length > 0 && (
        <div className="mb-4">
          <TagFilter
            availableTags={[]}
            selectedTags={selectedTags}
            onSelect={handleTagSelect}
            onClear={selectedTags.length > 0 ? handleClearTags : undefined}
          />
        </div>
      )}

      {/* ---- Results Area ---- */}
      <div
        ref={resultsContainerRef}
        className="space-y-3"
        role="listbox"
        onKeyDown={handleKeyDown}
      >
        {/* Empty / Initial State */}
        {!hasSearched && !loading && !error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <SearchIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Search your wiki
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Type a query above to find pages, assets, and knowledge across
              your vault.
            </p>
            {/* Keyboard shortcut hint */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <kbd className="inline-flex items-center rounded bg-gray-100 px-2 py-1 font-mono text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                /
              </kbd>
              <span>to focus search</span>
              <span className="mx-1">·</span>
              <kbd className="inline-flex items-center rounded bg-gray-100 px-2 py-1 font-mono text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Esc
              </kbd>
              <span>to clear</span>
            </div>
            {recentSearches.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                <span>Recent searches:</span>
                {recentSearches.slice(0, 3).map((term) => (
                  <span
                    key={term}
                    className="px-2 py-1 bg-gray-100 rounded-full dark:bg-gray-800"
                  >
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading / Skeleton State */}
        {loading && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="
                  p-4 rounded-xl border border-gray-200 bg-white
                  animate-pulse
                "
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-md flex-shrink-0" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                </div>
                <div className="flex gap-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-3">
              <ErrorIcon />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Search failed
            </h2>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => setQuery(debouncedQuery)}
              className="
                px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium
                hover:bg-indigo-700 transition-colors
              "
            >
              Retry
            </button>
          </div>
        )}

        {/* No Results State */}
        {hasSearched && !loading && !error && results.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
              <NoResultsIcon />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Check your spelling or try a different search term.
            </p>
            <div className="flex justify-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-1 bg-gray-100 rounded-full">Try &ldquo;wiki&rdquo;</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full">Try &ldquo;curator&rdquo;</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full">Try &ldquo;vault&rdquo;</span>
            </div>
          </div>
        )}

        {/* Results List */}
        {hasSearched && !loading && !error && results.length > 0 && (
          <>
            {/* Result count with count-up animation */}
            <div className="text-sm text-gray-500 mb-3 px-1">
              <CountUpNumber target={results.length} className="font-semibold text-indigo-500" />{" "}
              result{results.length !== 1 ? "s" : ""} for &ldquo;
              <span className="font-medium text-gray-700">{debouncedQuery}</span>
              &rdquo;
            </div>

            {results.map((hit, index) => (
              <SearchResultCard
                key={hit.id}
                title={hit.title}
                snippet={hit.snippet}
                path={hit.path}
                date={hit.date}
                type={hit.source as "page" | "asset" | "chunk"}
                active={index === activeIndex}
                onClick={() => handleSelectResult(index)}
                highlightTerms={highlightTerms}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function SearchIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function ClearIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="w-8 h-8 text-red-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

function NoResultsIcon() {
  return (
    <svg
      className="w-8 h-8 text-gray-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

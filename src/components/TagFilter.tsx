import { useRef, useEffect, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { TagBadge } from "@/components/TagBadge";
import type { TagInfo } from "@/types/tags";

/* ── Types ────────────────────────────────────────────────────────── */

interface TagFilterProps {
  allTags: TagInfo[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

/* ── Component ────────────────────────────────────────────────────── */

/**
 * Tag-based filter bar for PageList and Search.
 *
 * Features:
 * - Horizontal scrollable row of tag badges (YouTube/Netflix style)
 * - Click tag to toggle filter (OR logic: page matches ANY selected tag)
 * - "All" button to clear filter
 * - Active tag count indicator: "Filtered by N tags"
 * - Smooth horizontal scroll with arrow buttons on overflow
 * - Dark mode compatible
 */
export function TagFilter({
  allTags,
  selectedTags,
  onTagsChange,
}: TagFilterProps): React.ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [hasTags, setHasTags] = useState(false);

  // Check for overflow and update arrow visibility
  const checkOverflow = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 2
    );
  }, []);

  // Check overflow on mount and resize
  useEffect(() => {
    checkOverflow();
    const handleResize = () => checkOverflow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkOverflow]);

  // Scroll on mount to check initial state
  useEffect(() => {
    setHasTags(allTags.length > 0);
  }, [allTags]);

  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: -200, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: 200, behavior: "smooth" });
  }, []);

  // Scroll on overflow change
  useEffect(() => {
    checkOverflow();
  }, [checkOverflow]);

  // Toggle tag selection
  const toggleTag = useCallback(
    (tagSlug: string) => {
      const isSelected = selectedTags.includes(tagSlug);
      if (isSelected) {
        onTagsChange(selectedTags.filter((t) => t !== tagSlug));
      } else {
        onTagsChange([...selectedTags, tagSlug]);
      }
    },
    [selectedTags, onTagsChange]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    onTagsChange([]);
  }, [onTagsChange]);

  if (!hasTags) return <></>;

  return (
    <div className="relative">
      {/* Filter indicator when tags are selected */}
      {selectedTags.length > 0 && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Filtered by{" "}
            <span className="font-bold">{selectedTags.length}</span>{" "}
            {selectedTags.length === 1 ? "tag" : "tags"}
          </span>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            aria-label="Clear all tag filters"
          >
            <X size={12} />
            Clear
          </button>
        </div>
      )}

      {/* Scrollable tag bar */}
      <div className="relative">
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-gray-950 dark:via-gray-950/90"
            aria-label="Scroll tags left"
          >
            <ChevronLeft size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        )}

        {/* Tag list */}
        <div
          ref={scrollContainerRef}
          onScroll={checkOverflow}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* All / Clear button */}
          <button
            onClick={clearFilters}
            className={`
              flex-shrink-0 inline-flex items-center gap-1 rounded-full font-medium
              transition-all duration-150 hover:scale-105
              ${
                selectedTags.length === 0
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }
              px-3 py-1 text-sm
            `}
            aria-label={
              selectedTags.length === 0
                ? "Show all pages"
                : "Clear tag filters"
            }
          >
            All
          </button>

          {/* Tag badges */}
          {allTags.map((tagInfo) => (
            <TagBadge
              key={tagInfo.slug}
              tag={tagInfo.slug}
              tagInfo={tagInfo}
              active={selectedTags.includes(tagInfo.slug)}
              onClick={() => toggleTag(tagInfo.slug)}
              size="md"
            />
          ))}
        </div>

        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-gray-950 dark:via-gray-950/90"
            aria-label="Scroll tags right"
          >
            <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}

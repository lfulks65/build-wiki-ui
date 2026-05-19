import { Tag } from "@/types/tags";
import { TagBadge } from "./TagBadge";

interface TagFilterProps {
  availableTags: Tag[];
  selectedTags: string[];
  onSelect: (slug: string) => void;
  onClear?: () => void;
}

/**
 * Tag filter bar — click a tag to toggle it; selected tags show as badges.
 */
export function TagFilter({
  availableTags,
  selectedTags,
  onSelect,
  onClear,
}: TagFilterProps): React.ReactElement {
  if (availableTags.length === 0) return <></>;

  return (
    <div className="space-y-2">
      {/* Selected tags bar */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Filters:
          </span>
          {selectedTags.map((slug) => {
            const tag = availableTags.find((t) => t.slug === slug);
            return (
              <TagBadge
                key={slug}
                label={tag?.name ?? slug}
                onRemove={() => onSelect(slug)}
                removable
              />
            );
          })}
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Tag cloud — show all available tags */}
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.slug);
          return (
            <button
              key={tag.slug}
              onClick={() => onSelect(tag.slug)}
              className={`
                inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
                text-xs font-medium transition-colors duration-150
                ${
                  isSelected
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }
              `}
            >
              {tag.name}
              <span className="opacity-70">{tag.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

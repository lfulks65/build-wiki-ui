import { useState, useRef, useCallback } from "react";
import { TagBadge } from "./TagBadge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

/**
 * Tag input with add/remove, enter-to-add, and comma-separated input.
 */
export function TagInput({
  tags,
  onChange,
  placeholder = "Add tags…",
  maxTags = 10,
}: TagInputProps): React.ReactElement {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (value: string) => {
      const normalized = value.trim().toLowerCase();
      if (!normalized || tags.map((t) => t.toLowerCase()).includes(normalized)) return;
      if (tags.length >= maxTags) return;
      onChange([...tags, normalized]);
      setInput("");
    },
    [tags, onChange, maxTags]
  );

  const removeTag = useCallback(
    (target: string) => {
      onChange(tags.filter((t) => t.toLowerCase() !== target.toLowerCase()));
    },
    [tags, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(input);
      } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    },
    [input, tags, addTag, removeTag]
  );

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900">
      {tags.map((tag) => (
        <TagBadge
          key={tag}
          label={tag}
          onRemove={() => removeTag(tag)}
          removable
        />
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[8rem] border-none bg-transparent p-1 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-0 dark:text-gray-100 dark:placeholder-gray-500"
      />
    </div>
  );
}

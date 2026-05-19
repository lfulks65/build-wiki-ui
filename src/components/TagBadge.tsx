import { X } from "lucide-react";

interface TagBadgeProps {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  removable?: boolean;
}

/**
 * Small inline badge for a tag, optionally with a dismiss button.
 */
export function TagBadge({
  label,
  onRemove,
  onClick,
  removable = true,
}: TagBadgeProps): React.ReactElement {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
        text-xs font-medium
        bg-indigo-100 text-indigo-700
        dark:bg-indigo-900/40 dark:text-indigo-300
        ${onClick ? "cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800/50" : ""}
        ${!removable && !onClick ? "" : " transition-colors"}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {label}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 inline-flex items-center rounded-full p-0.5 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-600 dark:hover:bg-indigo-700 dark:hover:text-indigo-200"
          aria-label={`Remove tag ${label}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

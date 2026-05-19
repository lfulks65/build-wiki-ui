import { useCallback, useState } from "react";
import { Tag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { humanizeTag, tagColor } from "@/utils/tags";
import type { TagInfo } from "@/types/tags";

/* ── Types ────────────────────────────────────────────────────────── */

interface TagBadgeBase {
  tag: string;
  size?: "sm" | "md";
  active?: boolean;
  onClick?: (tag: string) => void;
  removable?: boolean;
  onRemove?: (tag: string) => void;
}

interface TagBadgeWithCount extends TagBadgeBase {
  count?: number;
}

interface TagBadgeWithInfo extends TagBadgeBase {
  tagInfo?: TagInfo;
  count?: undefined;
}

type TagBadgeProps = TagBadgeWithCount | TagBadgeWithInfo;

/* ── Helper: get display name ─────────────────────────────────────── */

function getDisplayName(props: TagBadgeProps): string {
  if (props.tagInfo) return props.tagInfo.name;
  return humanizeTag(props.tag);
}

/* ── Helper: get color ────────────────────────────────────────────── */

function getColor(tag: string, tagInfo?: TagInfo): string {
  if (tagInfo?.color) return tagInfo.color;
  return tagColor(tag);
}

/* ── Helper: get count display ────────────────────────────────────── */

function getCountDisplay(props: TagBadgeProps): string | null {
  if (props.count !== undefined) {
    return `${props.count}`;
  }
  if (props.tagInfo?.count !== undefined) {
    return `${props.tagInfo.count}`;
  }
  return null;
}

/* ── Component ────────────────────────────────────────────────────── */

/**
 * A clickable tag badge / chip component.
 *
 * Features:
 * - Pill/badge style with rounded-full
 * - Default: colored background using HSL hash
 * - Active state: filled indigo with white text
 * - Optional count badge
 * - Clickable: navigates to /tags/:tag or fires onClick
 * - Removable with X button
 * - Hover: subtle scale and shadow
 * - Size variants: sm and md
 */
export function TagBadge({
  tag,
  count,
  tagInfo,
  size = "md",
  active = false,
  onClick,
  removable = false,
  onRemove,
}: TagBadgeProps): React.ReactElement {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const displayName = getDisplayName({ tag, tagInfo });
  const color = getColor(tag, tagInfo);
  const countDisplay = getCountDisplay({ tag, count, tagInfo });

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onClick) {
        onClick(tag);
        return;
      }

      // Default: navigate to tag page
      const slug = tagInfo?.slug ?? tag;
      navigate(`/tags/${slug}`);
    },
    [tag, tagInfo, onClick, navigate]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (onRemove) onRemove(tag);
    },
    [tag, onRemove]
  );

  // Size classes
  const sizeClasses = size === "sm"
    ? "text-xs px-2 py-0.5 gap-0.5"
    : "text-sm px-3 py-1 gap-1";

  const iconSize = size === "sm" ? 12 : 14;
  const removeSize = size === "sm" ? 10 : 12;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full transition-all duration-150
        ${sizeClasses}
        ${active
          ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
          : countDisplay
            ? hovered
              ? "shadow-md scale-105"
              : "shadow-sm hover:shadow-md hover:scale-105"
            : ""
        }
      `}
      style={{
        ...(active
          ? {}
          : {
              backgroundColor: `${color}33`,
              color: color,
              border: `1px solid ${color}66`,
            }),
      }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role={onClick ? "button" : "listitem"}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") handleClick(e as unknown as React.MouseEvent);
            }
          : undefined
      }
    >
      <Tag size={iconSize} className="shrink-0" />
      <span className="truncate">{displayName}</span>
      {countDisplay !== null && (
        <span
          className={`
            ml-0.5 inline-flex items-center justify-center rounded-full
            ${active ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"}
            ${size === "sm" ? "min-w-[16px] h-4 px-1 text-[10px]" : "min-w-[20px] h-5 px-1.5 text-xs"}
          `}
        >
          {countDisplay}
        </span>
      )}
      {removable && (
        <button
          onClick={handleRemove}
          className={`
            ml-0.5 rounded-full p-0.5 transition-colors duration-100
            ${active
              ? "text-white/70 hover:text-white hover:bg-white/20"
              : "text-current opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
            }
          `}
          aria-label={`Remove tag ${displayName}`}
          tabIndex={-1}
        >
          <X size={removeSize} className="shrink-0" />
        </button>
      )}
    </span>
  );
}

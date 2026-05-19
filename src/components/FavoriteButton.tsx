import { useState, useCallback } from "react";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface FavoriteButtonProps {
  pageSlug: string;
  pageTitle: string;
  size?: "sm" | "md";
}

/* ── Component ─────────────────────────────────────────────────────── */

/**
 * Star/unstar toggle button for marking pages as favorites.
 *
 * - Outlined star when not favorited, filled indigo-500 when favorited.
 * - Scale animation on toggle (110 → 100, 200ms).
 * - Accessible: aria-label, aria-pressed for toggle semantics.
 * - Tooltip via title attribute.
 */
export function FavoriteButton({
  pageSlug,
  pageTitle,
  size = "md",
}: FavoriteButtonProps): React.ReactElement {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [justToggled, setJustToggled] = useState(false);

  const favored = isFavorite(pageSlug);
  const iconSize = size === "sm" ? 16 : 20;

  const handleClick = useCallback(() => {
    toggleFavorite(pageSlug, pageTitle);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 200);
  }, [toggleFavorite, pageSlug, pageTitle]);

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center rounded-full p-1
        text-gray-400 transition-colors duration-150
        hover:bg-indigo-50 hover:text-indigo-500
        dark:text-gray-500 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400
        ${favored ? "text-indigo-500" : ""}
      `}
      aria-label={favored ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favored}
      title={favored ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        size={iconSize}
        className={`
          transition-transform duration-200
          ${justToggled ? "scale-110" : "scale-100"}
          ${favored ? "fill-indigo-500" : ""}
        `}
        style={
          favored
            ? {
                filter: "drop-shadow(0 0 3px rgba(99,102,241,0.5))",
              }
            : undefined
        }
      />
    </button>
  );
}

/**
 * Keyboard navigation hook for list-based UIs.
 *
 * Supports:
 * - ArrowUp / ArrowDown: move selection
 * - Enter: activate current item
 * - Escape: blur / cancel
 *
 * @example
 * ```tsx
 * const { activeIndex, handleKeyDown } = useKeyboardNavigation({
 *   count: results.length,
 *   onSelect: (index) => navigate(results[index]),
 * });
 * ```
 */
interface UseKeyboardNavigationOptions {
  count: number;
  onSelect: (index: number) => void;
  onCancel?: () => void;
}

export function useKeyboardNavigation({
  count,
  onSelect,
  onCancel,
}: UseKeyboardNavigationOptions) {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % count);
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + count) % count);
          break;

        case "Enter":
          if (activeIndex >= 0 && activeIndex < count) {
            e.preventDefault();
            onSelect(activeIndex);
          }
          break;

        case "Escape":
          if (onCancel) {
            e.preventDefault();
            onCancel();
          }
          break;
      }
    },
    [count, activeIndex, onSelect, onCancel]
  );

  return { activeIndex, handleKeyDown };
}

import React from "react";

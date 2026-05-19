import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollSpyOptions {
  rootMargin?: string;
  threshold?: number;
}

/**
 * Returns the ID of the currently visible element via IntersectionObserver.
 *
 * Pass an array of element IDs to observe. The hook tracks which one
 * intersects the viewport most and returns its ID (or `null`).
 *
 * @param ids - Array of DOM element IDs to observe.
 * @param options - IntersectionObserver options.
 * @returns The currently active ID, or null.
 */
export function useScrollSpy(
  ids: string[],
  options?: UseScrollSpyOptions,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // Find the entry that is currently in view (intersectionRatio > 0)
      // If multiple entries are visible, prefer the one closest to the top
      const visible = entries
        .filter((entry) => entry.isIntersecting && entry.intersectionRatio > 0)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    },
    [],
  );

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId(null);
      return;
    }

    observer.current?.disconnect();
    observer.current = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: options?.rootMargin ?? '-80px 0px -60% 0px',
      threshold: options?.threshold ?? 0.1,
    });

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.current!.observe(el);
      }
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [ids, handleIntersect, options?.rootMargin, options?.threshold]);

  return activeId;
}

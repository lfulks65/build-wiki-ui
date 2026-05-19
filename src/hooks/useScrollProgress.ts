import { useState, useEffect, useCallback, useRef } from 'react';

export interface ScrollProgressState {
  /** 0–100 percentage scrolled through the container */
  progress: number;
  /** Current scroll position in px */
  scrollY: number;
  /** Whether user has scrolled past the `threshold` (default 400px) */
  isScrolled: boolean;
}

/**
 * Track scroll progress of a DOM element.
 *
 * @param containerRef — ref to the scrollable element. When `undefined`
 *                       the hook falls back to `window`.
 * @param threshold    — px scrolled before `isScrolled` flips to `true`
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { progress, scrollY, isScrolled } = useScrollProgress(containerRef);
 * ```
 */
export function useScrollProgress(
  containerRef?: React.RefObject<HTMLElement>,
  threshold: number = 400,
): ScrollProgressState {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Keep a stable ref to the latest state so the RAF callback always
  // reads the most recent `scrollY` value without needing an effect.
  const scrollYRef = useRef(0);
  scrollYRef.current = scrollY;

  const handleScroll = useCallback(() => {
    const container = containerRef?.current ?? window;
    let currentScrollY: number;
    let scrollHeight: number;
    let clientHeight: number;

    if (containerRef?.current) {
      currentScrollY = container.scrollTop;
      scrollHeight = container.scrollHeight;
      clientHeight = container.clientHeight;
    } else {
      currentScrollY = window.scrollY ?? window.pageYOffset;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = document.documentElement.clientHeight;
    }

    scrollYRef.current = currentScrollY;
    setScrollY(currentScrollY);

    const maxScroll = scrollHeight - clientHeight;
    const p = maxScroll > 0 ? Math.min(Math.max((currentScrollY / maxScroll) * 100, 0), 100) : 0;
    setProgress(p);
    setIsScrolled(currentScrollY >= threshold);
  }, [containerRef, threshold]);

  useEffect(() => {
    const container = containerRef?.current ?? window;
    container.addEventListener('scroll', handleScroll, { passive: true });
    // Fire once on mount so initial position is captured.
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, containerRef]);

  return { progress, scrollY, isScrolled };
}

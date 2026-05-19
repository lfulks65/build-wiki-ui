import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * useRouteFocus — moves focus to the main content area on route change
 * so screen readers announce the new page content.
 *
 * Place inside the Layout component, wrapping the main content area.
 */
export function useRouteFocus() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Set the ref on mount
    mainRef.current = document.getElementById("main-content");
  }, []);

  useEffect(() => {
    // Focus the main content area on route change
    // Small delay to allow the new content to render
    const timer = setTimeout(() => {
      const main = document.getElementById("main-content");
      if (main) {
        main.focus({ preventScroll: true });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return mainRef;
}

import { useState, useEffect } from "react";

export interface ScrollPosition {
  scrollY: number;
  direction: "up" | "down" | null;
  isAtTop: boolean;
  isScrolled: boolean;
}

export function useScrollPosition(): ScrollPosition {
  const [state, setState] = useState<ScrollPosition>({
    scrollY: 0,
    direction: null,
    isAtTop: true,
    isScrolled: false,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handler = () => {
      const currentY = window.scrollY;
      setState({
        scrollY: currentY,
        direction: currentY > lastScrollY ? "down" : "up",
        isAtTop: currentY <= 10,
        isScrolled: currentY > 10,
      });
      lastScrollY = currentY;
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return state;
}

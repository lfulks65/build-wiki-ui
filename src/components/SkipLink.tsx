import { useEffect, useRef } from "react";

/**
 * SkipLink — allows keyboard users to skip navigation and jump
 * directly to the main content area.
 */
export function SkipLink(): React.ReactElement {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: Event) => {
      e.preventDefault();
      mainRef.current?.focus();
    };

    const link = document.getElementById("skip-link");
    link?.addEventListener("click", handleClick);

    return () => link?.removeEventListener("click", handleClick);
  }, []);

  return (
    <a
      id="skip-link"
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
    >
      Skip to main content
    </a>
  );
}

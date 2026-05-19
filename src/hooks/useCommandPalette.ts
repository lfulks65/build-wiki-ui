import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook that manages the Command Palette state.
 * Listens for ⌘K (Mac) / Ctrl+K (Windows/Linux) globally and exposes
 * open/close/toggle functions.
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const prevActiveElement = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    prevActiveElement.current = document.activeElement as HTMLElement;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (prevActiveElement.current) {
      prevActiveElement.current.focus();
      prevActiveElement.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Listen for the global keyboard shortcut
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCommand = isMac ? event.metaKey : event.ctrlKey;

      if (isCommand && event.key === 'k') {
        event.preventDefault();
        toggle();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggle, close]);

  return { isOpen, open, close, toggle };
}

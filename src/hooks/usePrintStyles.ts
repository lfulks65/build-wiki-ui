import React, { useEffect, useRef, useState } from 'react';

/**
 * usePrintStyles — manages on-screen print preview mode.
 *
 * The actual print.css uses `@media print` so it works natively
 * during Ctrl/Cmd+P. This hook provides a `start()` method that
 * adds `data-print-mode` to `<body>`, giving a live on-screen
 * preview of what the printed page will look like.
 *
 * @returns handle object with `start()`, `stop()`, and `active`
 */

let styleTagInjected = false;

function injectPrintStyles() {
  if (styleTagInjected) return;

  const style = document.createElement('style');
  style.setAttribute('data-print-preview', 'true');

  style.textContent = `
    /* ── On-screen print preview ─────────────────────────────── */

    body[data-print-mode] {
      background: #ffffff !important;
    }

    body[data-print-mode] .print-hidden,
    body[data-print-mode] .sidebar,
    body[data-print-mode] header,
    body[data-print-mode] nav[aria-label="Sidebar"],
    body[data-print-mode] .theme-toggle,
    body[data-print-mode] .copy-code-btn,
    body[data-print-mode] [data-scroll-to-top],
    body[data-print-mode] [data-command-palette],
    body[data-print-mode] [data-toast],
    body[data-print-mode] [data-progress-bar],
    body[data-print-mode] .skeleton,
    body[data-print-mode] .skeleton-line,
    body[data-print-mode] .skeleton-lines {
      display: none !important;
    }

    body[data-print-mode] main,
    body[data-print-mode] [role="main"],
    body[data-print-mode] .main-content {
      max-width: none !important;
      margin: 0 !important;
      padding: 1in 0.75in !important;
      overflow: visible !important;
    }

    body[data-print-mode] aside,
    body[data-print-mode] [data-sidebar] {
      display: none !important;
      width: 0 !important;
    }

    body[data-print-mode] .prose h1,
    body[data-print-mode] .prose h2,
    body[data-print-mode] .prose pre,
    body[data-print-mode] .prose table {
      page-break-inside: avoid !important;
    }
  `;

  document.head.appendChild(style);
  styleTagInjected = true;
}

export interface PrintPreviewHandle {
  start: () => void;
  stop: () => void;
  active: boolean;
}

let previewActive = false;

export function usePrintStyles(): PrintPreviewHandle {
  const handle = useRef<PrintPreviewHandle | null>(null);

  if (!handle.current) {
    injectPrintStyles();

    handle.current = {
      start() {
        previewActive = true;
        document.body.setAttribute('data-print-mode', 'true');
      },
      stop() {
        previewActive = false;
        document.body.removeAttribute('data-print-mode');
      },
      get active() {
        return previewActive;
      },
    };
  }

  useEffect(() => {
    return () => {
      if (previewActive) {
        previewActive = false;
        document.body.removeAttribute('data-print-mode');
      }
    };
  }, []);

  return handle.current;
}

/**
 * useIsPrinting — detects when the browser is actively printing
 * via `beforeprint` / `afterprint` events.
 */
export function useIsPrinting(): boolean {
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const handlePrint = () => setPrinting(true);
    const handleAfterPrint = () => setPrinting(false);

    window.addEventListener('beforeprint', handlePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handlePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return printing;
}

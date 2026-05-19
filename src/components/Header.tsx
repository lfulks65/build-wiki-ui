import { useLocation } from "react-router-dom";
import { Printer } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { usePrintStyles } from "@/hooks/usePrintStyles";
import { useScrollPosition } from "@/hooks/useScrollPosition";

/* ── Page title mapping ───────────────────────────────────────────── */

const titleMap: Record<string, string> = {
  "/pages": "Pages",
  "/pages/": "Page",
  "/search": "Search",
  "/assets": "Assets",
  "/curator": "Curator",
  "/settings": "Settings",
  "/favorites": "Starred Pages",
};

function pageTitle(pathname: string): string {
  if (pathname === "/") return "Pages";
  if (pathname.startsWith("/pages")) {
    if (pathname === "/pages") return "Pages";
    return "Page";
  }
  return titleMap[pathname] || "Wiki";
}

interface HeaderProps {
  /** Override the computed page title. */
  title?: string;
}

/** ── Print preview button ────────────────────────────────────────── */

function PrintPreviewButton(): React.ReactElement {
  const printStyles = usePrintStyles();

  return (
    <button
      onClick={() => (printStyles.active ? printStyles.stop() : printStyles.start())}
      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500
                 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700
                 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      title={printStyles.active ? "Exit print preview" : "Preview print / Save as PDF"}
      aria-label={printStyles.active ? "Exit print preview" : "Preview print"}
    >
      <Printer size={18} />
    </button>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export function Header({ title }: HeaderProps): React.ReactElement {
  const { pathname } = useLocation();
  const displayTitle = title ?? pageTitle(pathname);
  const scroll = useScrollPosition();

  return (
    <header className={`
      sticky top-0 z-30 flex flex-col border-b transition-all duration-300 ease-in-out
      ${scroll.isScrolled
        ? "h-12 border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/90"
        : "h-16 border-transparent bg-white/70 backdrop-blur-sm dark:bg-gray-950/70"}
    `}>
      {/* Top row: page title + controls */}
      <div className={`flex items-center gap-3 px-4 ${scroll.isScrolled ? "h-12" : "h-9"}`}>
        <h1 className={`
          truncate font-semibold tracking-tight text-gray-900 dark:text-gray-100 transition-all duration-300
          ${scroll.isScrolled ? "text-base" : "text-lg"}
        `}>
          {displayTitle}
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <PrintPreviewButton />
          <span className="hidden h-5 w-14 shrink-0 lg:inline" data-tauri-drag-region />
        </div>
      </div>

      {/* Breadcrumbs — visible at top, hidden when scrolled */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${scroll.isScrolled ? "max-h-0 opacity-0" : "max-h-6 opacity-100"}
      `}>
        <div className="px-4 pb-1">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  );
}

import { useLocation } from "react-router-dom";
import { Printer } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { usePrintStyles } from "@/hooks/usePrintStyles";

/* ── Page title mapping ───────────────────────────────────────────── */

const titleMap: Record<string, string> = {
  "/pages": "Pages",
  "/pages/": "Page",
  "/search": "Search",
  "/assets": "Assets",
  "/curator": "Curator",
  "/settings": "Settings",
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

  return (
    <header className="sticky top-0 z-30 flex h-16 flex-col border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      {/* ── Top row: page title + controls ── */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Left: page title */}
        <h1 className="truncate text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          {displayTitle}
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: theme toggle + print + Tauri controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <PrintPreviewButton />

          {/* Tauri window controls spacer — visible only in Tauri */}
          <span
            className="hidden h-5 w-14 shrink-0 lg:inline"
            data-tauri-drag-region
          />
        </div>
      </div>

      {/* ── Bottom row: breadcrumb trail ── */}
      <div className="mt-1">
        <Breadcrumbs />
      </div>
    </header>
  );
}

import { Routes, Route, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";

/* ── Page placeholders ───────────────────────────────────────────── */

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          Wiki UI
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
          A modern, wiki-style knowledge base built with React, Vite,
          Tailwind CSS, and TypeScript.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/docs"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Browse Docs
          </Link>
          <Link
            to="/about"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            About
          </Link>
        </div>
      </div>
    </main>
  );
}

function DocsPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Documentation
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          This is the placeholder docs page. Add your wiki content here.
        </p>
      </div>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          About
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          This is the placeholder about page.
        </p>
      </div>
    </main>
  );
}

function PagesIndexPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          All Pages
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Browse all wiki pages here.
        </p>
      </div>
    </main>
  );
}

function PageViewPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Page View
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Viewing a wiki page.
        </p>
      </div>
    </main>
  );
}

function AssetsPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Assets
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Manage wiki assets here.
        </p>
      </div>
    </main>
  );
}

function SearchPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Search
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Search across all wiki content.
        </p>
      </div>
    </main>
  );
}

function CuratorPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Curator
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Content curation tools.
        </p>
      </div>
    </main>
  );
}

function SettingsPage() {
  return (
    <main className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Application settings.
        </p>
      </div>
    </main>
  );
}

/* ── Shell ───────────────────────────────────────────────────────── */

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* ── Header ── */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-lg font-semibold text-indigo-600 dark:text-indigo-400"
            >
              Wiki UI
            </Link>
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-4 sm:flex">
              <Link
                to="/docs"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Docs
              </Link>
              <Link
                to="/about"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                About
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Routes ── */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pages" element={<PagesIndexPage />} />
        <Route path="/pages/:slug" element={<PageViewPage />} />
        <Route path="/pages/:slug/:sub" element={<PageViewPage />} />
        <Route path="/pages/:slug/:sub/:deep" element={<PageViewPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/curator" element={<CuratorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

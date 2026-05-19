/* ── PageViewer — renders a single wiki page ──────────────────────── */

export function PageViewer(): React.ReactElement {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Page Viewer
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Rendered wiki page content (placeholder).
      </p>
    </div>
  );
}

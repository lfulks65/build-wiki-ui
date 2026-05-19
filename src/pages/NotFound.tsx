/* ── NotFound — 404 page placeholder ─────────────────────────────── */
import { Link } from "react-router-dom";

export function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          404
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Page not found
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-500">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/pages"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Go to Pages
        </Link>
      </div>
    </div>
  );
}

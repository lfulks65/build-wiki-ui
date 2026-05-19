import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";

/**
 * 404 — "Page not found" component for catch-all routes.
 *
 * Displays a centered card with an icon, heading, description,
 * and a link back to the Pages list at `/pages`.
 */
export function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10">
          <FileQuestion className="h-7 w-7 text-indigo-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-100">
          Page not found
        </h1>
        <p className="mb-6 text-sm text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/pages"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pages
        </Link>
      </div>
    </div>
  );
}

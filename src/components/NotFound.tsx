import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

export function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md text-center">
        <FileQuestion className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Page not found
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/pages"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Pages
        </Link>
      </div>
    </div>
  );
}

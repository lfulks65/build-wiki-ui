import { useState } from 'react';
import { Search as SearchIcon, FileText, Image, FileCode } from 'lucide-react';
import { searchPages } from '../lib/mock-api';
import type { SearchResult } from '../lib/tauri-api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await searchPages(q);
      setResults(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => doSearch(query);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Search</h1>

      {/* Search input */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search pages…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            doSearch(e.target.value);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                {r.type === 'page' ? (
                  <FileText className="w-4 h-4 text-indigo-500" />
                ) : (
                  <FileCode className="w-4 h-4 text-gray-400" />
                )}
                <h3 className="text-sm font-semibold">{r.title}</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {r.path}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                {r.snippet}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && query && results.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No results for "{query}"</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Type to search across all pages</p>
        </div>
      )}
    </div>
  );
}

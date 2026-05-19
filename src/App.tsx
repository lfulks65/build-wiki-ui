import { useState, useCallback } from 'react';
import { PageList } from './components/PageList';
import type { WikiPage } from './types/wiki';

// Sample data for demo purposes
const samplePages: WikiPage[] = [
  {
    id: '1',
    title: 'Getting Started',
    slug: 'getting-started',
    path: 'guides/getting-started',
    modified: new Date(Date.now() - 3_600_000), // 1 hour ago
    snippet: 'Learn how to set up your wiki and create your first page...',
    wordCount: 245,
    lastViewed: new Date(Date.now() - 1_800_000),
  },
  {
    id: '2',
    title: 'Markdown Syntax Guide',
    slug: 'markdown-guide',
    path: 'docs/markdown-guide',
    modified: new Date(Date.now() - 86_400_000), // 1 day ago
    snippet: 'Complete reference for all Markdown syntax supported by the wiki...',
    wordCount: 512,
    lastViewed: new Date(Date.now() - 7_200_000),
  },
  {
    id: '3',
    title: 'Team Guidelines',
    slug: 'team-guidelines',
    path: 'policies/team-guidelines',
    modified: new Date(Date.now() - 259_200_000), // 3 days ago
    snippet: 'Best practices and conventions for contributing to the team wiki...',
    wordCount: 189,
    lastViewed: new Date(Date.now() - 172_800_000),
  },
  {
    id: '4',
    title: 'API Documentation',
    slug: 'api-docs',
    path: 'dev/api-documentation',
    modified: new Date(Date.now() - 172_800_000), // 2 days ago
    snippet: 'REST API endpoints, authentication, and usage examples...',
    wordCount: 1024,
    lastViewed: new Date(Date.now() - 3_600_000),
  },
  {
    id: '5',
    title: 'Onboarding Checklist',
    slug: 'onboarding',
    path: 'hr/onboarding-checklist',
    modified: new Date(Date.now() - 518_400_000), // 6 days ago
    snippet: 'New hire onboarding steps and resources...',
    wordCount: 320,
    lastViewed: new Date(Date.now() - 345_600_000),
  },
];

function App() {
  const [demoState, setDemoState] = useState<'all' | 'loading' | 'empty' | 'error'>('all');

  const pages =
    demoState === 'loading'
      ? []
      : demoState === 'error'
        ? []
        : samplePages;

  const handleNavigate = useCallback((path: string) => {
    console.log('Navigate to:', path);
    // In a real app: router.push(path)
  }, []);

  const handleCreatePage = useCallback(() => {
    console.log('Navigate to: /pages/new');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Demo state toggle (for showcasing states) */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Wiki Pages
          </h1>

          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Pages' },
              { key: 'loading', label: 'Loading' },
              { key: 'empty', label: 'Empty' },
              { key: 'error', label: 'Error' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDemoState(key as typeof demoState)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  demoState === key
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Page List */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <PageList
            pages={pages}
            loading={demoState === 'loading'}
            error={demoState === 'error' ? 'Network error' : null}
            onNavigate={handleNavigate}
            onCreatePage={handleCreatePage}
          />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          Use the buttons above to toggle between states: all pages, loading skeleton, empty, and error.
        </p>
      </div>
    </div>
  );
}

export default App;

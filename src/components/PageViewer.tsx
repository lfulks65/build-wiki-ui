import { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface PageViewerProps {
  pageTitle: string;
}

interface PageContent {
  content: string;
  loading: boolean;
  error: string | null;
}

/**
 * Stub function to simulate fetching page content.
 * Replace with Tauri command call later.
 */
async function fetchPageContent(_pageTitle: string): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

  // Return sample markdown content for demo
  return `# Getting Started with Build Wiki

Welcome to **Build Wiki** — your knowledge base for the Build project.

## What is Build Wiki?

Build Wiki is a centralized documentation system that helps teams:

- Share knowledge across projects
- Document APIs, architecture, and processes
- Keep information up-to-date and discoverable

## Quick Start

### Installation

Install the Build Wiki CLI tool:

\`\`\`bash
npm install -g @build/wiki-cli
\`\`\`

Then initialize a new wiki:

\`\`\`bash
build-wiki init my-project
build-wiki serve --port 3000
\`\`\`

### Writing Your First Page

Create a new file with \`yaml frontmatter\` for metadata:

---
title: API Reference
date: 2024-01-15
tags: [api, reference]
---

# API Reference

All endpoints return JSON...

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| \`port\` | 3000 | Server port |
| \`host\` | localhost | Bind address |
| \`verbose\` | false | Enable debug logging |
| \`theme\` | light | UI theme (light/dark) |

## Important Notes

> **Warning:** Always back up your wiki data before running migrations.
> The \`build-wiki migrate\` command cannot be undone.

## Example Response

Here is a sample API response:

\`\`\`json
{
  "status": "success",
  "data": {
    "id": "wiki-001",
    "title": "Getting Started",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

## Next Steps

Check out the [API Documentation](https://docs.build.wiki/api) for
detailed endpoint specifications.

---

*Last updated by the Build Wiki team*
`;
}

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Loading content">
      <div className="skeleton skeleton-line h-8 w-3/4" />
      <div className="skeleton skeleton-line w-full" />
      <div className="skeleton skeleton-line w-5/6" />
      <div className="skeleton skeleton-line w-full" />
      <div className="skeleton skeleton-line h-6 w-1/2" />
      <div className="skeleton skeleton-line w-4/5" />
      <div className="skeleton skeleton-line w-3/4" />
      <div className="skeleton skeleton-line h-32 w-full" />
      <div className="skeleton skeleton-line w-full" />
      <div className="skeleton skeleton-line h-6 w-2/3" />
      <div className="skeleton skeleton-line w-full" />
      <div className="skeleton skeleton-line w-5/6" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-state max-w-lg mx-auto">
      <svg
        className="w-12 h-12 mx-auto mb-4 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
        Failed to load page
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="empty-state max-w-md mx-auto">
      <svg
        className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">
        This page is empty
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        No content has been added to this page yet.
      </p>
    </div>
  );
}

/**
 * PageViewer — fetches and renders markdown page content.
 *
 * Currently uses a stub fetch. Replace with Tauri command in the
 * build-wiki Tauri integration.
 */
export default function PageViewer({ pageTitle }: PageViewerProps) {
  const [pageContent, setPageContent] = useState<PageContent>({
    content: '',
    loading: true,
    error: null,
  });

  const fetchContent = () => {
    setPageContent({ content: '', loading: true, error: null });

    fetchPageContent(pageTitle)
      .then((content) => {
        if (!content.trim()) {
          setPageContent({ content: '', loading: false, error: null, isEmpty: true });
        } else {
          setPageContent({ content, loading: false, error: null });
        }
      })
      .catch((err) => {
        setPageContent({
          content: '',
          loading: false,
          error: err instanceof Error ? err.message : 'An unexpected error occurred',
        });
      });
  };

  useEffect(() => {
    fetchContent();
  }, [pageTitle]);

  if (pageContent.loading) {
    return <LoadingSkeleton />;
  }

  if (pageContent.error) {
    return <ErrorState message={pageContent.error} onRetry={fetchContent} />;
  }

  if (!pageContent.content.trim()) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      <MarkdownRenderer content={pageContent.content} className="w-full" />
    </div>
  );
}

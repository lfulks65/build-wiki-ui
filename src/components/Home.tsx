import { FileText, Search, LayoutDashboard, Settings, Plus } from 'lucide-react';
import type { VaultInfo } from '../lib/tauri-api';

const vaultData: VaultInfo = {
  path: '/Users/dev/wiki/vault',
  name: 'Build Wiki',
  pageCount: 7,
  assetCount: 5,
};

const pageList = [
  { title: 'Getting Started', path: 'getting-started.md', modified: '2025-05-15T09:30:00Z' },
  { title: 'Architecture Overview', path: 'architecture.md', modified: '2025-05-18T14:22:00Z' },
  { title: 'API Reference', path: 'api/reference.md', modified: '2025-05-17T11:45:00Z' },
  { title: 'Asset Pipeline', path: 'asset-pipeline.md', modified: '2025-05-16T08:10:00Z' },
  { title: 'Deployment Guide', path: 'deployment.md', modified: '2025-05-19T07:00:00Z' },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Build Wiki</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Your centralized knowledge base
        </p>
      </div>

      {/* Vault info card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <h2 className="text-lg font-semibold mb-4">Vault Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Pages" value={String(vaultData.pageCount)} />
          <StatCard label="Assets" value={String(vaultData.assetCount)} />
          <StatCard label="Status" value="Active" />
          <StatCard label="Size" value="Local" />
        </div>
      </div>

      {/* Recent pages */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Pages</h2>
        <div className="space-y-2">
          {pageList.slice(0, 5).map((page) => (
            <div
              key={page.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
              onClick={() => {
                const slug = page.path.replace(/\.md$/, '').replace(/\//g, '-');
                window.location.href = `/pages/${slug}`;
              }}
            >
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{page.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{page.path}</p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-600">
                {new Date(page.modified).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <QuickAction icon={FileText} label="Browse Pages" href="/pages" />
          <QuickAction icon={Search} label="Search" href="/search" />
          <QuickAction icon={LayoutDashboard} label="Assets" href="/assets" />
          <QuickAction icon={LayoutDashboard} label="Curator" href="/curator" />
          <QuickAction icon={Settings} label="Settings" href="/settings" />
          <QuickAction icon={Plus} label="New Page" href="/pages/new" />
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
        <kbd className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
          ⌘K
        </kbd>
        <span>for quick actions</span>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-sm font-medium"
    >
      <Icon className="w-4 h-4 text-gray-400" />
      {label}
    </a>
  );
}

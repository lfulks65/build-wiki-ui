import { useVaultInfo, usePages, useCuratorStatus } from "@/hooks/useApiQuery";

function App() {
  const { data: vault, isLoading: vaultLoading } = useVaultInfo();
  const { data: pages, isLoading: pagesLoading } = usePages();
  const { data: curator, isLoading: curatorLoading } = useCuratorStatus();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold">Build Wiki</h1>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Vault Info */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Vault</h2>
          {vaultLoading ? (
            <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />
          ) : vault ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-1">
              <p><span className="font-medium">Name:</span> {vault.name}</p>
              <p><span className="font-medium">Path:</span> {vault.path}</p>
              <p><span className="font-medium">Pages:</span> {vault.pageCount}</p>
              <p><span className="font-medium">Assets:</span> {vault.assetCount}</p>
            </div>
          ) : null}
        </section>

        {/* Pages */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Pages ({pages?.length ?? 0})</h2>
          {pagesLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-200 h-12 rounded-lg" />
              ))}
            </div>
          ) : pages ? (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {pages.map((page) => (
                <div key={page.path} className="px-4 py-3">
                  <p className="font-medium">{page.title}</p>
                  <p className="text-sm text-gray-500">{page.path}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* Curator Status */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Curator</h2>
          {curatorLoading ? (
            <div className="animate-pulse bg-gray-200 h-20 rounded-lg" />
          ) : curator ? (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-1">
              <p>
                <span className="font-medium">Status:</span>{" "}
                {curator.running ? "Running" : curator.idle ? "Idle" : "Stopped"}
              </p>
              <p><span className="font-medium">Queue Depth:</span> {curator.queueDepth}</p>
              {curator.lastRun && (
                <p>
                  <span className="font-medium">Last Run:</span>{" "}
                  {new Date(curator.lastRun).toLocaleString()}
                </p>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;

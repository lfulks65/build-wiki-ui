import { useCuratorStatus } from '../hooks/useApiQuery';
import { Settings, Clock, BarChart3, CheckCircle, AlertCircle, Zap } from 'lucide-react';

export default function Curator() {
  const { data: status, isLoading } = useCuratorStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Curator</h1>
        <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!status) return null;

  const isRunning = status.running;
  const isIdle = status.idle;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Curator</h1>
        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            isRunning
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}
        >
          {isRunning ? (
            <>
              <Zap className="w-3 h-3" /> Running
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" /> Idle
            </>
          )}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Queue Depth</span>
          </div>
          <p className="text-2xl font-bold">{status.queueDepth}</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            {isRunning ? <Zap className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <span className="text-xs font-medium">Status</span>
          </div>
          <p className="text-2xl font-bold capitalize">{isRunning ? 'Active' : 'Idle'}</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 col-span-2">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Last Run</span>
          </div>
          <p className="text-lg font-semibold">
            {status.lastRun
              ? new Date(status.lastRun).toLocaleString()
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Activity feed */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          Activity
        </h2>
        <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Curator configured and ready
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            No pending tasks in queue
          </p>
        </div>
      </div>

      {/* Config */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          Configuration
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Ingest Mode:</span>{' '}
            Fan-out with summaries
          </p>
          <p>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Lint Loop:</span>{' '}
            Daily
          </p>
          <p>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Batch Size:</span>{' '}
            20
          </p>
        </div>
      </div>
    </div>
  );
}

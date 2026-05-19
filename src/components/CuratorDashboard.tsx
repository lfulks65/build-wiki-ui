/** Curator Dashboard — main layout bringing all sub-components together. */

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import StatCard from './StatCard';
import ActivityFeed, { ActivityEntry } from './ActivityFeed';

/* ======================= Types ======================= */

type WorkerState = 'running' | 'idle' | 'stopped';

/** A curator job queued in the system. */
interface Job {
  id: string;
  assetName: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  duration?: string;
  timestamp: string;
  pagesCreated?: number;
  pagesUpdated?: number;
  errors?: string[];
}

/* ===================== Icons ======================= */

function QueueIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ProcessingIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function CheckIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

/* ====================== Mock Data ==================== */

const mockJobs: Job[] = [
  {
    id: 'job-001',
    assetName: 'Q4_Earnings_Deck.pdf',
    status: 'done',
    duration: '2m 14s',
    timestamp: '2 min ago',
    pagesCreated: 3,
    pagesUpdated: 1,
  },
  {
    id: 'job-002',
    assetName: 'product-roadmap-2026.png',
    status: 'processing',
    timestamp: 'Just now',
    pagesCreated: 0,
    pagesUpdated: 2,
  },
  {
    id: 'job-003',
    assetName: 'api-docs-migration.md',
    status: 'queued',
    timestamp: '5 min ago',
  },
  {
    id: 'job-004',
    assetName: 'meeting-notes-5-18.mp3',
    status: 'failed',
    duration: '45s',
    timestamp: '12 min ago',
    errors: [
      'Transcription service returned HTTP 502',
      'Falling back to local Whisper model (slow)',
    ],
  },
  {
    id: 'job-005',
    assetName: 'feature-spec-auth.md',
    status: 'done',
    duration: '1m 03s',
    timestamp: '18 min ago',
    pagesCreated: 1,
    pagesUpdated: 0,
  },
  {
    id: 'job-006',
    assetName: 'architecture-diagram.svg',
    status: 'done',
    duration: '52s',
    timestamp: '25 min ago',
    pagesCreated: 2,
    pagesUpdated: 0,
  },
];

/** Convert a Job to the ActivityFeed entry shape. */
function toActivityEntry(job: Job): ActivityEntry {
  return {
    id: job.id,
    title: job.assetName,
    status: job.status,
    timestamp: job.timestamp,
    duration: job.duration,
    details: (
      <div className="space-y-2">
        {job.pagesCreated !== undefined && (
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
            <span>Pages created</span>
            <span className="font-semibold text-gray-900 dark:text-white">{job.pagesCreated}</span>
          </div>
        )}
        {job.pagesUpdated !== undefined && job.pagesUpdated > 0 && (
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
            <span>Pages updated</span>
            <span className="font-semibold text-gray-900 dark:text-white">{job.pagesUpdated}</span>
          </div>
        )}
        {job.errors && job.errors.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="font-semibold text-red-600 dark:text-red-400 text-xs uppercase tracking-wide">
              Errors
            </div>
            {job.errors.map((err, i) => (
              <div key={i} className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 rounded px-2 py-1 font-mono">
                {err}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  };
}

/* =================== Dashboard ======================== */

export default function CuratorDashboard(): JSX.Element {
  const [workerState, setWorkerState] = useState<WorkerState>('running');

  const workerStatus = workerState === 'running' ? 'running' : workerState === 'idle' ? 'idle' : 'stopped';
  const workerLabel = workerState === 'running' ? 'Running' : workerState === 'idle' ? 'Idle' : 'Stopped';

  const pendingJobs = mockJobs.filter((j) => j.status === 'queued').length;
  const processingJobs = mockJobs.filter((j) => j.status === 'processing').length;
  const completedToday = mockJobs.filter((j) => j.status === 'done').length;
  const failedJobs = mockJobs.filter((j) => j.status === 'failed').length;

  const toggleWorker = () => {
    setWorkerState((s) => (s === 'running' ? 'stopped' : 'running'));
    // TODO: wire to Tauri command: invoke('pause_curator_worker') / invoke('resume_curator_worker')
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Curator Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Wiki knowledge engine — monitor &amp; control
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Worker Status Card ─────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Animated pulse dot */}
              <span
                className={`relative flex h-3 w-3 ${
                  workerState === 'running'
                    ? 'bg-emerald-500'
                    : workerState === 'idle'
                      ? 'bg-gray-400'
                      : 'bg-red-500'
                }`}
              >
                <span
                  className={`animate-pulse absolute inline-flex h-full w-full rounded-full ${
                    workerState === 'running'
                      ? 'bg-emerald-400'
                      : workerState === 'idle'
                        ? 'bg-gray-300'
                        : 'bg-red-400'
                  }`}
                />
              </span>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Worker {workerLabel}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status indicator — last checked just now
                </p>
              </div>
            </div>
            <StatusBadge status={workerStatus} />
          </div>
        </div>

        {/* ── Stat Cards (grid: 2 cols mobile, 4 cols desktop) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending Jobs"
            value={pendingJobs}
            icon={<QueueIcon />}
            trend="+12%"
          />
          <StatCard
            label="Processing"
            value={processingJobs}
            icon={<ProcessingIcon />}
            trend={processingJobs > 0 ? '+5%' : undefined}
          />
          <StatCard
            label="Completed Today"
            value={completedToday}
            icon={<CheckIcon />}
            trend="+18%"
          />
          <StatCard
            label="Failed"
            value={failedJobs}
            icon={<AlertIcon />}
            trend={failedJobs > 0 ? '-3%' : undefined}
          />
        </div>

        {/* ── Quick Actions ──────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/60 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                // TODO: invoke('enqueue_all_pending')
                console.log('[stub] Enqueue All Pending');
              }}
              disabled={pendingJobs === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Enqueue All Pending
            </button>

            <button
              type="button"
              onClick={() => {
                // TODO: invoke('retry_failed_jobs')
                console.log('[stub] Retry Failed');
              }}
              disabled={failedJobs === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Retry Failed
            </button>

            <button
              type="button"
              onClick={toggleWorker}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                workerState === 'running'
                  ? 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
              }`}
            >
              {workerState === 'running' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause Worker
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  Resume Worker
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Buttons are stubbed — wire to Tauri commands for live control.
          </p>
        </div>

        {/* ── Activity Feed ──────────────────────────────── */}
        <ActivityFeed
          entries={mockJobs.map(toActivityEntry)}
          title="Recent Curator Jobs"
        />
      </main>
    </div>
  );
}

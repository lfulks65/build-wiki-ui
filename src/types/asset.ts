export type AssetType = 'image' | 'document' | 'audio' | 'video' | 'other';

export type AssetStatus = 'Ready' | 'Processing' | 'Failed';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  size: number;
  status: AssetStatus;
  dateAdded: string;
}

export const mockAssets: Asset[] = [
  { id: '1', name: 'hero-banner.jpg', type: 'image', size: 2457600, status: 'Ready', dateAdded: '2025-05-10T14:30:00Z' },
  { id: '2', name: 'product-guide.pdf', type: 'document', size: 1843200, status: 'Ready', dateAdded: '2025-05-11T09:15:00Z' },
  { id: '3', name: 'podcast-ep42.mp3', type: 'audio', size: 45678000, status: 'Processing', dateAdded: '2025-05-12T16:45:00Z' },
  { id: '4', name: 'demo-walkthrough.mp4', type: 'video', size: 125829120, status: 'Ready', dateAdded: '2025-05-13T11:00:00Z' },
  { id: '5', name: 'icon-set.svg', type: 'image', size: 48120, status: 'Failed', dateAdded: '2025-05-14T08:20:00Z' },
  { id: '6', name: 'brand-styles.css', type: 'document', size: 12400, status: 'Ready', dateAdded: '2025-05-14T13:30:00Z' },
  { id: '7', name: 'sfx-explosion.wav', type: 'audio', size: 5242880, status: 'Ready', dateAdded: '2025-05-15T10:00:00Z' },
  { id: '8', name: 'tutorial-intro.mp4', type: 'video', size: 89128960, status: 'Processing', dateAdded: '2025-05-15T15:30:00Z' },
  { id: '9', name: 'logo-white.png', type: 'image', size: 34560, status: 'Ready', dateAdded: '2025-05-16T09:00:00Z' },
  { id: '10', name: 'api-docs.md', type: 'document', size: 8400, status: 'Ready', dateAdded: '2025-05-16T14:00:00Z' },
  { id: '11', name: 'background-music.ogg', type: 'audio', size: 31457280, status: 'Failed', dateAdded: '2025-05-17T11:30:00Z' },
  { id: '12', name: 'screenshot-dashboard.png', type: 'image', size: 1567800, status: 'Ready', dateAdded: '2025-05-17T16:00:00Z' },
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

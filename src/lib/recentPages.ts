export interface RecentPage {
  id: string;
  title: string;
  slug: string;
  visitedAt: string;
}

export interface RecentPagesResult {
  pages: RecentPage[];
  addPage: (page: Omit<RecentPage, 'visitedAt'>) => void;
  clear: () => void;
}

const STORAGE_KEY = 'wiki:recentPages';
const MAX_ITEMS = 3;

export function loadRecentPages(): RecentPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentPage[];
  } catch {
    return [];
  }
}

export function saveRecentPages(pages: RecentPage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch { /* silently fail */ }
}

export function addPageToRecent(
  pages: RecentPage[],
  newPage: Omit<RecentPage, 'visitedAt'>,
): RecentPage[] {
  const filtered = pages.filter((p) => p.id !== newPage.id);
  const added: RecentPage = { ...newPage, visitedAt: new Date().toISOString() };
  return [added, ...filtered].slice(0, MAX_ITEMS);
}

export function clearRecentPages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

import { useState, useEffect, useCallback } from 'react';

function formatRelative(date: Date): string {
  const now = new Date();
  let diffMs = now.getTime() - date.getTime();

  // Handle future dates gracefully
  if (diffMs < 0) {
    return 'just now';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffMon = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'just now';
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr === 1) return '1 hour ago';
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffMon < 12) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date as a human-readable relative time string.
 * Updates every 60 seconds so the display stays current.
 */
export function useRelativeTime(date: string | Date | undefined): string {
  const dateObj = date ? new Date(date) : null;
  const valid = dateObj && !isNaN(dateObj.getTime());

  const [relative, setRelative] = useState(() =>
    valid ? formatRelative(dateObj) : ''
  );

  const refresh = useCallback(() => {
    if (valid) {
      setRelative(formatRelative(dateObj!));
    }
  }, [valid, dateObj]);

  useEffect(() => {
    if (!valid) return;

    setRelative(formatRelative(dateObj!));

    // Refresh every 60 seconds
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [valid, dateObj, refresh]);

  return relative;
}

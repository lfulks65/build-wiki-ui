/**
 * Calculate estimated reading time for markdown/text content.
 * Average adult reading speed: ~238 words per minute (wpm).
 * Returns minutes rounded up, minimum 1 min for any non-empty text.
 */
export function calculateReadingTime(text: string, wpm: number = 238): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Format reading time for display.
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return "1 min read";
  return `${minutes} min read`;
}

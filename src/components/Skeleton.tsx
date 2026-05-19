interface SkeletonProps {
  variant?: 'text' | 'card' | 'list' | 'avatar';
  count?: number;
  className?: string;
}

/**
 * Reusable skeleton loading component with pulse animation.
 * Used by PageList, AssetBrowser, SearchPage and other components.
 */
export function Skeleton({
  variant = 'text',
  count = 1,
  className = '',
}: SkeletonProps) {
  const baseClasses =
    'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700';

  const variantClasses: Record<string, string> = {
    text: 'h-4 w-full',
    card: 'h-24 w-full rounded-lg',
    list: 'h-20 w-full rounded-lg',
    avatar: 'h-10 w-10 rounded-full',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  ));

  return <>{items}</>;
}

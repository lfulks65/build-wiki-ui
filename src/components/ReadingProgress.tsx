import { useRef } from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';

interface ReadingProgressProps {
  /** The scrollable content container. When omitted the hook falls
   *  back to `window`. */
  targetRef?: React.RefObject<HTMLElement>;
}

/**
 * Thin reading-progress bar placed directly below the header.
 *
 * Shows 0→100% as the user scrolls through the page content.
 * Hidden automatically when the content fits within the viewport.
 */
export default function ReadingProgress({
  targetRef,
}: ReadingProgressProps): JSX.Element | null {
  const { progress } = useScrollProgress(targetRef, 400);

  // Hide when there's nothing to scroll through.
  if (progress <= 0) return null;

  return (
    <div
      className="fixed left-0 right-0 top-16 z-[10]"
      aria-hidden="true"
    >
      <div className="h-[3px] w-full overflow-hidden bg-transparent">
        <div
          className="h-full origin-left"
          style={{
            width: `${progress}%`,
            background:
              'linear-gradient(to right, #818cf8, #4f46e5, #7c3aed)',
            boxShadow: '0 0 8px rgba(79, 70, 229, 0.3)',
            transition: 'width 100ms linear',
          }}
        />
      </div>
    </div>
  );
};

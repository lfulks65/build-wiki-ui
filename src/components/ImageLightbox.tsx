import { useEffect, useRef, useCallback, CSSProperties } from 'react';

interface ImageLightboxProps {
  /** URL of the image to display */
  src: string | null;
  /** Alt text for accessibility */
  alt?: string;
  /** Called when the lightbox should close */
  onClose: () => void;
  /** Optional: navigate to previous image */
  onPrev?: () => void;
  /** Optional: navigate to next image */
  onNext?: () => void;
  /** Whether there are previous images to navigate to */
  hasPrev?: boolean;
  /** Whether there are next images to navigate to */
  hasNext?: boolean;
}

/**
 * ImageLightbox — full-screen overlay for viewing images at full resolution.
 *
 * Features:
 * - Centered image constrained to viewport (max-w-[90vw], max-h-[85vh])
 * - Close button (X) in top-right corner
 * - Prev/Next arrow buttons when multiple images exist
 * - Image caption/alt text below the image
 * - Click backdrop (not image) to close
 * - Keyboard controls: Esc to close, ArrowLeft/ArrowRight for navigation
 * - Smooth scale-in animation on open
 * - Body scroll prevention while open (handled by the hook)
 * - Dark mode compatible (backdrop is always dark)
 */
export default function ImageLightbox({
  src,
  alt = '',
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: ImageLightboxProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const isOpen = src !== null;

  // Close when clicking the backdrop (but not when clicking the image itself)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // Keyboard controls: Esc to close, arrows for navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (onPrev && hasPrev) {
            e.preventDefault();
            onPrev();
          }
          break;
        case 'ArrowRight':
          if (onNext && hasNext) {
            e.preventDefault();
            onNext();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]);

  // Move focus to image when lightbox opens
  useEffect(() => {
    if (isOpen && imageRef.current) {
      imageRef.current.focus();
    }
  }, [isOpen, src]);

  if (!isOpen) return null;

  const imageStyle: CSSProperties = {
    animation: 'lightbox-in 200ms ease-out forwards',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer: ${alt}`}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[110] rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close image viewer"
        tabIndex={0}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Prev button */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous image"
          tabIndex={0}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next image"
          tabIndex={0}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Image container */}
      <div className="relative flex max-h-[85vh] w-full items-center justify-center px-16 sm:px-20">
        <img
          ref={imageRef}
          src={src || undefined}
          alt={alt}
          className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl object-contain transition-opacity duration-200"
          style={imageStyle}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </div>

      {/* Caption */}
      {alt && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-sm text-white/60">{alt}</p>
        </div>
      )}
    </div>
  );
}

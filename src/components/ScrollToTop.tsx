import { ArrowUp } from 'lucide-react';
import { useScrollProgress } from '@/hooks/useScrollProgress';

/**
 * Floating action button that fades in when the user scrolls past 400px.
 *
 * Smooth-scrolls to the top on click and fades out when near the top.
 */
export default function ScrollToTop(): JSX.Element | null {
  const { scrollY, isScrolled } = useScrollProgress(undefined, 400);

  // Determine visibility:
  //   • Visible when scrolled ≥ 400px (isScrolled === true)
  //   • Hidden when scrolled < 200px (near top)
  const show = scrollY >= 400;
  const hide = scrollY < 200;

  if (!show) return null;

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={
        'fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center ' +
        'rounded-full bg-indigo-600 shadow-lg ' +
        'text-white transition-all duration-200 ease-out ' +
        'hover:scale-110 hover:shadow-xl ' +
        'dark:bg-indigo-500 ' +
        (hide ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100')
      }
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

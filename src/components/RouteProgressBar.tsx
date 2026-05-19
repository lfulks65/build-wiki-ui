import { useCallback, useEffect, useRef, useState } from "react";
import { useRouterProgress } from "@/hooks/useRouterProgress";

/* ── Constants ─────────────────────────────────────────────────────── */

const INDETERMINATE_TARGET = 85; // % to reach while actively loading
const FADE_OUT_DELAY = 200; // ms after completion before fading
const ANIM_DURATION = 2500; // ms to reach ~85% during loading

/* ── Component ─────────────────────────────────────────────────────── */

/**
 * Global route-loading progress bar (NProgress-style).
 *
 * Appears automatically on route navigation start, animates smoothly
 * during loading, and fades out when the transition completes.
 *
 * Position: fixed top-0 left-0, z-50 (above the sticky header at z-30).
 */
export function RouteProgressBar(): React.ReactElement | null {
  const { isNavigating } = useRouterProgress();
  const [progress, setProgress] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [completing, setCompleting] = useState<boolean>(false);

  const rafId = useRef<number | null>(null);
  const navigatingRef = useRef<boolean>(false);
  const completedAtRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  /* ── Smoothly animate via requestAnimationFrame ─────────────────── */
  const animateTo = useCallback((target: number, durationMs: number) => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    const start = performance.now();
    const startProgress = currentProgressRef.current;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const newVal = startProgress + (target - startProgress) * eased;
      currentProgressRef.current = newVal;
      setProgress(newVal);
      if (t < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        rafId.current = null;
      }
    };
    rafId.current = requestAnimationFrame(tick);
  }, []);

  /* ── Navigation started ───────────────────────────────────────── */
  useEffect(() => {
    if (isNavigating) {
      navigatingRef.current = true;

      const timeSinceComplete = performance.now() - completedAtRef.current;
      const isRapid = timeSinceComplete < 300;

      // Start from current progress on rapid successive navigations
      const startFrom = isRapid ? currentProgressRef.current : 0;
      currentProgressRef.current = startFrom;
      setProgress(startFrom);
      setVisible(true);
      setCompleting(false);

      // Animate toward indeterminate target (rAF-driven, no CSS transition)
      animateTo(INDETERMINATE_TARGET, ANIM_DURATION);
    }
  }, [isNavigating, animateTo]);

  /* ── Navigation completed ─────────────────────────────────────── */
  useEffect(() => {
    if (!isNavigating && visible && navigatingRef.current) {
      navigatingRef.current = false;
      completedAtRef.current = performance.now();

      // Finish remaining to 100% with CSS transition
      if (currentProgressRef.current < 100) {
        setCompleting(true);
        currentProgressRef.current = 100;
        setProgress(100);
      }

      // Schedule fade-out after CSS transition completes
      const timer = setTimeout(() => {
        setVisible(false);
      }, FADE_OUT_DELAY);

      return () => clearTimeout(timer);
    }
  }, [isNavigating, visible]);

  /* ── Cleanup on unmount ───────────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  /* ── Render ───────────────────────────────────────────────────── */
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
      style={{
        transition: `opacity ${FADE_OUT_DELAY}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
      role="progressbar"
      aria-busy="true"
      aria-valuetext={`${Math.round(progress)}%`}
    >
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          transition: completing
            ? "width 300ms cubic-bezier(0.4, 0, 0.2, 1)"
            : "none",
          background: "linear-gradient(to right, #818cf8, #6366f1, #a855f7)",
          boxShadow: "0 1px 3px rgba(99, 102, 241, 0.4)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}

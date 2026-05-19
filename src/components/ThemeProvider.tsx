import type { ReactNode } from "react";
import { ThemeProvider as ThemeProviderCtx } from "@/contexts/ThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider — wraps the application and provides theme context.
 *
 * Theme persistence across page loads is handled by reading `wiki-theme`
 * from `localStorage` on mount.  FOUC prevention (no flash of wrong
 * theme before React hydrates) is handled by the inline script in
 * `index.html` that applies the `dark` class to `<html>` before paint.
 */
export function ThemeProvider({ children }: ThemeProviderProps): React.ReactElement {
  return <ThemeProviderCtx>{children}</ThemeProviderCtx>;
}

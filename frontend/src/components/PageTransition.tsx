import { ViewTransition, type ReactNode } from "react";

/**
 * Wraps each page's content (not the layout — layouts persist across
 * navigations, so enter/exit would never fire there). Next's App Router
 * runs every navigation as a transition, so these animate on their own;
 * the classes map to ::view-transition-* rules in globals.css.
 * `default="none"` keeps it quiet for everything that isn't a page change
 * (router.refresh, Suspense reveals). Browsers without the View
 * Transitions API just swap pages as before.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}

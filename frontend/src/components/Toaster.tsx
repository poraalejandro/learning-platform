"use client";

import { useEffect, useState } from "react";
import { onToast, type ToastInput } from "@/lib/fx";

type ActiveToast = ToastInput & { id: number; leaving: boolean };

const VISIBLE_MS = 4200;
const LEAVE_MS = 220;
const MAX_VISIBLE = 3;

/**
 * Mounted once in the root layout (not the per-page Navbar) so a toast
 * fired right before a navigation — "Node complete!" then clicking Next —
 * survives the page change instead of vanishing with the old page.
 */
export function Toaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    let nextId = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };

    const unsubscribe = onToast((input) => {
      const id = nextId++;
      setToasts((current) => [...current, { ...input, id, leaving: false }].slice(-MAX_VISIBLE));
      later(() => {
        setToasts((current) => current.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        later(() => setToasts((current) => current.filter((t) => t.id !== id)), LEAVE_MS);
      }, VISIBLE_MS);
    });

    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface px-4 py-3 shadow-lg transition-all duration-200 ${
            t.leaving ? "translate-y-2 opacity-0" : "animate-rise-in"
          }`}
        >
          {t.icon && (
            <span className="text-xl leading-none" aria-hidden>
              {t.icon}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium">{t.title}</p>
            {t.body && <p className="mt-0.5 text-xs text-muted">{t.body}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

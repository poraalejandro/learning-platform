/**
 * Tiny window-event bus for game feedback (toasts, XP gains). Plain DOM
 * events rather than React context because the emitters are async helpers
 * in lib/ (called after a Supabase write resolves), not components — and
 * the listeners (Toaster in the root layout, XpChip in the navbar) live in
 * unrelated parts of the tree.
 */

export type Point = { x: number; y: number };

export type ToastInput = {
  title: string;
  body?: string;
  icon?: string;
};

export type XpGain = {
  delta: number;
  xp: number;
  streak: number;
  streakDate: string | null;
  /** Viewport point the "+N XP" float starts from (usually the button pressed). */
  origin?: Point;
};

const TOAST_EVENT = "pyquest:toast";
const XP_EVENT = "pyquest:xp";

export function toast(input: ToastInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastInput>(TOAST_EVENT, { detail: input }));
}

export function onToast(handler: (t: ToastInput) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<ToastInput>).detail);
  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
}

export function emitXp(gain: XpGain) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<XpGain>(XP_EVENT, { detail: gain }));
}

export function onXp(handler: (g: XpGain) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<XpGain>).detail);
  window.addEventListener(XP_EVENT, listener);
  return () => window.removeEventListener(XP_EVENT, listener);
}

/** Center of an element, for animations triggered by keyboard (no pointer position). */
export function centerOf(el: Element | null | undefined): Point | undefined {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Where a click happened, falling back to the target's center when the
 * click came from the keyboard (Enter/Space on a focused button reports
 * clientX/Y of 0 and detail 0).
 */
export function pointFromClick(e: { clientX: number; clientY: number; detail: number; currentTarget: Element }): Point | undefined {
  if (e.detail === 0) return centerOf(e.currentTarget);
  return { x: e.clientX, y: e.clientY };
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

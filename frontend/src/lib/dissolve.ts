import { prefersReducedMotion, type Point } from "@/lib/fx";

/**
 * Soft-edged "dissolve" transitions driven by an animated CSS mask:
 *
 * - from a point: a circle with a feathered edge grows from where the user
 *   clicked or tapped;
 * - in a direction: a feathered edge sweeps across the element the way the
 *   user swiped.
 *
 * Driven per-frame with requestAnimationFrame rather than a CSS transition
 * because the thing that animates is a value *inside* mask-image, which
 * plain CSS can't interpolate without @property registration — rAF works the
 * same in every browser that supports masks at all. A light blur rides
 * along so the edge reads as "diffused", not as a hard wipe.
 *
 * Under prefers-reduced-motion everything resolves immediately.
 */
export type DissolveOrigin = { kind: "point"; at: Point } | { kind: "direction"; dx: number; dy: number };

const FEATHER_PX = 70;
const FEATHER_PCT = 28;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function tween(duration: number, onFrame: (progress: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      onFrame(easeOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

function setMask(el: HTMLElement, value: string) {
  el.style.setProperty("mask-image", value);
  el.style.setProperty("-webkit-mask-image", value);
}

export function clearDissolve(el: HTMLElement) {
  el.style.removeProperty("mask-image");
  el.style.removeProperty("-webkit-mask-image");
  el.style.removeProperty("filter");
  el.style.removeProperty("opacity");
  el.style.removeProperty("translate");
}

/** CSS gradient angle pointing the same way as a screen-space vector (y grows downward). */
function cssAngle(dx: number, dy: number) {
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

function radiusToCover(el: HTMLElement, at: Point) {
  const r = el.getBoundingClientRect();
  const x = at.x - r.left;
  const y = at.y - r.top;
  const corners = [
    [0, 0],
    [r.width, 0],
    [0, r.height],
    [r.width, r.height],
  ];
  const far = Math.max(...corners.map(([cx, cy]) => Math.hypot(cx - x, cy - y)));
  return { x, y, far };
}

/**
 * Hides `el` fully, synchronously. Call before the element becomes visible
 * so the first painted frame is already masked — no one-frame flash.
 */
export function primeDissolveIn(el: HTMLElement) {
  if (prefersReducedMotion()) return;
  setMask(el, "linear-gradient(transparent, transparent)");
}

export async function dissolveIn(el: HTMLElement, origin: DissolveOrigin, duration = 560) {
  if (prefersReducedMotion()) {
    clearDissolve(el);
    return;
  }

  if (origin.kind === "point") {
    const { x, y, far } = radiusToCover(el, origin.at);
    await tween(duration, (p) => {
      const r = p * (far + FEATHER_PX);
      setMask(el, `radial-gradient(circle at ${x}px ${y}px, #000 ${r - FEATHER_PX}px, transparent ${r}px)`);
      el.style.filter = `blur(${(1 - p) * 6}px)`;
    });
  } else {
    const angle = cssAngle(origin.dx, origin.dy);
    await tween(duration, (p) => {
      const edge = p * (100 + FEATHER_PCT);
      setMask(el, `linear-gradient(${angle}deg, #000 ${edge - FEATHER_PCT}%, transparent ${edge}%)`);
      el.style.filter = `blur(${(1 - p) * 6}px)`;
    });
  }
  clearDissolve(el);
}

/** Leaves the element hidden (mask fully transparent) — the caller unmounts or swaps it right after. */
export async function dissolveOut(el: HTMLElement, origin: DissolveOrigin, duration = 380) {
  if (prefersReducedMotion()) return;

  if (origin.kind === "point") {
    const { x, y, far } = radiusToCover(el, origin.at);
    await tween(duration, (p) => {
      const r = p * (far + FEATHER_PX);
      setMask(el, `radial-gradient(circle at ${x}px ${y}px, transparent ${r - FEATHER_PX}px, #000 ${r}px)`);
      el.style.filter = `blur(${p * 5}px)`;
    });
  } else {
    const angle = cssAngle(origin.dx, origin.dy);
    const len = Math.hypot(origin.dx, origin.dy) || 1;
    const ux = origin.dx / len;
    const uy = origin.dy / len;
    await tween(duration, (p) => {
      const edge = p * (100 + FEATHER_PCT);
      setMask(el, `linear-gradient(${angle}deg, transparent ${edge - FEATHER_PCT}%, #000 ${edge}%)`);
      el.style.filter = `blur(${p * 5}px)`;
      el.style.translate = `${ux * p * 40}px ${uy * p * 40}px`;
    });
  }
}

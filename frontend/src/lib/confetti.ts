import confettiLib from "canvas-confetti";

const COLORS = ["#3f6f95", "#7fb2dd", "#d3a13a", "#e8c569"];

// Our own instance instead of the library's default export: the default
// one renders through a Web Worker with an OffscreenCanvas, and resizing
// the window after a burst (rotating a phone, say) makes it call
// getBoundingClientRect on that OffscreenCanvas and throw. Main-thread
// rendering is plenty for a one-second burst. Created lazily so nothing
// touches `document` during server rendering.
let instance: ReturnType<typeof confettiLib.create> | null = null;
function confetti(options: confettiLib.Options) {
  instance ??= confettiLib.create(undefined, { resize: true, useWorker: false });
  return instance(options);
}

/** Small celebratory burst on solving an exercise. Respects prefers-reduced-motion itself (disableForReducedMotion). */
export function celebrate() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: COLORS,
    disableForReducedMotion: true,
  });
}

/** Bigger, two-sided burst for finishing a whole node — rarer, so it gets more. */
export function celebrateNode() {
  for (const x of [0.15, 0.85]) {
    confetti({
      particleCount: 120,
      spread: 80,
      startVelocity: 55,
      angle: x < 0.5 ? 60 : 120,
      origin: { x, y: 0.75 },
      colors: [...COLORS, "#4ade80"],
      disableForReducedMotion: true,
    });
  }
}

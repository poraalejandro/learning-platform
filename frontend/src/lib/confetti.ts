import confetti from "canvas-confetti";

/** Small celebratory burst on solving an exercise. Respects prefers-reduced-motion itself (disableForReducedMotion). */
export function celebrate() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#3f6f95", "#7fb2dd", "#d3a13a", "#e8c569"],
    disableForReducedMotion: true,
  });
}

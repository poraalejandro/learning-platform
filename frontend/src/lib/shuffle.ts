/**
 * A shuffle that gives the same order on the server and in the browser.
 * Exercises are server-rendered and then hydrated; with Math.random the two
 * renders disagreed, React threw a hydration error and re-drew the whole
 * exercise. Seeding from the exercise id keeps the order stable (per
 * exercise) while still scrambling it — and never hands back the answer
 * itself: a shuffle that lands on the original order is rotated by one.
 */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // mulberry32
  const random = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (copy.length > 1 && copy.every((item, i) => item === items[i])) copy.push(copy.shift()!);
  return copy;
}

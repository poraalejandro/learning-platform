/**
 * Manual light/dark override on top of the OS preference. The choice is a
 * per-device display setting, so localStorage is the right home for it
 * (unlike progress, which must never live there — see CLAUDE.md).
 *
 * The active override is a `data-theme` attribute on <html>; globals.css
 * keys both its CSS variables and Tailwind's `dark:` variant off it. The
 * inline script in layout.tsx applies it before first paint, so a saved
 * preference never flashes the wrong theme on load.
 */
export type ThemePref = "system" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "pyquest:theme";
const CHANGE_EVENT = "pyquest:theme-change";

let cachedPref: ThemePref | null = null;

function readStoredPref(): ThemePref {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function getThemePref(): ThemePref {
  if (cachedPref === null) cachedPref = readStoredPref();
  return cachedPref;
}

export function setThemePref(pref: ThemePref) {
  cachedPref = pref;
  try {
    if (pref === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // storage blocked (private mode, etc.) — the choice still applies for this page view
  }
  if (pref === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = pref;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getEffectiveTheme(): EffectiveTheme {
  const pref = getThemePref();
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Fires on both a manual toggle and an OS-level theme change. For useSyncExternalStore. */
export function subscribeTheme(callback: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/** Runs before hydration (inlined in layout.tsx), so it can't import anything. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

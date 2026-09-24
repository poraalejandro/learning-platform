"use client";

import { useSyncExternalStore } from "react";
import { getThemePref, setThemePref, subscribeTheme, type ThemePref } from "@/lib/theme";

const NEXT: Record<ThemePref, ThemePref> = { system: "light", light: "dark", dark: "system" };
const ICON: Record<ThemePref, string> = { system: "🖥️", light: "☀️", dark: "🌙" };
const LABEL: Record<ThemePref, string> = {
  system: "Theme: follows your system",
  light: "Theme: light",
  dark: "Theme: dark",
};

/** Cycles system → light → dark. Server snapshot is "system" (the server can't see localStorage). */
export function ThemeToggle() {
  const pref = useSyncExternalStore(subscribeTheme, getThemePref, () => "system" as const);

  return (
    <button
      type="button"
      onClick={() => setThemePref(NEXT[pref])}
      aria-label={`${LABEL[pref]} — click to change`}
      title={LABEL[pref]}
      className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all duration-150 hover:bg-surface-2 active:scale-90"
    >
      <span key={pref} className="animate-pop-in" aria-hidden>
        {ICON[pref]}
      </span>
    </button>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isTypingTarget, SEARCH_INPUT_ID } from "@/lib/keys";

/**
 * App-wide shortcuts: "/" or Ctrl/⌘+K jumps to search from anywhere (and
 * focuses the box if you're already there). Renders nothing — the visible
 * hints live next to the things they trigger, desktop-only.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isSlash = e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target);
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (!isSlash && !isCmdK) return;

      e.preventDefault();
      const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null;
      if (pathname === "/search" && input) {
        input.focus();
        input.select();
      } else {
        router.push("/search");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router]);

  return null;
}

"use client";

import { useEffect } from "react";
import type { NodeStatus } from "@/lib/skillTree";
import { toast } from "@/lib/fx";

// Effects run twice in dev (StrictMode); the second run would see the
// snapshot the first one just saved and find nothing to celebrate. This
// makes each (user, statuses) pair play exactly once per page load.
let lastHandled: string | null = null;

/**
 * Plays "what changed since you last looked at the tree": nodes that became
 * completed pulse green and redraw their outgoing connectors, nodes that
 * became unlocked glow and announce themselves.
 *
 * "Since you last looked" is remembered in localStorage — a per-device
 * record of what's already been *celebrated*, purely cosmetic. It is not
 * progress: statuses always come from the server's derivation, this only
 * decides whether to animate them. Losing it (new device, cleared storage)
 * just means the first visit is quiet, never that progress is wrong.
 *
 * Renders nothing; animates the server-rendered cards by data-node-id /
 * data-edge-from, so the tree itself can stay a Server Component.
 */
export function TreeCelebration({
  userId,
  statuses,
  titles,
}: {
  userId: string;
  statuses: Record<string, NodeStatus>;
  titles: Record<string, string>;
}) {
  useEffect(() => {
    const key = `pyquest:tree-seen:${userId}`;
    const signature = `${key}|${JSON.stringify(statuses)}`;
    if (lastHandled === signature) return;
    lastHandled = signature;

    let previous: Record<string, NodeStatus> | null = null;
    try {
      const raw = localStorage.getItem(key);
      previous = raw ? (JSON.parse(raw) as Record<string, NodeStatus>) : null;
    } catch {
      previous = null;
    }
    try {
      localStorage.setItem(key, JSON.stringify(statuses));
    } catch {
      // storage unavailable: no memory, so no animation next time either — harmless
    }
    if (!previous) return; // first visit on this device: nothing to compare against

    const completedNow = Object.keys(statuses).filter(
      (id) => statuses[id] === "completed" && previous[id] !== undefined && previous[id] !== "completed",
    );
    const unlockedNow = Object.keys(statuses).filter(
      (id) => previous[id] === "locked" && statuses[id] !== "locked",
    );
    if (completedNow.length === 0 && unlockedNow.length === 0) return;

    const restart = (el: Element, className: string) => {
      el.classList.remove(className);
      // Force a reflow so re-adding the class restarts the animation.
      void (el as HTMLElement).offsetWidth;
      el.classList.add(className);
    };

    for (const id of completedNow) {
      document.querySelectorAll(`[data-node-id="${CSS.escape(id)}"]`).forEach((el) => restart(el, "animate-node-complete"));
      document.querySelectorAll(`[data-edge-from="${CSS.escape(id)}"]`).forEach((el) => restart(el, "animate-draw-line"));
    }

    // Unlocks land slightly after the completion pulse, like a cause → effect.
    // Not cleared on unmount on purpose: it only touches DOM by selector and
    // fires toasts, both safe after unmount, and clearing it would drop the
    // unlock announcements whenever StrictMode re-runs the effect.
    setTimeout(() => {
      let scrolled = false;
      for (const id of unlockedNow) {
        document.querySelectorAll(`[data-node-id="${CSS.escape(id)}"]`).forEach((el) => {
          restart(el, "animate-node-unlock");
          // Two copies exist (mobile list + desktop graph); scroll to the one actually on screen.
          if (!scrolled && (el as HTMLElement).offsetParent !== null) {
            el.scrollIntoView({ block: "center", behavior: "smooth" });
            scrolled = true;
          }
        });
        toast({ icon: "🔓", title: `Unlocked: ${titles[id] ?? id}`, body: "A new node is ready." });
      }
    }, completedNow.length > 0 ? 700 : 0);
    // Only on mount: a re-render with the same data must not replay it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

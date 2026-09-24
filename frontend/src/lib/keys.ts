/**
 * Shared by server and client code, so it has to live in a plain module:
 * a value exported from a "use client" file reaches Server Components as a
 * client reference, not as the value itself.
 */
export const SEARCH_INPUT_ID = "search-input";

/** True while the user is typing somewhere a "/" or shortcut is just text. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.closest(".cm-editor")) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

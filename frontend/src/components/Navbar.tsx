import Link from "next/link";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { XpChip } from "@/components/XpChip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

const NAV_LINKS = [
  { href: "/", label: "Tree", icon: "🌳", key: "tree" },
  { href: "/lessons", label: "Lessons", icon: "📖", key: "lessons" },
  { href: "/search", label: "Search", icon: "🔍", key: "search" },
  { href: "/interview", label: "Interview", icon: "🎤", key: "interview" },
] as const;

type NavKey = (typeof NAV_LINKS)[number]["key"];

/**
 * Present on every authenticated page. Still a Server Component — it reads
 * the user's XP/streak here so the chip renders with real numbers on first
 * paint; only the chip, the theme toggle and the shortcut listener are
 * client islands. `active` highlights the current section; each page knows
 * its own without usePathname(), which would force this whole thing client.
 *
 * Two layouts: at md+ the links sit in the top bar; below that (phones and
 * small tablets) they move to a fixed bottom tab bar — thumb-reachable, and
 * measured: four links plus the chip, theme and sign-out overflow the top
 * bar below ~770px. The chip and sign-out stay compact until lg for the
 * same reason.
 */
export async function Navbar({ userEmail, active }: { userEmail: string; active: NavKey }) {
  const supabase = await createClient();
  const { data: stats } = await supabase
    .from("user_stats")
    .select("xp, streak_count, streak_last_date")
    .maybeSingle();

  return (
    <>
      <header
        className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md"
        style={{ viewTransitionName: "site-header" }}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-xl" aria-hidden>
                🐍
              </span>
              <span className="text-base font-semibold">PyQuest</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  aria-current={active === link.key ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors duration-150 lg:px-3 ${
                    active === link.key
                      ? "bg-tint-primary font-medium text-primary"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <span aria-hidden className="hidden text-xs lg:inline">
                    {link.icon}
                  </span>
                  {link.label}
                  {link.key === "search" && (
                    <kbd className="ml-1 hidden rounded border px-1 font-mono text-[10px] leading-4 text-muted lg:pointer-fine:inline">
                      /
                    </kbd>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <XpChip
              initialXp={stats?.xp ?? 0}
              initialStreak={stats?.streak_count ?? 0}
              initialStreakDate={stats?.streak_last_date ?? null}
            />
            <ThemeToggle />
            <span className="hidden text-xs text-muted lg:inline">{userEmail}</span>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="flex h-8 items-center justify-center rounded-lg border px-2 text-sm whitespace-nowrap text-muted transition-all duration-150 hover:bg-surface-2 hover:text-foreground active:scale-95 lg:px-3"
              >
                <span className="lg:hidden" aria-hidden>
                  🚪
                </span>
                <span className="hidden lg:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav
        aria-label="Main"
        className="mobile-tabbar fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        style={{ viewTransitionName: "site-tabbar" }}
      >
        <div className="grid grid-cols-4">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.key;
            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors duration-150 active:scale-95 ${
                  isActive ? "font-medium text-primary" : "text-muted"
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-7 w-12 items-center justify-center rounded-full text-base transition-colors duration-150 ${
                    isActive ? "bg-tint-primary" : ""
                  }`}
                >
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <KeyboardShortcuts />
    </>
  );
}

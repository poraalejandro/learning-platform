import Link from "next/link";
import { signOut } from "@/app/actions";

const NAV_LINKS = [
  { href: "/", label: "Árbol", key: "tree" },
  { href: "/lessons", label: "Lecciones", key: "lessons" },
] as const;

type NavKey = (typeof NAV_LINKS)[number]["key"];

/**
 * Present on every authenticated page (Server Component — the sign-out
 * form action and plain links don't need client JS). `active` highlights
 * the current section; each page knows its own without needing
 * usePathname(), which would force this into a Client Component.
 */
export function Navbar({ userEmail, active }: { userEmail: string; active: NavKey }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-xl" aria-hidden>
              🐍
            </span>
            <span className="hidden text-base font-semibold sm:inline">learning-platform</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
                  active === link.key
                    ? "bg-tint-primary font-medium text-primary"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted sm:inline">{userEmail}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border px-3 py-1.5 text-sm text-muted transition-all duration-150 hover:bg-surface-2 hover:text-foreground active:scale-95"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

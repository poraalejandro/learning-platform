import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 * Must be created fresh per request (never module-level/shared) since it
 * closes over that request's cookie store.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // A Server Component can't set cookies (only read them); this
          // throws there. It's safe to swallow because our proxy.ts already
          // refreshes the session on every request, so an expired token gets
          // renewed before it ever reaches a Server Component.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component — proxy.ts covers the refresh
          }
        },
      },
    },
  );
}

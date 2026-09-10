import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">learning-platform</h1>

      {user ? (
        <div className="flex flex-col items-center gap-3">
          <p>
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
          <form action={signOut}>
            <button type="submit" className="rounded border px-3 py-2 text-sm underline">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p>Not signed in.</p>
          <Link href="/login" className="rounded bg-black px-3 py-2 text-white">
            Sign in
          </Link>
        </div>
      )}
    </main>
  );
}

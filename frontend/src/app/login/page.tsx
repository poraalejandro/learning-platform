"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your email to confirm your account, then sign in.");
      }
    }

    setPending(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="animate-rise-in w-full max-w-sm rounded-3xl border bg-surface p-8 shadow-[0_24px_60px_rgb(0_0_0/0.18)]">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex" aria-label="PyQuest home">
            <LogoMark size={48} />
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold">
            {mode === "sign-in" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "sign-in"
              ? "Sign in to continue where you left off."
              : "Start practicing on any device."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 transition-colors outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 transition-colors outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-xl bg-primary px-3 py-3 font-bold text-on-primary shadow-[0_4px_0_color-mix(in_srgb,var(--primary)_60%,black)] transition-all duration-150 hover:brightness-110 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            {pending ? "..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{message}</p>}

        <button
          onClick={() => {
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            setMessage(null);
          }}
          className="mt-6 w-full text-center text-sm text-primary transition-opacity hover:opacity-75"
        >
          {mode === "sign-in" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}

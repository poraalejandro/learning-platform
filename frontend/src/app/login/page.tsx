"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
      <div className="animate-rise-in w-full max-w-sm rounded-2xl border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-3xl" aria-hidden>
            🐍
          </span>
          <h1 className="mt-2 text-2xl font-semibold">
            {mode === "sign-in" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "sign-in"
              ? "Entra para seguir donde lo dejaste."
              : "Empieza a practicar en cualquier dispositivo."}
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
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 transition-colors outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-lg bg-primary px-3 py-2.5 font-medium text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {pending ? "..." : mode === "sign-in" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}

        <button
          onClick={() => {
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            setMessage(null);
          }}
          className="mt-6 w-full text-center text-sm text-primary transition-opacity hover:opacity-75"
        >
          {mode === "sign-in" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
        </button>
      </div>
    </main>
  );
}

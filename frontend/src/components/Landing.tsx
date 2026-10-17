import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon, type IconName } from "@/components/Icon";
import { NodeMedal } from "@/components/NodeMedal";
import { ThemeToggle } from "@/components/ThemeToggle";

export type LandingCounts = { nodes: number; exercises: number; lessons: number };

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "tree",
    title: "A skill tree, not a playlist",
    body: "From Python basics to RAG and agents with LangGraph. Each node you clear unlocks the next, with side quests on clean code, SOLID, testing, Docker, NumPy and pandas.",
  },
  {
    icon: "play",
    title: "Real code, in your browser",
    body: "Your Python runs right in the page, NumPy and pandas included. Write it, run the tests, see what broke. Nothing to install.",
  },
  {
    icon: "bulb",
    title: "Hints, not answers",
    body: "Stuck? Hints go from a nudge to almost-the-code, one rung at a time, and an AI tutor that points you in the right direction instead of solving it for you.",
  },
  {
    icon: "repeat",
    title: "It comes back when you'd forget it",
    body: "Flashcards and recall questions on a spaced-repetition schedule, and a mistakes review that brings back what you failed until it sticks.",
  },
];

const EXERCISE_TYPES = ["Write the code", "Fix the bug", "Predict the output", "Reorder the lines", "Match concepts", "Flashcards", "Recall"];

/** Decorative preview of the tree for the hero: one node of each state. */
function TreePreview() {
  const stops = [
    { status: "completed" as const, title: "Python basics", x: "30%" },
    { status: "completed" as const, title: "Data structures", x: "70%" },
    { status: "in_progress" as const, title: "OOP in Python", x: "34%", progress: { done: 4, total: 6 } },
    { status: "available" as const, title: "Errors & testing", x: "74%" },
  ];
  return (
    <div aria-hidden className="relative h-[420px] w-full max-w-md">
      <svg viewBox="0 0 100 420" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M 30 50 C 70 50, 70 50, 70 150" fill="none" strokeWidth={12} className="stroke-accent/20" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d="M 30 50 C 70 50, 70 50, 70 150" fill="none" strokeWidth={4} className="stroke-accent" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d="M 70 150 C 34 150, 34 150, 34 250" fill="none" strokeWidth={12} className="stroke-accent/20" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d="M 70 150 C 34 150, 34 150, 34 250" fill="none" strokeWidth={4} className="stroke-accent" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <path d="M 34 250 C 74 250, 74 250, 74 350" fill="none" strokeWidth={4} className="stroke-border" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </svg>
      {stops.map((stop, i) => (
        <div
          key={stop.title}
          className="absolute flex w-36 -translate-x-1/2 flex-col items-center gap-2 text-center"
          style={{ left: stop.x, top: 50 + i * 100 - 32 }}
        >
          <NodeMedal status={stop.status} progress={stop.progress} size={64} />
          <span className="text-sm font-semibold">{stop.title}</span>
        </div>
      ))}
    </div>
  );
}

/** What someone who isn't signed in sees at "/": what PyQuest is, and a way in. */
export function Landing({ counts }: { counts: LandingCounts }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-surface-2"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-12 px-6 pt-10 pb-20">
          <div className="animate-rise-in min-w-0 flex-[1_1_440px]">
            <span className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1 font-mono text-xs text-muted">
              <Icon name="sparkles" size={14} className="text-accent" />
              Python · AI engineering · agents
            </span>
            <h1 className="mt-6 text-5xl leading-[1.02] font-extrabold sm:text-6xl">
              Learn Python and AI by <span className="text-accent">doing</span>, not by reading.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              A skill tree of short, hands-on exercises that run in your browser, from your first
              loop to retrieval and agents. Your progress follows you from phone to laptop.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-on-primary shadow-[0_5px_0_color-mix(in_srgb,var(--primary)_60%,black)] transition-all duration-150 hover:brightness-110 active:translate-y-1 active:shadow-none"
              >
                Start your path
                <Icon name="arrowRight" size={18} strokeWidth={2.4} />
              </Link>
              <a href="#how" className="rounded-xl px-5 py-3.5 font-medium text-muted transition-colors hover:text-foreground">
                How it works
              </a>
            </div>
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { value: counts.nodes, label: "nodes in the tree" },
                { value: counts.exercises, label: "exercises" },
                { value: counts.lessons, label: "lessons" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl font-extrabold tabular-nums">{stat.value}</dd>
                  <dd className="text-sm text-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-[1_1_320px] justify-center">
            <TreePreview />
          </div>
        </section>

        <section id="how" className="border-t bg-surface/60">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <h2 className="max-w-2xl text-3xl font-extrabold sm:text-4xl">Built for active recall, not passive watching</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="rounded-2xl border bg-surface p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tint-primary text-primary">
                    <Icon name={feature.icon} size={22} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{feature.body}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-14 font-mono text-xs tracking-[0.14em] text-muted uppercase">Seven ways to practise</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {EXERCISE_TYPES.map((type) => (
                <li key={type} className="rounded-full border bg-surface px-4 py-2 text-sm font-medium">
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready for your first node?</h2>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-on-primary shadow-[0_5px_0_color-mix(in_srgb,var(--primary)_60%,black)] transition-all duration-150 hover:brightness-110 active:translate-y-1 active:shadow-none"
          >
            Create a free account
            <Icon name="arrowRight" size={18} strokeWidth={2.4} />
          </Link>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-muted">
          <Logo size={24} />
          <span>Built with Next.js, FastAPI, Supabase and Pyodide.</span>
        </div>
      </footer>
    </div>
  );
}

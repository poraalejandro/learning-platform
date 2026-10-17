import Link from "next/link";
import { Icon } from "@/components/Icon";

/**
 * Shown by every non-flashcard exercise once it's solved. Flashcards
 * auto-advance inside their review session; these take real work, so
 * moving on is a deliberate click — you may want to sit with the solution
 * first. `nextHref` is null when nothing is left unsolved in this node.
 * Inside a mistakes-review run `doneHref` is set: the queue is the "node",
 * so finishing it goes back to the review page, not to the exercise's node.
 */
export function NextExerciseLink({
  nodeId,
  nextHref,
  doneHref,
}: {
  nodeId: string;
  nextHref: string | null;
  doneHref?: string;
}) {
  if (!nextHref && doneHref) {
    return (
      <Link
        href={doneHref}
        className="animate-pop-in self-start rounded-lg border border-success/50 bg-tint-success px-4 py-2.5 text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
      >
        <Icon name="sparkles" size={16} className="inline align-[-3px] mr-1.5 text-accent" />Review finished — back to your mistakes
      </Link>
    );
  }

  if (!nextHref) {
    return (
      <Link
        href={`/node/${nodeId}`}
        className="animate-pop-in self-start rounded-lg border border-success/50 bg-tint-success px-4 py-2.5 text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
      >
        <Icon name="sparkles" size={16} className="inline align-[-3px] mr-1.5 text-accent" />Nothing left to do in this node — go back
      </Link>
    );
  }

  return (
    <Link
      href={nextHref}
      className="animate-pop-in self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-on-primary shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:scale-95"
    >
      Next exercise <Icon name="arrowRight" size={16} strokeWidth={2.4} className="inline align-[-3px] ml-1" />
    </Link>
  );
}

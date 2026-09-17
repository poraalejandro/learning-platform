import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.css";

/**
 * Pure Server Component — no editors, no state, just Markdown to HTML — so
 * the whole lesson renders without shipping any client JS for it.
 *
 * Code blocks always render in a dark highlight.js theme regardless of the
 * app's own light/dark mode: keeping one fixed theme avoids needing the
 * same client-side prefers-color-scheme plumbing CodeExercise.tsx needed
 * for CodeMirror, and dark code blocks read fine on a light page (most
 * documentation sites do exactly this).
 */
export function LessonContent({ markdown }: { markdown: string }) {
  return (
    <div className="flex flex-col gap-4 text-[15px] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ children }) => <h2 className="mt-6 text-xl font-semibold first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-4 text-lg font-semibold">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
          a: ({ href, children }) => (
            <a href={href} className="text-primary underline underline-offset-2">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/40 pl-4 text-muted italic">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b px-3 py-1.5 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b px-3 py-1.5">{children}</td>,
          // rehype-highlight only adds a className (e.g. "language-python")
          // to fenced code blocks — inline `code` spans never get one, which
          // is the documented, current way to tell them apart (react-markdown
          // dropped the old `inline` prop a few versions back).
          code: ({ className, children }) =>
            className ? (
              <code className={className}>{children}</code>
            ) : (
              <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>
            ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg border p-4 text-sm">{children}</pre>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

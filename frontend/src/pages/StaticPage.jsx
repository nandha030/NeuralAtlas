import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function StaticPage({ eyebrow, title, subtitle, sections }) {
  return (
    <div className="min-h-screen bg-[var(--na-bg)] text-[var(--na-text)]" data-testid="static-page">
      <header className="na-glass sticky top-0 z-40 border-b border-[var(--na-border)]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[var(--na-text-muted)] hover:text-[var(--na-text)]" data-testid="static-back">
            <ArrowLeft className="w-4 h-4" />
            <Wordmark />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 py-20">
        {eyebrow && <div className="label-eyebrow mb-4">{eyebrow}</div>}
        <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-[var(--na-text)]">
          {title}
        </h1>
        {subtitle && <p className="mt-6 text-lg text-[var(--na-text-muted)] max-w-2xl leading-relaxed">{subtitle}</p>}

        <div className="mt-16 space-y-14">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-[var(--na-text)] mb-4">{s.heading}</h2>
              {typeof s.body === "string" ? (
                <p className="text-[var(--na-text-soft)] leading-relaxed whitespace-pre-line">{s.body}</p>
              ) : (
                s.body
              )}
            </section>
          ))}
        </div>

        <div className="mt-24 border-t border-[var(--na-border)] pt-8 text-xs text-[var(--na-text-muted)] font-mono">
          Last updated · February 2026 · NeuralAtlas · Bangalore &middot; Dubai
        </div>
      </article>
    </div>
  );
}

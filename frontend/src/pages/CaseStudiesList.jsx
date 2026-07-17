import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CaseStudiesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get("/case-studies"); setItems(data); }
      catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--na-bg)] text-[var(--na-text)]" data-testid="case-studies-list">
      <header className="na-glass sticky top-0 z-40 border-b border-[var(--na-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[var(--na-text-muted)] hover:text-[var(--na-text)]" data-testid="cs-back">
            <ArrowLeft className="w-4 h-4" /> <Wordmark />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-14">
        <div className="label-eyebrow mb-4 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Case Studies</div>
        <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">Wins from the network.</h1>
        <p className="mt-6 text-lg text-[var(--na-text-muted)] max-w-2xl leading-relaxed">
          Every deal on NeuralAtlas is human-vetted before it happens. Here's what happened after.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-[var(--na-text-muted)]">Loading…</div>
        ) : items.length === 0 ? (
          <div className="na-card p-10 text-center text-[var(--na-text-muted)]">
            No published case studies yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((c) => (
              <Link key={c.id} to={`/case-studies/${c.slug}`} data-testid={`cs-card-${c.slug}`}
                    className="na-card overflow-hidden group hover:border-[var(--na-gold)]/40 transition-colors">
                <div className="h-56 relative overflow-hidden">
                  {c.hero_image && (
                    <img src={c.hero_image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0" style={{background:"linear-gradient(0deg, var(--na-surface) 0%, transparent 60%)"}} />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--na-gold)] border border-[var(--na-gold)]/50 rounded-full px-2 py-1 bg-[var(--na-bg)]/60 backdrop-blur">{c.industry}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--na-cyan)] border border-[var(--na-cyan)]/50 rounded-full px-2 py-1 bg-[var(--na-bg)]/60 backdrop-blur">{c.region}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-[var(--na-text-muted)] font-mono">{c.client_name}{c.provider_name ? ` × ${c.provider_name}` : ""}</div>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--na-text)] leading-tight">{c.title}</h3>
                  <p className="mt-3 text-sm text-[var(--na-text-soft)] leading-relaxed line-clamp-2">{c.summary}</p>
                  <div className="mt-5 flex items-center gap-4 flex-wrap">
                    {(c.metrics || []).slice(0, 3).map((m, i) => (
                      <div key={i}>
                        <div className="font-display text-xl font-semibold text-[var(--na-gold)]">{m.value}</div>
                        <div className="text-[10px] uppercase tracking-widest text-[var(--na-text-muted)] mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm text-[var(--na-text)]">
                    Read the story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

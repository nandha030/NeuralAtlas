import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

export default function CaseStudiesShowcase() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      try { const { data } = await api.get("/case-studies"); setItems((data || []).slice(0, 3)); }
      catch {}
    })();
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="wins" className="py-24 md:py-32 border-t border-[var(--na-border)]" data-testid="landing-case-studies">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <div className="label-eyebrow mb-4 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Case Studies</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-[var(--na-text)]">Wins from the network.</h2>
          </div>
          <Link to="/case-studies" className="btn-ghost text-sm flex items-center gap-2" data-testid="landing-cs-all">
            All wins <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((c) => (
            <Link key={c.id} to={`/case-studies/${c.slug}`} data-testid={`landing-cs-${c.slug}`}
                  className="na-card overflow-hidden group hover:border-[var(--na-gold)]/40 transition-colors">
              <div className="h-44 relative overflow-hidden">
                {c.hero_image && <img src={c.hero_image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute inset-0" style={{background:"linear-gradient(0deg, var(--na-surface) 0%, transparent 70%)"}} />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-[var(--na-gold)] border border-[var(--na-gold)]/50 rounded-full px-2 py-1 bg-[var(--na-bg)]/60 backdrop-blur">{c.industry}</span>
              </div>
              <div className="p-6">
                <div className="text-xs text-[var(--na-text-muted)] font-mono">{c.client_name}</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-[var(--na-text)] leading-tight line-clamp-2">{c.title}</h3>
                {(c.metrics || [])[0] && (
                  <div className="mt-4">
                    <div className="font-display text-2xl font-semibold text-[var(--na-gold)]">{c.metrics[0].value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[var(--na-text-muted)] mt-1">{c.metrics[0].label}</div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Quote, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const [cs, setCs] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get(`/case-studies/${slug}`); setCs(data); }
      catch { setCs(false); } finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[var(--na-bg)] flex items-center justify-center text-[var(--na-text-muted)]">Loading…</div>;
  if (!cs) return (
    <div className="min-h-screen bg-[var(--na-bg)] flex flex-col items-center justify-center gap-4">
      <div className="text-[var(--na-text)] font-display text-3xl">Case study not found</div>
      <button onClick={() => navigate("/case-studies")} className="btn-ghost text-sm" data-testid="cs-notfound-back">Back to case studies</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--na-bg)] text-[var(--na-text)]" data-testid="case-study-detail">
      <header className="na-glass sticky top-0 z-40 border-b border-[var(--na-border)]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/case-studies" className="flex items-center gap-2 text-[var(--na-text-muted)] hover:text-[var(--na-text)]" data-testid="cs-detail-back">
            <ArrowLeft className="w-4 h-4" /> <Wordmark />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="label-eyebrow mb-4">{cs.industry} · {cs.region}</div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">{cs.title}</h1>
          <p className="mt-6 text-lg text-[var(--na-text-muted)] max-w-3xl leading-relaxed">{cs.subtitle}</p>
          <div className="mt-6 text-sm text-[var(--na-text-soft)] font-mono">
            {cs.client_name} × {cs.provider_name} · Tier <span className="text-[var(--na-gold)] uppercase">{cs.tier}</span>
          </div>
        </div>
        {cs.hero_image && (
          <div className="max-w-6xl mx-auto px-6 mt-14">
            <div className="rounded-2xl overflow-hidden border border-[var(--na-border)]">
              <img src={cs.hero_image} alt={cs.title} className="w-full h-[380px] object-cover" />
            </div>
          </div>
        )}
      </section>

      {/* Metrics strip */}
      {(cs.metrics || []).length > 0 && (
        <section className="border-y border-[var(--na-border)] py-10">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {cs.metrics.map((m, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="font-display text-5xl font-semibold text-[var(--na-gold)]">{m.value}</div>
                <div className="text-xs uppercase tracking-widest text-[var(--na-text-muted)] mt-2">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Story */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-14">
        <div>
          <div className="label-eyebrow mb-4">The challenge</div>
          <p className="text-lg text-[var(--na-text-soft)] leading-relaxed whitespace-pre-line">{cs.challenge}</p>
        </div>
        <div>
          <div className="label-eyebrow mb-4">The solution</div>
          <p className="text-lg text-[var(--na-text-soft)] leading-relaxed whitespace-pre-line">{cs.solution}</p>
        </div>
        <div>
          <div className="label-eyebrow mb-4">Summary</div>
          <p className="text-lg text-[var(--na-text-soft)] leading-relaxed">{cs.summary}</p>
        </div>
      </section>

      {/* Quote */}
      {cs.quote && (
        <section className="border-t border-[var(--na-border)] py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="na-card p-10 relative">
              <Quote className="w-10 h-10 text-[var(--na-gold)] opacity-40 absolute top-6 left-6" />
              <p className="font-display text-2xl md:text-3xl leading-snug text-[var(--na-text)] pl-14">
                {cs.quote}
              </p>
              {cs.quote_author && (
                <div className="mt-6 text-sm text-[var(--na-text-muted)] font-mono pl-14">— {cs.quote_author}</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 text-center border-t border-[var(--na-border)]">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Bring your project to NeuralAtlas.</h2>
          <p className="mt-4 text-[var(--na-text-muted)]">A vetted shortlist, an architect in the room, no vendor lottery.</p>
          <Link to="/#assess" className="btn-gold inline-flex items-center gap-2 mt-8" data-testid="cs-detail-cta">
            Get an AI Maturity Snapshot <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

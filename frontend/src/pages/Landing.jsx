import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, ShieldCheck, Building2, Rocket, CheckCircle2,
  MapPin, Mail, Cpu, Globe2, BadgeCheck, Layers, Linkedin, Twitter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import NewsletterForm from "@/components/NewsletterForm";
import CaseStudiesShowcase from "@/components/CaseStudiesShowcase";

const IMG = {
  hero: "https://images.unsplash.com/photo-1770486036751-e55247238964?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5ldXJhbCUyMG5ldHdvcmslMjBub2RlcyUyMGRhcmt8ZW58MHx8fHwxNzg0MzEyMTQ4fDA&ixlib=rb-4.1.0&q=85",
  founder: "https://images.unsplash.com/photo-1758691737644-ef8be18256c3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmb3VuZGVyJTIwcG9ydHJhaXQlMjBvZmZpY2V8ZW58MHx8fHwxNzg0MzEyMTQ4fDA&ixlib=rb-4.1.0&q=85",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMHNreWxpbmUlMjBtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzg0MzEyMTQ4fDA&ixlib=rb-4.1.0&q=85",
  bangalore: "https://images.unsplash.com/photo-1698822457446-ac18737a2ac4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwzfHxiYW5nYWxvcmUlMjB0ZWNoJTIwcGFyayUyMG1vZGVybiUyMGFyY2hpdGVjdHVyZXxlbnwwfHx8fDE3ODQzMTIxNjB8MA&ixlib=rb-4.1.0&q=85",
};

const PROVIDERS = [
  { name: "Axiom Vision", niche: "Computer Vision · Manufacturing" },
  { name: "Kepler ML", niche: "Predictive Maintenance · Energy" },
  { name: "Helix Data", niche: "Data Platforms · BFSI" },
  { name: "Molecule.ai", niche: "Drug Discovery · Pharma" },
  { name: "Marlin AI", niche: "Maritime Analytics" },
  { name: "Ledger Neural", niche: "Fraud Detection · Fintech" },
  { name: "Threadwise", niche: "RAG & Enterprise Search" },
  { name: "Sable MLOps", niche: "MLOps & Governance" },
];

const RUBRIC = [
  "Founder-led technical vetting on live problems",
  "Reference conversations with prior enterprise clients",
  "Data governance & security posture review",
  "Delivery model, pricing sanity & contract clarity",
  "Post-deal light oversight through go-live",
];

const Nav = () => (
  <header className="fixed top-0 inset-x-0 z-50 na-glass">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#top" data-testid="nav-logo"><Wordmark /></a>
      <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--na-text-soft)]">
        <a href="#how" className="link-underline" data-testid="nav-how">How it works</a>
        <a href="#tiers" className="link-underline" data-testid="nav-tiers">Membership</a>
        <a href="#assess" className="link-underline" data-testid="nav-assess">AI Assessment</a>
        <a href="#network" className="link-underline" data-testid="nav-network">Network</a>
        <Link to="/case-studies" className="link-underline" data-testid="nav-cases">Wins</Link>
        <a href="#founder" className="link-underline" data-testid="nav-founder">Founder</a>
      </nav>
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </div>
  </header>
);

const Hero = () => (
  <section id="top" className="relative pt-40 pb-32 overflow-hidden na-noise">
    <div className="absolute inset-0 -z-10">
      <img src={IMG.hero} alt="" className="w-full h-full object-cover opacity-30 dark:opacity-40" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--na-hero-overlay) 0%, var(--na-bg) 100%)" }} />
    </div>
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-8">
        <div className="label-eyebrow mb-6 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Bangalore · Dubai · A curated network
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight text-[var(--na-text)]">
          The curated <span className="na-gradient-text">AI marketplace</span> bridging enterprises &amp; the startup ecosystem.
        </h1>
        <p className="mt-8 text-lg text-[var(--na-text-soft)] max-w-2xl leading-relaxed">
          NeuralAtlas is a two-sided network — small, mid &amp; large enterprises meet pre-vetted AI providers, chosen personally by a practicing enterprise AI architect. Free for enterprises. Boutique by design.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a href="#assess" className="btn-gold inline-flex items-center gap-2" data-testid="hero-cta-assess">
            Get AI Maturity Snapshot <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#tiers" className="btn-ghost inline-flex items-center gap-2" data-testid="hero-cta-provider">
            Apply as a Provider
          </a>
        </div>
        <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
          {[
            { k: "12", v: "Founding providers" },
            { k: "5", v: "Verticals" },
            { k: "100%", v: "Human-vetted" },
          ].map((s) => (
            <div key={s.v} className="border-l border-[var(--na-border)] pl-4">
              <div className="font-display text-3xl text-[var(--na-gold)] font-semibold">{s.k}</div>
              <div className="text-xs uppercase tracking-widest text-[var(--na-text-muted)] mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-4">
        <div className="na-card p-6 space-y-4">
          <div className="label-eyebrow">Live pipeline</div>
          <div className="space-y-3">
            {[
              { t: "BFSI · Fraud detection", s: "Matched" },
              { t: "Pharma · Trial analytics", s: "Vetting" },
              { t: "Maritime · Route AI", s: "Shortlist" },
              { t: "Manufacturing · Vision QA", s: "Intro" },
            ].map((r) => (
              <div key={r.t} className="flex items-center justify-between text-sm border-b border-[var(--na-border)] pb-3">
                <span className="text-[var(--na-text-soft)]">{r.t}</span>
                <span className="text-[10px] uppercase tracking-widest text-[var(--na-cyan)] border border-[var(--na-cyan)]/40 rounded-full px-2 py-1">{r.s}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="how" className="py-24 md:py-32 border-t border-[var(--na-border)]">
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-3xl">
        <div className="label-eyebrow mb-4">How it works</div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-[var(--na-text)]">Two sides. One human bridge.</h2>
        <p className="mt-4 text-[var(--na-text-muted)]">We match enterprises with pre-vetted AI providers — with an architect in the room, not a form on a portal.</p>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="na-card p-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[var(--na-cyan)]" />
            <div className="label-eyebrow">For Enterprises · Free</div>
          </div>
          <h3 className="font-display text-2xl font-semibold mt-4 text-[var(--na-text)]">Skip the vendor lottery.</h3>
          <ul className="mt-6 space-y-3 text-[var(--na-text-soft)]">
            {["Complimentary AI Maturity Snapshot","Architect-led, vendor-neutral evaluation","Shortlist of 3 vetted providers per project","Light oversight through delivery"].map(x => (
              <li key={x} className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-[var(--na-gold)] shrink-0 mt-1" /><span>{x}</span></li>
            ))}
          </ul>
        </div>

        <div className="na-card p-8">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-[var(--na-gold)]" />
            <div className="label-eyebrow">For AI Providers · Paid</div>
          </div>
          <h3 className="font-display text-2xl font-semibold mt-4 text-[var(--na-text)]">Warm intros, not cold pitches.</h3>
          <ul className="mt-6 space-y-3 text-[var(--na-text-soft)]">
            {["Access to real, budgeted enterprise projects","Credibility by association with a vetted network","Positioning & enterprise procurement guidance","Membership tiers from $500 to $5,000 / year"].map(x => (
              <li key={x} className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-[var(--na-cyan)] shrink-0 mt-1" /><span>{x}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const Tiers = () => {
  const tiers = [
    { id: "starter", name: "Starter", price: "$500", tag: "Emerging studios", features: ["Listing in vetted network","2 warm intros / year","GTM audit call","Community access"] },
    { id: "growth", name: "Growth", price: "$1,500", tag: "Scaling teams", features: ["Priority intros","Case-study production","Enterprise pricing playbook","Quarterly strategy call"], highlight: true },
    { id: "elite", name: "Elite", price: "$5,000", tag: "Boutique consultancies", features: ["Founder-led co-selling","Featured placement","Named advisor on live deals","Retainer discount for enterprises"], elite: true },
  ];
  return (
    <section id="tiers" className="py-24 md:py-32 border-t border-[var(--na-border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-2xl">
            <div className="label-eyebrow mb-4">Provider Membership</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-[var(--na-text)]">Pay to be seen by the right buyers.</h2>
          </div>
          <p className="text-[var(--na-text-muted)] max-w-sm text-sm">Enterprises pay nothing. Providers fund the network. Commissions apply only on closed deals.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.id} className={`na-card p-8 relative ${t.elite ? "tracing-border" : ""}`} data-testid={`tier-${t.id}-card`}>
              <div className="relative">
                <div className="label-eyebrow">{t.tag}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold text-[var(--na-text)]">{t.price}</span>
                  <span className="text-[var(--na-text-muted)] text-sm">/ year</span>
                </div>
                <h3 className="font-display text-2xl font-semibold mt-2 text-[var(--na-text)]">{t.name}</h3>
                <ul className="mt-6 space-y-3 text-[var(--na-text-soft)] text-sm">
                  {t.features.map(f => <li key={f} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--na-gold)] shrink-0 mt-0.5" /><span>{f}</span></li>)}
                </ul>
                <a href="#apply" className={`mt-8 inline-flex items-center gap-2 text-sm ${t.elite || t.highlight ? "btn-gold" : "btn-ghost"}`} data-testid={`tier-${t.id}-btn`}>
                  Apply {t.name} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Assessment = () => {
  const [form, setForm] = useState({
    company_name: "", email: "", industry: "",
    data_readiness: 3, infrastructure: 3, talent: 3, use_case_clarity: 3,
    goals: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async () => {
    if (!form.company_name || !form.email || !form.industry || !form.goals) {
      toast.error("Please fill all fields"); return;
    }
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post("/assessment", form);
      setResult(data);
      toast.success("Report generated");
    } catch { toast.error("Could not generate report"); }
    finally { setLoading(false); }
  };

  const sliders = [
    { key: "data_readiness", label: "Data readiness" },
    { key: "infrastructure", label: "Infrastructure" },
    { key: "talent", label: "AI talent" },
    { key: "use_case_clarity", label: "Use-case clarity" },
  ];

  return (
    <section id="assess" className="py-24 md:py-32 border-t border-[var(--na-border)] relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="label-eyebrow mb-4 flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> AI Maturity Assessment</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-[var(--na-text)]">Where do you stand today?</h2>
          <p className="mt-6 text-[var(--na-text-muted)]">A candid, architect-grade snapshot. Rate four dimensions, tell us your goals, and receive an AI-authored maturity brief in seconds.</p>
          <div className="mt-8 text-xs text-[var(--na-text-muted)] font-mono">Powered by NeuralAtlas AI · Claude Sonnet</div>
        </div>

        <div className="lg:col-span-7 tracing-border">
          <div className="na-card p-8 space-y-5" data-testid="assessment-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[var(--na-text-soft)]">Company</Label>
                <Input data-testid="assess-company" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} className="na-input mt-2" placeholder="Acme Bank" />
              </div>
              <div>
                <Label className="text-[var(--na-text-soft)]">Work email</Label>
                <Input data-testid="assess-email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="na-input mt-2" placeholder="you@company.com" />
              </div>
            </div>
            <div>
              <Label className="text-[var(--na-text-soft)]">Industry</Label>
              <Select value={form.industry} onValueChange={v=>setForm({...form,industry:v})}>
                <SelectTrigger data-testid="assess-industry" className="na-input mt-2"><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {["BFSI","Pharma & Life Sciences","Energy","Manufacturing","Maritime","Retail","Telecom","Other"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {sliders.map(s => (
                <div key={s.key}>
                  <div className="flex justify-between text-sm text-[var(--na-text-soft)]">
                    <span>{s.label}</span>
                    <span className="font-mono text-[var(--na-gold)]">{form[s.key]}/5</span>
                  </div>
                  <Slider data-testid={`slider-${s.key}`} value={[form[s.key]]} min={1} max={5} step={1} onValueChange={v=>setForm({...form,[s.key]:v[0]})} className="mt-3" />
                </div>
              ))}
            </div>

            <div>
              <Label className="text-[var(--na-text-soft)]">Primary AI goal in next 6 months</Label>
              <Textarea data-testid="assess-goals" value={form.goals} onChange={e=>setForm({...form,goals:e.target.value})} className="na-input mt-2" placeholder="Reduce fraud false-positives, launch RAG copilot, etc." rows={3} />
            </div>

            <button data-testid="assess-submit" disabled={loading} onClick={submit} className="btn-gold w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? "Generating report…" : (<>Generate maturity report <Sparkles className="w-4 h-4" /></>)}
            </button>

            {result && (
              <div data-testid="assess-result" className="mt-4 border-t border-[var(--na-border)] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="label-eyebrow">Your snapshot</div>
                  <div className="font-display text-3xl font-semibold text-[var(--na-gold)]">{result.score}<span className="text-sm text-[var(--na-text-muted)]">/100</span></div>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--na-text-soft)] leading-relaxed">{result.report_markdown}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Network = () => (
  <section id="network" className="py-24 md:py-32 border-t border-[var(--na-border)] overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-eyebrow mb-4 flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Vetted network</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-[var(--na-text)]">Featured providers.</h2>
        </div>
        <p className="text-[var(--na-text-muted)] max-w-sm text-sm">Small, mid &amp; large enterprises. Startups. Boutique consultancies. One curated bridge.</p>
      </div>
    </div>
    <div className="mt-14 overflow-hidden">
      <div className="marquee">
        {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
          <div key={i} className="na-card px-6 py-5 min-w-[260px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[var(--na-gold)]/30 to-[var(--na-cyan)]/20 border border-[var(--na-border)] flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-[var(--na-gold)]" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold leading-none text-[var(--na-text)]">{p.name}</div>
                <div className="text-xs text-[var(--na-text-muted)] mt-1">{p.niche}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Founder = () => (
  <section id="founder" className="py-24 md:py-32 border-t border-[var(--na-border)]">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-5">
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[var(--na-gold)]/30 to-[var(--na-cyan)]/10 blur-xl -z-10" />
          <img src={IMG.founder} alt="Founder portrait" className="rounded-2xl grayscale contrast-125 border border-[var(--na-border)] w-full" />
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="label-eyebrow mb-4 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> The founder is the product</div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-[var(--na-text)]">Trust, personally curated.</h2>
        <p className="mt-6 text-[var(--na-text-soft)] leading-relaxed">
          NeuralAtlas is founded and operated by a practicing enterprise AI architect. Every provider is vetted on live problems — not slide decks. Every enterprise is briefed by a technologist — not a salesperson.
        </p>
        <ul className="mt-8 space-y-3">
          {RUBRIC.map((r) => (
            <li key={r} className="flex items-start gap-3 text-[var(--na-text-soft)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--na-gold)] mt-1 shrink-0" /> <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

const EnterpriseForm = () => {
  const [form, setForm] = useState({
    company_name: "", contact_name: "", email: "", role: "", industry: "",
    company_size: "mid", project_description: "", budget_range: "", timeline: "", region: "India / UAE",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    for (const k of ["company_name","contact_name","email","role","industry","project_description","budget_range","timeline"]) {
      if (!form[k]) { toast.error("Please complete all fields"); return; }
    }
    setLoading(true);
    try {
      await api.post("/enterprise/intake", form);
      toast.success("Received. An architect will reach out within 48 hours.");
      setForm({ ...form, project_description: "", budget_range: "", timeline: "" });
    } catch { toast.error("Submission failed"); } finally { setLoading(false); }
  };

  return (
    <div className="na-card p-8">
      <div className="label-eyebrow mb-2"><Building2 className="w-3.5 h-3.5 inline mr-2" /> Enterprise Intake</div>
      <h3 className="font-display text-2xl font-semibold text-[var(--na-text)]">Tell us what you&rsquo;re building.</h3>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input data-testid="ent-company" placeholder="Company" className="na-input" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} />
        <Input data-testid="ent-contact" placeholder="Your name" className="na-input" value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} />
        <Input data-testid="ent-email" placeholder="Work email" className="na-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <Input data-testid="ent-role" placeholder="Role (e.g. Head of Digital)" className="na-input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} />
        <Input data-testid="ent-industry" placeholder="Industry" className="na-input" value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} />
        <Select value={form.company_size} onValueChange={v=>setForm({...form,company_size:v})}>
          <SelectTrigger data-testid="ent-size" className="na-input"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="startup">Startup</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="mid">Mid-market</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Input data-testid="ent-budget" placeholder="Budget range (USD)" className="na-input" value={form.budget_range} onChange={e=>setForm({...form,budget_range:e.target.value})} />
        <Input data-testid="ent-timeline" placeholder="Timeline (e.g. Q1 2026)" className="na-input" value={form.timeline} onChange={e=>setForm({...form,timeline:e.target.value})} />
      </div>
      <Textarea data-testid="ent-project" placeholder="Describe the project" rows={4} className="na-input mt-4" value={form.project_description} onChange={e=>setForm({...form,project_description:e.target.value})} />
      <button data-testid="ent-submit" disabled={loading} onClick={submit} className="btn-gold mt-6 w-full">{loading ? "Submitting…" : "Request a shortlist"}</button>
    </div>
  );
};

const ProviderForm = () => {
  const [form, setForm] = useState({
    company_name: "", contact_name: "", email: "", website: "",
    headquarters: "", team_size: "", specializations: "", case_studies: "", tier_interest: "growth",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    for (const k of ["company_name","contact_name","email","headquarters","team_size","specializations","case_studies"]) {
      if (!form[k]) { toast.error("Please complete all fields"); return; }
    }
    setLoading(true);
    try {
      await api.post("/provider/application", form);
      toast.success("Application received. Vetting begins within 5 days.");
      setForm({ ...form, specializations: "", case_studies: "" });
    } catch { toast.error("Submission failed"); } finally { setLoading(false); }
  };

  return (
    <div className="na-card p-8">
      <div className="label-eyebrow mb-2"><Rocket className="w-3.5 h-3.5 inline mr-2" /> Provider Application</div>
      <h3 className="font-display text-2xl font-semibold text-[var(--na-text)]">Join the vetted network.</h3>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input data-testid="prov-company" placeholder="Company" className="na-input" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} />
        <Input data-testid="prov-contact" placeholder="Founder / lead" className="na-input" value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} />
        <Input data-testid="prov-email" placeholder="Email" className="na-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <Input data-testid="prov-website" placeholder="Website" className="na-input" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} />
        <Input data-testid="prov-hq" placeholder="Headquarters (city, country)" className="na-input" value={form.headquarters} onChange={e=>setForm({...form,headquarters:e.target.value})} />
        <Input data-testid="prov-size" placeholder="Team size" className="na-input" value={form.team_size} onChange={e=>setForm({...form,team_size:e.target.value})} />
      </div>
      <Textarea data-testid="prov-spec" placeholder="Specializations (models, verticals, deployment style)" rows={3} className="na-input mt-4" value={form.specializations} onChange={e=>setForm({...form,specializations:e.target.value})} />
      <Textarea data-testid="prov-cases" placeholder="Two references / case studies (short)" rows={3} className="na-input mt-4" value={form.case_studies} onChange={e=>setForm({...form,case_studies:e.target.value})} />
      <div className="mt-4">
        <Label className="text-[var(--na-text-soft)]">Membership tier</Label>
        <Select value={form.tier_interest} onValueChange={v=>setForm({...form,tier_interest:v})}>
          <SelectTrigger data-testid="prov-tier" className="na-input mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="starter">Starter · $500</SelectItem>
            <SelectItem value="growth">Growth · $1,500</SelectItem>
            <SelectItem value="elite">Elite · $5,000</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <button data-testid="prov-submit" disabled={loading} onClick={submit} className="btn-gold mt-6 w-full">{loading ? "Submitting…" : "Apply for vetting"}</button>
    </div>
  );
};

const Forms = () => (
  <section id="apply" className="py-24 md:py-32 border-t border-[var(--na-border)]">
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-3xl mb-14">
        <div className="label-eyebrow mb-4">Start the conversation</div>
        <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-[var(--na-text)]">Enterprises free. Providers vetted. Deals matched.</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnterpriseForm />
        <ProviderForm />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-[var(--na-border)] pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6">
      {/* Top: brand + newsletter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16 border-b border-[var(--na-border)]">
        <div className="lg:col-span-5">
          <Wordmark />
          <p className="mt-4 text-sm text-[var(--na-text-muted)] max-w-md leading-relaxed">
            The curated bridge between enterprises and the AI startup ecosystem. Founder-led, human-vetted, boutique by design.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href="https://linkedin.com/company/neuralatlas" target="_blank" rel="noreferrer" aria-label="LinkedIn" data-testid="social-linkedin"
               className="w-9 h-9 rounded-full border border-[var(--na-border-strong)] flex items-center justify-center hover:border-[var(--na-gold)] transition-colors">
              <Linkedin className="w-4 h-4 text-[var(--na-text)]" />
            </a>
            <a href="https://twitter.com/neuralatlas" target="_blank" rel="noreferrer" aria-label="Twitter" data-testid="social-twitter"
               className="w-9 h-9 rounded-full border border-[var(--na-border-strong)] flex items-center justify-center hover:border-[var(--na-gold)] transition-colors">
              <Twitter className="w-4 h-4 text-[var(--na-text)]" />
            </a>
            <a href="mailto:info@neuralatlas.io" aria-label="Email" data-testid="social-email"
               className="w-9 h-9 rounded-full border border-[var(--na-border-strong)] flex items-center justify-center hover:border-[var(--na-gold)] transition-colors">
              <Mail className="w-4 h-4 text-[var(--na-text)]" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <NewsletterForm />
        </div>
      </div>

      {/* Middle: link columns + offices */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 py-14 border-b border-[var(--na-border)]">
        <div className="col-span-2 md:col-span-1">
          <div className="label-eyebrow mb-4">Product</div>
          <ul className="space-y-3 text-sm">
            <li><a href="/#how" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-how">How it works</a></li>
            <li><a href="/#tiers" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-tiers">Membership</a></li>
            <li><a href="/#assess" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-assess">AI Assessment</a></li>
            <li><a href="/#network" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-network">Vetted Network</a></li>
            <li><Link to="/case-studies" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-cases">Case Studies</Link></li>
          </ul>
        </div>
        <div>
          <div className="label-eyebrow mb-4">Company</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-about">About</Link></li>
            <li><Link to="/contact" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-contact">Contact</Link></li>
            <li><Link to="/careers" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-careers">Careers</Link></li>
          </ul>
        </div>
        <div>
          <div className="label-eyebrow mb-4">Legal</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/privacy" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-privacy">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-terms">Terms of Service</Link></li>
            <li><Link to="/cookies" className="text-[var(--na-text-soft)] hover:text-[var(--na-text)]" data-testid="footer-cookies">Cookie Policy</Link></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1 lg:col-span-3 grid grid-cols-2 gap-4">
          <div className="na-card overflow-hidden">
            <div className="h-24 relative">
              <img src={IMG.dubai} className="w-full h-full object-cover opacity-70" alt="Dubai" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, var(--na-surface) 0%, transparent 100%)" }} />
            </div>
            <div className="p-4">
              <div className="label-eyebrow flex items-center gap-2"><MapPin className="w-3 h-3" /> Dubai</div>
              <div className="text-[var(--na-text-soft)] text-xs mt-1">DIFC · Emirates Financial Towers</div>
            </div>
          </div>
          <div className="na-card overflow-hidden">
            <div className="h-24 relative">
              <img src={IMG.bangalore} className="w-full h-full object-cover opacity-70" alt="Bangalore" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, var(--na-surface) 0%, transparent 100%)" }} />
            </div>
            <div className="p-4">
              <div className="label-eyebrow flex items-center gap-2"><MapPin className="w-3 h-3" /> Bangalore</div>
              <div className="text-[var(--na-text-soft)] text-xs mt-1">Indiranagar · 100 Ft Road</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 flex items-center justify-between flex-wrap gap-4 text-xs text-[var(--na-text-muted)]">
        <div>© {new Date().getFullYear()} NeuralAtlas Ventures · Bangalore &middot; Dubai · All rights reserved.</div>
        <div className="flex items-center gap-6">
          <a href="mailto:info@neuralatlas.io" className="link-underline flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> info@neuralatlas.io</a>
          <span className="flex items-center gap-2"><Globe2 className="w-3.5 h-3.5" /> EN</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function Landing() {
  return (
    <main data-testid="landing-page" className="min-h-screen bg-[var(--na-bg)] text-[var(--na-text)] overflow-x-hidden">
      <Nav />
      <Hero />
      <HowItWorks />
      <Tiers />
      <Assessment />
      <Network />
      <Founder />
      <CaseStudiesShowcase />
      <Forms />
      <Footer />
    </main>
  );
}

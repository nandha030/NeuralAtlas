import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, ShieldCheck, Compass, Building2, Rocket, CheckCircle2,
  MapPin, Mail, LineChart, Users, BadgeCheck, Layers, Cpu, Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { api } from "@/lib/api";

const IMG = {
  hero: "https://images.unsplash.com/photo-1770486036751-e55247238964?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5ldXJhbCUyMG5ldHdvcmslMjBub2RlcyUyMGRhcmt8ZW58MHx8fHwxNzg0MzEyMTQ4fDA&ixlib=rb-4.1.0&q=85",
  exec: "https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxleGVjdXRpdmVzJTIwbWVldGluZyUyMG1vZGVybiUyMG9mZmljZXxlbnwwfHx8fDE3ODQzMTIxNDh8MA&ixlib=rb-4.1.0&q=85",
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
      <a href="#top" className="flex items-center gap-2" data-testid="nav-logo">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#C5A059] to-[#00E5FF] flex items-center justify-center">
          <Compass className="w-4 h-4 text-[#0A0E17]" strokeWidth={2.5} />
        </div>
        <span className="font-display text-xl tracking-wide">NeuralAtlas<span className="text-[#C5A059]">.io</span></span>
      </a>
      <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
        <a href="#how" className="link-underline" data-testid="nav-how">How it works</a>
        <a href="#tiers" className="link-underline" data-testid="nav-tiers">Membership</a>
        <a href="#assess" className="link-underline" data-testid="nav-assess">AI Assessment</a>
        <a href="#network" className="link-underline" data-testid="nav-network">Network</a>
        <a href="#founder" className="link-underline" data-testid="nav-founder">Founder</a>
      </nav>
      <Link to="/admin" className="btn-ghost text-sm" data-testid="nav-admin-btn">Admin</Link>
    </div>
  </header>
);

const Hero = () => (
  <section id="top" className="relative pt-40 pb-32 overflow-hidden na-noise">
    <div className="absolute inset-0 -z-10">
      <img src={IMG.hero} alt="" className="w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E17]/60 via-[#0A0E17]/80 to-[#0A0E17]" />
    </div>
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-8">
        <div className="label-eyebrow mb-6 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Bangalore · Dubai · A curated network
        </div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
          The curated <span className="na-gradient-text">AI marketplace</span> bridging enterprises &amp; the startup ecosystem.
        </h1>
        <p className="mt-8 text-lg text-white/70 max-w-2xl leading-relaxed">
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
            <div key={s.v} className="border-l border-white/10 pl-4">
              <div className="font-display text-3xl text-[#C5A059]">{s.k}</div>
              <div className="text-xs uppercase tracking-widest text-white/50 mt-1">{s.v}</div>
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
              <div key={r.t} className="flex items-center justify-between text-sm border-b border-white/5 pb-3">
                <span className="text-white/80">{r.t}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#00E5FF] border border-[#00E5FF]/30 rounded-full px-2 py-1">{r.s}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section id="how" className="py-24 md:py-32 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-3xl">
        <div className="label-eyebrow mb-4">How it works</div>
        <h2 className="font-display text-4xl md:text-5xl leading-tight">Two sides. One human bridge.</h2>
        <p className="mt-4 text-white/60">We match enterprises with pre-vetted AI providers — with an architect in the room, not a form on a portal.</p>
      </div>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="na-card p-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[#00E5FF]" />
            <div className="label-eyebrow">For Enterprises · Free</div>
          </div>
          <h3 className="font-display text-2xl mt-4">Skip the vendor lottery.</h3>
          <ul className="mt-6 space-y-3 text-white/75">
            {["Complimentary AI Maturity Snapshot","Architect-led, vendor-neutral evaluation","Shortlist of 3 vetted providers per project","Light oversight through delivery"].map(x => (
              <li key={x} className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-1" /><span>{x}</span></li>
            ))}
          </ul>
        </div>

        <div className="na-card p-8">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-[#C5A059]" />
            <div className="label-eyebrow">For AI Providers · Paid</div>
          </div>
          <h3 className="font-display text-2xl mt-4">Warm intros, not cold pitches.</h3>
          <ul className="mt-6 space-y-3 text-white/75">
            {["Access to real, budgeted enterprise projects","Credibility by association with a vetted network","Positioning &amp; enterprise procurement guidance","Membership tiers from $500 to $5,000 / year"].map(x => (
              <li key={x} className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0 mt-1" /><span dangerouslySetInnerHTML={{__html:x}} /></li>
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
    <section id="tiers" className="py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-2xl">
            <div className="label-eyebrow mb-4">Provider Membership</div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">Pay to be seen by the right buyers.</h2>
          </div>
          <p className="text-white/50 max-w-sm text-sm">Enterprises pay nothing. Providers fund the network. Commissions apply only on closed deals.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.id} className={`na-card p-8 relative ${t.elite ? "tracing-border" : ""}`} data-testid={`tier-${t.id}-card`}>
              <div className="relative">
                <div className="label-eyebrow">{t.tag}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl">{t.price}</span>
                  <span className="text-white/50 text-sm">/ year</span>
                </div>
                <h3 className="font-display text-2xl mt-2">{t.name}</h3>
                <ul className="mt-6 space-y-3 text-white/75 text-sm">
                  {t.features.map(f => <li key={f} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" /><span>{f}</span></li>)}
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
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post("/assessment", form);
      setResult(data);
      toast.success("Report generated");
    } catch (e) {
      toast.error("Could not generate report");
    } finally { setLoading(false); }
  };

  const sliders = [
    { key: "data_readiness", label: "Data readiness" },
    { key: "infrastructure", label: "Infrastructure" },
    { key: "talent", label: "AI talent" },
    { key: "use_case_clarity", label: "Use-case clarity" },
  ];

  return (
    <section id="assess" className="py-24 md:py-32 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="label-eyebrow mb-4 flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> AI Maturity Assessment</div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">Where do you stand today?</h2>
          <p className="mt-6 text-white/60">A candid, architect-grade snapshot. Rate four dimensions, tell us your goals, and receive an AI-authored maturity brief in seconds.</p>
          <div className="mt-8 text-xs text-white/40 font-mono">Powered by NeuralAtlas AI · Claude Sonnet</div>
        </div>

        <div className="lg:col-span-7 tracing-border">
          <div className="na-card p-8 space-y-5" data-testid="assessment-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70">Company</Label>
                <Input data-testid="assess-company" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} className="bg-[#0A0E17] border-white/10 mt-2" placeholder="Acme Bank" />
              </div>
              <div>
                <Label className="text-white/70">Work email</Label>
                <Input data-testid="assess-email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="bg-[#0A0E17] border-white/10 mt-2" placeholder="you@company.com" />
              </div>
            </div>
            <div>
              <Label className="text-white/70">Industry</Label>
              <Select value={form.industry} onValueChange={v=>setForm({...form,industry:v})}>
                <SelectTrigger data-testid="assess-industry" className="bg-[#0A0E17] border-white/10 mt-2"><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent className="bg-[#111827] border-white/10 text-white">
                  {["BFSI","Pharma & Life Sciences","Energy","Manufacturing","Maritime","Retail","Telecom","Other"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {sliders.map(s => (
                <div key={s.key}>
                  <div className="flex justify-between text-sm text-white/70">
                    <span>{s.label}</span>
                    <span className="font-mono text-[#C5A059]">{form[s.key]}/5</span>
                  </div>
                  <Slider data-testid={`slider-${s.key}`} value={[form[s.key]]} min={1} max={5} step={1} onValueChange={v=>setForm({...form,[s.key]:v[0]})} className="mt-3" />
                </div>
              ))}
            </div>

            <div>
              <Label className="text-white/70">Primary AI goal in next 6 months</Label>
              <Textarea data-testid="assess-goals" value={form.goals} onChange={e=>setForm({...form,goals:e.target.value})} className="bg-[#0A0E17] border-white/10 mt-2" placeholder="Reduce fraud false-positives, launch RAG copilot, etc." rows={3} />
            </div>

            <button data-testid="assess-submit" disabled={loading} onClick={submit} className="btn-gold w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? "Generating report…" : (<>Generate maturity report <Sparkles className="w-4 h-4" /></>)}
            </button>

            {result && (
              <div data-testid="assess-result" className="mt-4 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="label-eyebrow">Your snapshot</div>
                  <div className="font-display text-3xl text-[#C5A059]">{result.score}<span className="text-sm text-white/50">/100</span></div>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-white/85 leading-relaxed">{result.report_markdown}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Network = () => (
  <section id="network" className="py-24 md:py-32 border-t border-white/5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-eyebrow mb-4 flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Vetted network</div>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">Featured providers.</h2>
        </div>
        <p className="text-white/50 max-w-sm text-sm">Small, mid &amp; large enterprises. Startups. Boutique consultancies. One curated bridge.</p>
      </div>
    </div>
    <div className="mt-14 overflow-hidden">
      <div className="marquee">
        {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
          <div key={i} className="na-card px-6 py-5 min-w-[260px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#C5A059]/30 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-[#C5A059]" />
              </div>
              <div>
                <div className="font-display text-lg leading-none">{p.name}</div>
                <div className="text-xs text-white/50 mt-1">{p.niche}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Founder = () => (
  <section id="founder" className="py-24 md:py-32 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-5">
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#C5A059]/30 to-[#00E5FF]/10 blur-xl -z-10" />
          <img src={IMG.founder} alt="Founder portrait" className="rounded-2xl grayscale contrast-125 border border-white/10 w-full" />
        </div>
      </div>
      <div className="lg:col-span-7">
        <div className="label-eyebrow mb-4 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> The founder is the product</div>
        <h2 className="font-display text-4xl md:text-5xl leading-tight">Trust, personally curated.</h2>
        <p className="mt-6 text-white/70 leading-relaxed">
          NeuralAtlas is founded and operated by a practicing enterprise AI architect. Every provider is vetted on live problems — not slide decks. Every enterprise is briefed by a technologist — not a salesperson.
        </p>
        <ul className="mt-8 space-y-3">
          {RUBRIC.map((r) => (
            <li key={r} className="flex items-start gap-3 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059] mt-1 shrink-0" /> <span>{r}</span>
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
      <h3 className="font-display text-2xl">Tell us what you&rsquo;re building.</h3>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input data-testid="ent-company" placeholder="Company" className="bg-[#0A0E17] border-white/10" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} />
        <Input data-testid="ent-contact" placeholder="Your name" className="bg-[#0A0E17] border-white/10" value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} />
        <Input data-testid="ent-email" placeholder="Work email" className="bg-[#0A0E17] border-white/10" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <Input data-testid="ent-role" placeholder="Role (e.g. Head of Digital)" className="bg-[#0A0E17] border-white/10" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} />
        <Input data-testid="ent-industry" placeholder="Industry" className="bg-[#0A0E17] border-white/10" value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} />
        <Select value={form.company_size} onValueChange={v=>setForm({...form,company_size:v})}>
          <SelectTrigger data-testid="ent-size" className="bg-[#0A0E17] border-white/10"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#111827] border-white/10 text-white">
            <SelectItem value="startup">Startup</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="mid">Mid-market</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Input data-testid="ent-budget" placeholder="Budget range (USD)" className="bg-[#0A0E17] border-white/10" value={form.budget_range} onChange={e=>setForm({...form,budget_range:e.target.value})} />
        <Input data-testid="ent-timeline" placeholder="Timeline (e.g. Q1 2026)" className="bg-[#0A0E17] border-white/10" value={form.timeline} onChange={e=>setForm({...form,timeline:e.target.value})} />
      </div>
      <Textarea data-testid="ent-project" placeholder="Describe the project" rows={4} className="mt-4 bg-[#0A0E17] border-white/10" value={form.project_description} onChange={e=>setForm({...form,project_description:e.target.value})} />
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
      <h3 className="font-display text-2xl">Join the vetted network.</h3>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input data-testid="prov-company" placeholder="Company" className="bg-[#0A0E17] border-white/10" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} />
        <Input data-testid="prov-contact" placeholder="Founder / lead" className="bg-[#0A0E17] border-white/10" value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} />
        <Input data-testid="prov-email" placeholder="Email" className="bg-[#0A0E17] border-white/10" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <Input data-testid="prov-website" placeholder="Website" className="bg-[#0A0E17] border-white/10" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} />
        <Input data-testid="prov-hq" placeholder="Headquarters (city, country)" className="bg-[#0A0E17] border-white/10" value={form.headquarters} onChange={e=>setForm({...form,headquarters:e.target.value})} />
        <Input data-testid="prov-size" placeholder="Team size" className="bg-[#0A0E17] border-white/10" value={form.team_size} onChange={e=>setForm({...form,team_size:e.target.value})} />
      </div>
      <Textarea data-testid="prov-spec" placeholder="Specializations (models, verticals, deployment style)" rows={3} className="mt-4 bg-[#0A0E17] border-white/10" value={form.specializations} onChange={e=>setForm({...form,specializations:e.target.value})} />
      <Textarea data-testid="prov-cases" placeholder="Two references / case studies (short)" rows={3} className="mt-4 bg-[#0A0E17] border-white/10" value={form.case_studies} onChange={e=>setForm({...form,case_studies:e.target.value})} />
      <div className="mt-4">
        <Label className="text-white/70">Membership tier</Label>
        <Select value={form.tier_interest} onValueChange={v=>setForm({...form,tier_interest:v})}>
          <SelectTrigger data-testid="prov-tier" className="bg-[#0A0E17] border-white/10 mt-2"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#111827] border-white/10 text-white">
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
  <section id="apply" className="py-24 md:py-32 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-3xl mb-14">
        <div className="label-eyebrow mb-4">Start the conversation</div>
        <h2 className="font-display text-4xl md:text-5xl leading-tight">Enterprises free. Providers vetted. Deals matched.</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnterpriseForm />
        <ProviderForm />
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-white/5 pt-20 pb-12">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
      <div className="md:col-span-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#C5A059] to-[#00E5FF] flex items-center justify-center"><Compass className="w-4 h-4 text-[#0A0E17]" /></div>
          <span className="font-display text-xl">NeuralAtlas<span className="text-[#C5A059]">.io</span></span>
        </div>
        <p className="mt-4 text-sm text-white/50 max-w-xs">The curated bridge between enterprises and the AI startup ecosystem.</p>
      </div>

      <div className="md:col-span-4 na-card overflow-hidden">
        <div className="h-32 relative">
          <img src={IMG.dubai} className="w-full h-full object-cover opacity-70" alt="Dubai" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] to-transparent" />
        </div>
        <div className="p-5">
          <div className="label-eyebrow flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Dubai</div>
          <div className="text-white/70 text-sm mt-2">DIFC · Emirates Financial Towers</div>
          <div className="text-white/50 text-sm">United Arab Emirates</div>
        </div>
      </div>

      <div className="md:col-span-4 na-card overflow-hidden">
        <div className="h-32 relative">
          <img src={IMG.bangalore} className="w-full h-full object-cover opacity-70" alt="Bangalore" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] to-transparent" />
        </div>
        <div className="p-5">
          <div className="label-eyebrow flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Bangalore</div>
          <div className="text-white/70 text-sm mt-2">Indiranagar · 100 Ft Road</div>
          <div className="text-white/50 text-sm">Karnataka, India</div>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 mt-12 flex items-center justify-between flex-wrap gap-4 text-xs text-white/40">
      <div>© {new Date().getFullYear()} NeuralAtlas.io · A curated AI marketplace</div>
      <div className="flex items-center gap-6">
        <a href="mailto:hello@neuralatlas.io" className="link-underline flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> hello@neuralatlas.io</a>
        <span className="flex items-center gap-2"><Globe2 className="w-3.5 h-3.5" /> Bangalore · Dubai</span>
      </div>
    </div>
  </footer>
);

export default function Landing() {
  return (
    <main data-testid="landing-page" className="min-h-screen bg-[#0A0E17] text-white overflow-x-hidden">
      <Nav />
      <Hero />
      <HowItWorks />
      <Tiers />
      <Assessment />
      <Network />
      <Founder />
      <Forms />
      <Footer />
    </main>
  );
}

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes("@")) { toast.error("Enter a valid email"); return; }
    setLoading(true);
    try {
      await api.post("/newsletter/subscribe", { email });
      toast.success("Subscribed. Curated AI briefs, once a month.");
      setEmail("");
    } catch { toast.error("Could not subscribe"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="na-card p-5" data-testid="newsletter-form">
      <div className="label-eyebrow flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Newsletter</div>
      <div className="mt-3 text-sm text-[var(--na-text-soft)] leading-relaxed">
        Curated AI insights for enterprise leaders. Once a month. No noise.
      </div>
      <div className="mt-4 flex gap-2">
        <input
          data-testid="newsletter-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="flex-1 na-input rounded-full px-4 py-2 text-sm border outline-none focus:border-[var(--na-gold)] transition-colors"
        />
        <button data-testid="newsletter-submit" type="submit" disabled={loading} className="btn-gold px-4 py-2 text-sm inline-flex items-center gap-1">
          {loading ? "…" : (<><ArrowRight className="w-3.5 h-3.5" /></>)}
        </button>
      </div>
    </form>
  );
}

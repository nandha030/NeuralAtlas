import StaticPage from "./StaticPage";
import { Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <StaticPage
      eyebrow="Company"
      title="Contact"
      subtitle="Enterprises, providers, press or partners — reach us directly. We reply within one business day."
      sections={[
        {
          heading: "Direct",
          body: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a href="mailto:info@neuralatlas.io" className="na-card p-6 block hover:border-[var(--na-gold)]/40 transition-colors">
                <Mail className="w-5 h-5 text-[var(--na-gold)]" />
                <div className="label-eyebrow mt-4">General</div>
                <div className="mt-2 text-[var(--na-text)]">info@neuralatlas.io</div>
              </a>
              <a href="mailto:providers@neuralatlas.io" className="na-card p-6 block hover:border-[var(--na-gold)]/40 transition-colors">
                <Mail className="w-5 h-5 text-[var(--na-cyan)]" />
                <div className="label-eyebrow mt-4">Providers</div>
                <div className="mt-2 text-[var(--na-text)]">providers@neuralatlas.io</div>
              </a>
            </div>
          ),
        },
        {
          heading: "Offices",
          body: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="na-card p-6">
                <div className="label-eyebrow flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Bangalore</div>
                <p className="mt-3 text-[var(--na-text-soft)] leading-relaxed">Indiranagar · 100 Ft Road<br />Karnataka, India</p>
              </div>
              <div className="na-card p-6">
                <div className="label-eyebrow flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Dubai</div>
                <p className="mt-3 text-[var(--na-text-soft)] leading-relaxed">DIFC · Emirates Financial Towers<br />United Arab Emirates</p>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}

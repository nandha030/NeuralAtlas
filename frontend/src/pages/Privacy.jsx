import StaticPage from "./StaticPage";

export default function Privacy() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How NeuralAtlas collects, uses, and protects information from enterprises, providers, and visitors."
      sections={[
        { heading: "1. Who we are", body: "NeuralAtlas is a curated AI marketplace operated by NeuralAtlas Ventures, with offices in Bangalore, India and DIFC, Dubai. For any privacy inquiry write to info@neuralatlas.io." },
        { heading: "2. What we collect", body: "• Enterprise intake data: company name, contact name, work email, role, industry, company size, project description, budget range, timeline, region.\n• Provider application data: company name, contact name, email, website, headquarters, team size, specializations, case studies, tier interest.\n• AI Maturity Assessment inputs and generated reports.\n• Newsletter subscribers' email addresses.\n• Admin access logs (email, IP, timestamp)." },
        { heading: "3. How we use it", body: "We use data solely to match enterprises with vetted AI providers, generate maturity reports, send transactional alerts to our operators, and improve the service. We do not sell, rent or share personal data with third parties for marketing." },
        { heading: "4. Legal basis", body: "We process personal data on the basis of (a) your consent when submitting a form, (b) legitimate interest to run and secure the marketplace, and (c) contractual necessity when facilitating an introduction." },
        { heading: "5. Data location", body: "Data is stored in managed databases hosted in India and Singapore regions. We use encrypted transport (TLS 1.2+) and encrypted-at-rest storage." },
        { heading: "6. Retention", body: "We retain intake and application data for 24 months after last activity, unless you request earlier deletion. Newsletter subscribers are retained until they unsubscribe." },
        { heading: "7. Your rights", body: "You may request access, correction, deletion or export of your personal data by writing to info@neuralatlas.io. Requests are honoured within 30 days." },
        { heading: "8. Cookies", body: "We use only strictly necessary cookies (authentication, theme preference). See our Cookie Policy for details." },
        { heading: "9. Updates", body: "We may update this policy from time to time. Material changes will be posted here with a new effective date." },
      ]}
    />
  );
}

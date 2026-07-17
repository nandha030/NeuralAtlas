import StaticPage from "./StaticPage";

export default function Terms() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="The agreement between you and NeuralAtlas when using this site, submitting a form, or joining the vetted network."
      sections={[
        { heading: "1. Acceptance", body: "By accessing NeuralAtlas or submitting any form, you agree to these Terms. If you do not agree, do not use the service." },
        { heading: "2. Service description", body: "NeuralAtlas is a curated, two-sided marketplace. Enterprises submit project briefs and receive human-reviewed shortlists of AI service providers at no cost. AI service providers apply for a paid membership and, if approved, gain access to warm introductions." },
        { heading: "3. Membership tiers", body: "Provider memberships (Starter, Growth, Elite) are billed annually in USD. Fees are non-refundable. Approved providers may be delisted at NeuralAtlas' sole discretion if they violate these Terms or fail vetting standards." },
        { heading: "4. Commissions", body: "A per-deal commission (5–35% depending on tier) may apply on closed deals sourced through the platform. Terms are documented in the provider onboarding agreement." },
        { heading: "5. Vetting & no warranty", body: "NeuralAtlas performs commercially reasonable human vetting of providers, but does not guarantee outcomes. Enterprises remain solely responsible for their contractual, legal and commercial dealings with providers." },
        { heading: "6. Acceptable use", body: "You will not misuse the site, submit false information, scrape data, or attempt to circumvent authentication. Violation may result in suspension and civil action." },
        { heading: "7. Intellectual property", body: "All content, brand marks, and vetting frameworks on this site are the property of NeuralAtlas Ventures. You may not copy, resell or republish without written consent." },
        { heading: "8. Limitation of liability", body: "To the maximum extent permitted by law, NeuralAtlas' aggregate liability under these Terms is limited to the fees paid to us in the 12 months preceding the claim. We are not liable for indirect, incidental or consequential damages." },
        { heading: "9. Governing law", body: "These Terms are governed by the laws of India, with exclusive jurisdiction in the courts of Bangalore, subject to arbitration under the DIFC-LCIA Rules for parties based in the UAE." },
        { heading: "10. Contact", body: "Questions about these Terms: info@neuralatlas.io" },
      ]}
    />
  );
}

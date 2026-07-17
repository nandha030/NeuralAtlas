import StaticPage from "./StaticPage";

export default function Careers() {
  return (
    <StaticPage
      eyebrow="Company"
      title="Careers"
      subtitle="We are a very small team, hiring only when a role would move the needle for enterprises or providers."
      sections={[
        { heading: "How we work", body: "Remote-first between Bangalore and Dubai. Async by default, deep-work friendly, no theatre. We ship, we vet, we close deals — nothing else." },
        { heading: "Open roles", body: "• Founding AI Solutions Architect (Bangalore / Dubai — full-time)\n• Founding Provider Success Lead (Dubai — full-time)\n• GTM & Enterprise BD Analyst (Bangalore — full-time)\n\nWe post roles here first, then on LinkedIn. If a role feels made for you but isn't listed, write to us anyway." },
        { heading: "What we offer", body: "Meaningful equity, honest cash, direct exposure to founders and CIOs from day one, and a very short chain between your work and real revenue." },
        { heading: "Apply", body: "Send a note + something you've built to info@neuralatlas.io with the subject 'Careers · <role>'." },
      ]}
    />
  );
}

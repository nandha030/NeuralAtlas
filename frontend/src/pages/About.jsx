import StaticPage from "./StaticPage";

export default function About() {
  return (
    <StaticPage
      eyebrow="Company"
      title="About NeuralAtlas"
      subtitle="A curated bridge between enterprises that need AI and the founders who build it."
      sections={[
        { heading: "The problem", body: "Enterprise AI is a trust deficit. Buyers get pitched by hundreds of vendors, procurement favours incumbents, and genuine specialists never get in the room. Meanwhile, the best AI startups spend more time chasing meetings than shipping models." },
        { heading: "The bridge", body: "NeuralAtlas is a boutique, founder-led marketplace. A practicing enterprise AI architect personally vets every provider on live problems, and personally briefs every enterprise. There is no algorithmic auction — just curated matches with an architect in the room." },
        { heading: "Where we operate", body: "We are headquartered in Bangalore and Dubai, and focus on BFSI, Pharma & Life Sciences, Energy, Manufacturing, and Maritime — the verticals we know deepest." },
        { heading: "How we make money", body: "Enterprises pay nothing. Providers fund the network through annual memberships and per-deal commissions. This alignment lets us stay honest with buyers." },
        { heading: "What comes next", body: "This is v0.1 of a long build. We are documenting the vetting rubric so it becomes a repeatable process, and eventually a product. Follow along at info@neuralatlas.io." },
      ]}
    />
  );
}

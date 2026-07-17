import StaticPage from "./StaticPage";

export default function Cookies() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Cookie Policy"
      subtitle="What we store on your device when you use NeuralAtlas — and why."
      sections={[
        { heading: "1. What cookies are", body: "Cookies and localStorage entries are small pieces of data a website stores on your browser to remember preferences and keep you signed in." },
        { heading: "2. What we use", body: "NeuralAtlas uses only strictly-necessary storage:\n• access_token (HTTP-only cookie) — keeps admin operators signed in for 12 hours.\n• na_token (localStorage) — the admin JWT, used as a fallback bearer token.\n• na_theme (localStorage) — remembers your light/dark preference." },
        { heading: "3. What we do NOT use", body: "We do not use marketing, advertising, or third-party tracking cookies. We do not embed pixels from ad networks." },
        { heading: "4. Managing cookies", body: "You can clear all NeuralAtlas cookies and localStorage entries at any time from your browser's site-settings. Note: this will sign you out of the admin console." },
        { heading: "5. Questions", body: "info@neuralatlas.io" },
      ]}
    />
  );
}

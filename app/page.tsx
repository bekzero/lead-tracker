import { LeadForm } from "@/components/LeadForm";
import { getEventName } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const eventName = getEventName();

  return (
    <main className="public-shell">
      <section className="intro" aria-labelledby="page-title">
        <div className="brand" aria-label="KZero Passwordless">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span>KZERO <strong>PASSWORDLESS</strong></span>
        </div>
        <p className="eyebrow">{eventName}</p>
        <h1 id="page-title">Let’s keep the conversation going.</h1>
        <p className="intro-copy">
          Leave your details and the KZero team will follow up after the conference. It takes about a minute.
        </p>
        <div className="trust-row" aria-label="Form benefits">
          <span>About 60 seconds</span>
          <span>No calendar detour</span>
        </div>
      </section>
      <LeadForm />
      <footer className="public-footer">© {new Date().getFullYear()} KZero Passwordless</footer>
    </main>
  );
}

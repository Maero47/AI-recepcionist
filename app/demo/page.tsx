import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function DemoPage() {
  return (
    <AppShell>
      <section className="landing-band">
        <p className="eyebrow">AlwaysBooked AI for mobile detailers</p>
        <h1>Answer every missed call, even while you are on the job.</h1>
        <p className="lede">
          A 24/7 phone assistant that answers missed calls, captures quote requests, and texts the details to the
          owner.
        </p>
        <div className="button-row">
          <Link className="button" href="/dashboard">
            Open live dashboard
          </Link>
          <Link className="button secondary" href="/dashboard/business">
            Configure demo business
          </Link>
        </div>
      </section>

      <section className="landing-band">
        <h2>What it captures</h2>
        <ul className="flow-list">
          <li>Name and phone number</li>
          <li>Service needed</li>
          <li>Location and vehicle details</li>
          <li>Preferred date or time</li>
          <li>Urgency and notes</li>
        </ul>
      </section>

      <div className="two-column">
        <section className="panel">
          <h2>How the missed-call flow works</h2>
          <ul className="compact-list">
            <li>
              <strong>1. Missed call forwards</strong>
              <span className="muted">The existing business number forwards unanswered calls to the AI number.</span>
            </li>
            <li>
              <strong>2. Assistant answers</strong>
              <span className="muted">It uses approved services, prices, FAQs, service area, and handoff rules.</span>
            </li>
            <li>
              <strong>3. Lead is created</strong>
              <span className="muted">The dashboard stores transcript, summary, required fields, and status.</span>
            </li>
            <li>
              <strong>4. Owner is notified</strong>
              <span className="muted">Email summaries are sent for leads, and urgent leads can trigger SMS.</span>
            </li>
          </ul>
        </section>

        <section className="panel">
          <h2>Human handoff by default</h2>
          <p className="muted">
            The assistant escalates complaints, emergency language, refund requests, exact-price exceptions, unsupported
            services, and anything outside the approved knowledge base.
          </p>
          <div className="callout">
            I do not want to give you the wrong answer on that. I can send this to the owner for a callback. What is the
            best number to reach you?
          </div>
        </section>
      </div>

      <section className="landing-band">
        <h2>Simple launch pricing</h2>
        <div className="price-grid">
          <div className="price">
            <h3>Starter</h3>
            <strong>GBP 99/mo</strong>
            <span className="muted">Missed-call answering, lead capture, email summaries, basic dashboard.</span>
          </div>
          <div className="price">
            <h3>Growth</h3>
            <strong>GBP 199/mo</strong>
            <span className="muted">Adds SMS summaries, website chat, FAQ editor, and daily digest.</span>
          </div>
          <div className="price">
            <h3>Pro</h3>
            <strong>GBP 399/mo</strong>
            <span className="muted">Adds multi-staff handoff, CRM integration, and monthly optimization report.</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ChatWidget } from "@/components/ChatWidget";
import { LeadTable } from "@/components/LeadTable";
import { MetricCard } from "@/components/MetricCard";
import { getDashboardStats, getDefaultBusiness, listConversations, listLeads, listNotifications } from "@/lib/store";

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0
});

export default function DashboardPage() {
  const business = getDefaultBusiness();
  const stats = getDashboardStats(business.id);
  const leads = listLeads(business.id);
  const conversations = listConversations(business.id);
  const notifications = listNotifications(business.id);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Owner dashboard</p>
          <h1>Lead recovery command center for {business.name}</h1>
          <p className="lede">
            Track calls answered, quote requests, escalations, and follow-up status from one focused local-service
            workflow.
          </p>
        </div>
        <div className="button-row">
          <Link className="button" href="/dashboard/business">
            Edit setup
          </Link>
          <Link className="button secondary" href="/demo">
            View demo page
          </Link>
        </div>
      </header>

      <section className="metric-grid" aria-label="Dashboard metrics">
        <MetricCard label="New leads this week" value={stats.newLeadsThisWeek} />
        <MetricCard label="Calls answered" value={stats.callsAnswered} />
        <MetricCard label="Missed-call recoveries" value={stats.missedCallRecoveries} />
        <MetricCard label="Quote requests" value={stats.quoteRequests} />
        <MetricCard label="Bookings requested" value={stats.bookingsRequested} />
        <MetricCard label="Escalations" value={stats.escalations} />
        <MetricCard label="Estimated pipeline" value={currency.format(stats.estimatedPipeline)} />
        <MetricCard label="FAQ answers" value="30" />
      </section>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Lead dashboard</h2>
              <p className="muted">Update statuses as customers move from captured lead to booked job.</p>
            </div>
          </div>
          <LeadTable initialLeads={leads} />
        </section>

        <aside className="stack">
          <section className="panel">
            <h2>Call forwarding setup</h2>
            <ul className="compact-list">
              <li>
                <strong>Forward missed calls</strong>
                <span className="muted">Use carrier conditional forwarding settings to send missed calls.</span>
              </li>
              <li>
                <strong>Destination</strong>
                <span className="muted">{business.aiForwardingNumber}</span>
              </li>
              <li>
                <strong>Consent line</strong>
                <span className="muted">{business.consentDisclosure}</span>
              </li>
            </ul>
          </section>

          <section className="panel">
            <h2>Recent conversations</h2>
            <ul className="compact-list">
              {conversations.slice(0, 4).map((conversation) => (
                <li key={conversation.id}>
                  <strong>{conversation.outcome.replace("_", " ")}</strong>
                  <span className="muted">{conversation.aiSummary}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
              <p className="muted">No live notifications sent yet. Missing Resend or Twilio config is recorded as skipped.</p>
            ) : (
              <ul className="compact-list">
                {notifications.slice(0, 4).map((notification) => (
                  <li key={notification.id}>
                    <strong>
                      {notification.channel} {notification.status}
                    </strong>
                    <span className="muted">{notification.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <div style={{ marginTop: 16 }}>
        <ChatWidget businessId={business.id} />
      </div>
    </AppShell>
  );
}

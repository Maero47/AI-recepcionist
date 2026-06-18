import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import {
  getDashboardStats,
  getDefaultBusiness,
  listBusinesses,
  listConversations,
  listEvalCases,
  listNotifications
} from "@/lib/store";

export default function AdminPage() {
  const business = getDefaultBusiness();
  const businesses = listBusinesses();
  const stats = getDashboardStats(business.id);
  const conversations = listConversations(business.id);
  const notifications = listNotifications(business.id);
  const evalCases = listEvalCases(business.id);
  const providerErrors = notifications.filter((notification) => notification.status === "failed").length;

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Internal admin</p>
          <h1>Customer, usage, escalation, and quality controls</h1>
          <p className="lede">Early operator view for onboarding, usage review, failed calls, and evaluation tracking.</p>
        </div>
      </header>

      <section className="metric-grid">
        <MetricCard label="Customers" value={businesses.length} />
        <MetricCard label="Active subscriptions" value="1 demo" />
        <MetricCard label="Escalations" value={stats.escalations} />
        <MetricCard label="Provider errors" value={providerErrors} />
      </section>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Knowledge gaps and escalations</h2>
              <p className="muted">Review conversations that required handoff or failed delivery.</p>
            </div>
          </div>
          <ul className="compact-list">
            {conversations
              .filter((conversation) => conversation.escalationReason)
              .map((conversation) => (
                <li key={conversation.id}>
                  <strong>{conversation.escalationReason}</strong>
                  <span className="muted">{conversation.aiSummary}</span>
                </li>
              ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Evaluation cases</h2>
              <p className="muted">Starter set for measuring refusal, escalation, and lead-capture quality.</p>
            </div>
          </div>
          <ul className="compact-list">
            {evalCases.map((evalCase) => (
              <li key={evalCase.id}>
                <strong>{evalCase.scenario}</strong>
                <span className="muted">
                  Expected: {evalCase.expectedBehavior} Escalation: {evalCase.escalationRequired ? "yes" : "no"}.
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

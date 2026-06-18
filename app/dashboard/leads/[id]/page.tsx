import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SourcePill, StatusPill, UrgencyPill } from "@/components/StatusPill";
import { getConversationForLead, getLead } from "@/lib/store";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = getLead(id);

  if (!lead) {
    notFound();
  }

  const conversation = getConversationForLead(lead.id);

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Conversation detail</p>
          <h1>{lead.customerName}</h1>
          <p className="lede">{lead.summary}</p>
        </div>
        <Link className="button secondary" href="/dashboard">
          Back to dashboard
        </Link>
      </header>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Extracted lead fields</h2>
              <p className="muted">Required quote fields captured from the conversation.</p>
            </div>
          </div>
          <ul className="compact-list">
            <li>
              <strong>Contact</strong>
              <span className="muted">
                {lead.customerPhone || "No phone"} {lead.customerEmail ? ` / ${lead.customerEmail}` : ""}
              </span>
            </li>
            <li>
              <strong>Service</strong>
              <span className="muted">{lead.serviceRequested}</span>
            </li>
            <li>
              <strong>Location</strong>
              <span className="muted">{lead.location || "Not provided"}</span>
            </li>
            <li>
              <strong>Preferred time</strong>
              <span className="muted">{lead.preferredTime || "Not provided"}</span>
            </li>
            <li>
              <strong>Urgency</strong>
              <UrgencyPill urgency={lead.urgency} />
            </li>
            <li>
              <strong>Status</strong>
              <StatusPill status={lead.status} />
            </li>
            <li>
              <strong>Source</strong>
              <SourcePill source={lead.source} />
            </li>
            <li>
              <strong>Owner notes</strong>
              <span className="muted">{lead.notes || "No notes yet."}</span>
            </li>
          </ul>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Conversation</h2>
              <p className="muted">
                Transcript, summary, recording link, escalation reason, and provider call metadata.
              </p>
            </div>
          </div>
          {conversation ? (
            <div className="stack">
              <p>
                <strong>Outcome:</strong> {conversation.outcome.replace("_", " ")}
              </p>
              <p>
                <strong>Provider call ID:</strong> {conversation.providerCallId ?? "Not provided"}
              </p>
              <p>
                <strong>Escalation:</strong> {conversation.escalationReason ?? "None"}
              </p>
              <p>
                <strong>Recording:</strong>{" "}
                {conversation.recordingUrl ? (
                  <a href={conversation.recordingUrl}>{conversation.recordingUrl}</a>
                ) : (
                  "Not enabled"
                )}
              </p>
              <pre className="transcript">{conversation.transcript || conversation.aiSummary}</pre>
            </div>
          ) : (
            <p className="muted">No conversation is attached to this lead yet.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}

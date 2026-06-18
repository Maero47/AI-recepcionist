import type { LeadSource, LeadStatus, Urgency } from "@/lib/types";

export function StatusPill({ status }: { status: LeadStatus }) {
  return <span className="status-pill">{status.replace("_", " ")}</span>;
}

export function SourcePill({ source }: { source: LeadSource }) {
  return <span className="source-pill">{source}</span>;
}

export function UrgencyPill({ urgency }: { urgency: Urgency }) {
  return <span className={`urgency-pill ${urgency === "urgent" ? "urgent" : ""}`}>{urgency}</span>;
}

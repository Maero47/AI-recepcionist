"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types";
import { SourcePill, StatusPill, UrgencyPill } from "@/components/StatusPill";

const statuses: LeadStatus[] = ["new", "contacted", "booked", "won", "lost"];

export function LeadTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  async function updateStatus(id: string, status: LeadStatus) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));

    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Location</th>
            <th>Urgency</th>
            <th>Source</th>
            <th>Status</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <Link href={`/dashboard/leads/${lead.id}`}>
                  <strong>{lead.customerName}</strong>
                </Link>
                <br />
                <span className="muted">{lead.customerPhone || lead.customerEmail || "No contact"}</span>
              </td>
              <td>{lead.serviceRequested}</td>
              <td>{lead.location || "Not provided"}</td>
              <td>
                <UrgencyPill urgency={lead.urgency} />
              </td>
              <td>
                <SourcePill source={lead.source} />
              </td>
              <td>
                <label className="field">
                  <StatusPill status={lead.status} />
                  <select
                    className="select"
                    value={lead.status}
                    onChange={(event) => updateStatus(lead.id, event.target.value as LeadStatus)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </td>
              <td>{lead.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

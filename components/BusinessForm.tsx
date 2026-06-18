"use client";

import { useState } from "react";
import type { Business } from "@/lib/types";

interface BusinessFormState extends Omit<Business, "handoffRules" | "neverSay"> {
  handoffRulesText: string;
  neverSayText: string;
}

function toText(lines: string[]): string {
  return lines.join("\n");
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function BusinessForm({ business }: { business: Business }) {
  const [form, setForm] = useState<BusinessFormState>({
    ...business,
    handoffRulesText: toText(business.handoffRules),
    neverSayText: toText(business.neverSay)
  });
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  function updateField(field: keyof BusinessFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function save() {
    setSaving(true);
    setStatus("");

    const response = await fetch("/api/business", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: form.name,
        websiteUrl: form.websiteUrl,
        phoneNumber: form.phoneNumber,
        aiForwardingNumber: form.aiForwardingNumber,
        timezone: form.timezone,
        serviceArea: form.serviceArea,
        businessHours: form.businessHours,
        emergencyHandoffNumber: form.emergencyHandoffNumber,
        notificationEmail: form.notificationEmail,
        notificationPhone: form.notificationPhone,
        bookingLink: form.bookingLink,
        consentDisclosure: form.consentDisclosure,
        handoffRules: toLines(form.handoffRulesText),
        neverSay: toLines(form.neverSayText)
      })
    });

    setSaving(false);
    setStatus(response.ok ? "Business profile saved." : "Could not save business profile.");
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Business profile</h2>
          <p className="muted">Approved business facts used by phone, chat, and lead summaries.</p>
        </div>
        <button className="button" type="button" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Business name</span>
          <input className="input" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        </label>
        <label className="field">
          <span>Website</span>
          <input
            className="input"
            value={form.websiteUrl}
            onChange={(event) => updateField("websiteUrl", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Main phone</span>
          <input
            className="input"
            value={form.phoneNumber}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
          />
        </label>
        <label className="field">
          <span>AI forwarding number</span>
          <input
            className="input"
            value={form.aiForwardingNumber}
            onChange={(event) => updateField("aiForwardingNumber", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Timezone</span>
          <input
            className="input"
            value={form.timezone}
            onChange={(event) => updateField("timezone", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Booking link</span>
          <input
            className="input"
            value={form.bookingLink}
            onChange={(event) => updateField("bookingLink", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Notification email</span>
          <input
            className="input"
            value={form.notificationEmail}
            onChange={(event) => updateField("notificationEmail", event.target.value)}
          />
        </label>
        <label className="field">
          <span>Urgent SMS phone</span>
          <input
            className="input"
            value={form.notificationPhone}
            onChange={(event) => updateField("notificationPhone", event.target.value)}
          />
        </label>
        <label className="field full">
          <span>Service area</span>
          <textarea
            className="textarea"
            value={form.serviceArea}
            onChange={(event) => updateField("serviceArea", event.target.value)}
          />
        </label>
        <label className="field full">
          <span>Business hours</span>
          <textarea
            className="textarea"
            value={form.businessHours}
            onChange={(event) => updateField("businessHours", event.target.value)}
          />
        </label>
        <label className="field full">
          <span>Consent disclosure</span>
          <textarea
            className="textarea"
            value={form.consentDisclosure}
            onChange={(event) => updateField("consentDisclosure", event.target.value)}
          />
        </label>
        <label className="field full">
          <span>Handoff rules, one per line</span>
          <textarea
            className="textarea"
            value={form.handoffRulesText}
            onChange={(event) => updateField("handoffRulesText", event.target.value)}
          />
        </label>
        <label className="field full">
          <span>Things the assistant must never say, one per line</span>
          <textarea
            className="textarea"
            value={form.neverSayText}
            onChange={(event) => updateField("neverSayText", event.target.value)}
          />
        </label>
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </section>
  );
}

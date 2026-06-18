import { createNotification } from "@/lib/store";
import type { Business, Lead, NotificationResult } from "@/lib/types";

export function formatLeadSummary(lead: Lead, business: Business): string {
  return [
    `New lead for ${business.name}`,
    `Customer: ${lead.customerName}`,
    `Phone: ${lead.customerPhone || "Not provided"}`,
    `Email: ${lead.customerEmail || "Not provided"}`,
    `Service: ${lead.serviceRequested}`,
    `Location: ${lead.location || "Not provided"}`,
    `Preferred time: ${lead.preferredTime || "Not provided"}`,
    `Urgency: ${lead.urgency}`,
    `Notes: ${lead.notes || "None"}`,
    `Summary: ${lead.summary}`
  ].join("\n");
}

async function sendEmail(lead: Lead, business: Business, body: string): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "leads@alwaysbooked.ai";
  const recipient = business.notificationEmail;

  if (!apiKey || !recipient) {
    return {
      channel: "email",
      recipient: recipient || "not configured",
      status: "skipped",
      detail: "RESEND_API_KEY or notification email is not configured."
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: recipient,
      subject: `New ${lead.urgency === "urgent" ? "urgent " : ""}lead: ${lead.serviceRequested}`,
      text: body
    })
  });

  if (!response.ok) {
    return {
      channel: "email",
      recipient,
      status: "failed",
      detail: `Resend returned ${response.status}.`
    };
  }

  return {
    channel: "email",
    recipient,
    status: "sent",
    detail: "Email summary sent."
  };
}

async function sendSms(lead: Lead, business: Business, body: string): Promise<NotificationResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const recipient = business.notificationPhone;

  if (!accountSid || !authToken || !from || !recipient) {
    return {
      channel: "sms",
      recipient: recipient || "not configured",
      status: "skipped",
      detail: "Twilio credentials, from number, or notification phone is not configured."
    };
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      From: from,
      To: recipient,
      Body: body.slice(0, 1400)
    })
  });

  if (!response.ok) {
    return {
      channel: "sms",
      recipient,
      status: "failed",
      detail: `Twilio returned ${response.status}.`
    };
  }

  return {
    channel: "sms",
    recipient,
    status: "sent",
    detail: "SMS summary sent."
  };
}

export async function sendLeadNotification(lead: Lead, business: Business): Promise<NotificationResult[]> {
  const body = formatLeadSummary(lead, business);
  const results = [await sendEmail(lead, business, body)];

  if (lead.urgency === "urgent") {
    results.push(await sendSms(lead, business, body));
  }

  for (const result of results) {
    createNotification({
      businessId: business.id,
      leadId: lead.id,
      channel: result.channel,
      recipient: result.recipient,
      status: result.status,
      detail: result.detail
    });
  }

  return results;
}

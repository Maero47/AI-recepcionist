import { createHmac, timingSafeEqual } from "node:crypto";
import { buildLeadSummary } from "@/lib/ai";
import { sendLeadNotification } from "@/lib/notifications";
import { createConversation, createLead, getBusiness, getDefaultBusiness } from "@/lib/store";
import type { Conversation, Lead, NotificationResult } from "@/lib/types";
import { voiceWebhookSchema } from "@/lib/validators";

interface VoiceWebhookResult {
  lead: Lead;
  conversation: Conversation;
  notifications: NotificationResult[];
}

export function verifyVoiceWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.VOICE_WEBHOOK_SECRET;

  if (!secret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signature.replace(/^sha256=/, "");

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
}

export async function handleVoiceWebhook(payload: unknown): Promise<VoiceWebhookResult> {
  const input = voiceWebhookSchema.parse(payload);
  const business = input.businessId ? getBusiness(input.businessId) ?? getDefaultBusiness() : getDefaultBusiness();
  const summary =
    input.aiSummary ||
    buildLeadSummary({
      customerName: input.callerName,
      serviceRequested: input.serviceRequested,
      location: input.location,
      preferredTime: input.preferredTime,
      urgency: input.urgency,
      notes: input.notes
    });

  const lead = createLead({
    businessId: business.id,
    source: "phone",
    customerName: input.callerName,
    customerPhone: input.callerPhone,
    customerEmail: input.callerEmail,
    serviceRequested: input.serviceRequested,
    location: input.location,
    preferredTime: input.preferredTime,
    urgency: input.urgency,
    notes: input.notes,
    summary,
    status: "new",
    estimatedValue: input.estimatedValue
  });

  const conversation = createConversation({
    businessId: business.id,
    leadId: lead.id,
    channel: "phone",
    providerCallId: input.providerCallId || null,
    transcript: input.transcript,
    aiSummary: summary,
    recordingUrl: input.recordingUrl || null,
    escalationReason: input.escalationReason || null,
    outcome: input.outcome
  });

  const notifications = await sendLeadNotification(lead, business);

  return {
    lead,
    conversation,
    notifications
  };
}

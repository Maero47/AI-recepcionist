import { NextResponse } from "next/server";
import { buildLeadSummary, draftAssistantReply, inferUrgency } from "@/lib/ai";
import { sendLeadNotification } from "@/lib/notifications";
import {
  createConversation,
  createLead,
  getBusiness,
  getDefaultBusiness,
  listFaqs,
  listServices
} from "@/lib/store";
import { chatRequestSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

function looksLikeQualifiedLead(message: string): boolean {
  return /\b(quote|book|booking|appointment|availability|price|cost|detail|clean)\b/i.test(message);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const input = chatRequestSchema.parse(payload);
  const business = getBusiness(input.businessId) ?? getDefaultBusiness();
  const services = listServices(business.id);
  const faqs = listFaqs(business.id);
  const reply = draftAssistantReply(input.message, business, services, faqs);
  const service = services.find((item) => input.message.toLowerCase().includes(item.name.toLowerCase()));
  const shouldCreateLead = looksLikeQualifiedLead(input.message) && Boolean(input.visitorPhone || input.visitorEmail);
  let lead = null;
  let notifications = null;

  if (shouldCreateLead) {
    const urgency = inferUrgency(input.message);
    lead = createLead({
      businessId: business.id,
      source: "website",
      customerName: input.visitorName || "Website visitor",
      customerPhone: input.visitorPhone,
      customerEmail: input.visitorEmail,
      serviceRequested: service?.name ?? "Website chat request",
      location: "",
      preferredTime: "",
      urgency,
      notes: input.message,
      summary: buildLeadSummary({
        customerName: input.visitorName || "Website visitor",
        serviceRequested: service?.name ?? "Website chat request",
        location: "",
        preferredTime: "",
        urgency,
        notes: input.message
      }),
      status: "new",
      estimatedValue: 0
    });

    createConversation({
      businessId: business.id,
      leadId: lead.id,
      channel: "website",
      providerCallId: null,
      transcript: `Visitor: ${input.message}\nAssistant: ${reply.message}`,
      aiSummary: lead.summary,
      recordingUrl: null,
      escalationReason: reply.escalation.reason,
      outcome: reply.escalation.shouldEscalate ? "escalated" : "lead_created"
    });

    notifications = await sendLeadNotification(lead, business);
  }

  return NextResponse.json({
    reply,
    lead,
    notifications
  });
}

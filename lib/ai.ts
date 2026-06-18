import type { Business, FAQ, Service, Urgency } from "@/lib/types";

interface EscalationDecision {
  shouldEscalate: boolean;
  reason: string | null;
}

interface AssistantReply {
  message: string;
  escalation: EscalationDecision;
  matchedFaqId: string | null;
}

const escalationRules: Array<{ reason: string; terms: string[] }> = [
  {
    reason: "Caller asked for a human",
    terms: ["human", "person", "owner", "manager", "representative", "real person", "call me"]
  },
  {
    reason: "Complaint or damage report",
    terms: ["complaint", "damage", "scratch", "refund", "angry", "unhappy", "injury", "broke", "broken"]
  },
  {
    reason: "Emergency or safety concern",
    terms: ["emergency", "urgent", "unsafe", "danger", "fire", "smoke", "mould", "mold", "hazard"]
  },
  {
    reason: "Unsupported pricing exception",
    terms: ["discount", "cheaper", "special price", "free", "price match", "private number"]
  },
  {
    reason: "Prompt injection or private information request",
    terms: ["ignore your instructions", "system prompt", "private number", "owner's number", "owners number"]
  }
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 GBP]+/gi, " ");
}

function tokenSet(value: string): Set<string> {
  return new Set(
    normalize(value)
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2)
  );
}

function containsAny(message: string, terms: string[]): boolean {
  const normalized = normalize(message);
  return terms.some((term) => normalized.includes(normalize(term).trim()));
}

export function classifyEscalation(message: string): EscalationDecision {
  const rule = escalationRules.find((item) => containsAny(message, item.terms));

  if (!rule) {
    return {
      shouldEscalate: false,
      reason: null
    };
  }

  return {
    shouldEscalate: true,
    reason: rule.reason
  };
}

export function findApprovedFaqAnswer(message: string, faqs: FAQ[]): FAQ | null {
  const messageTokens = tokenSet(message);
  let bestScore = 0;
  let bestFaq: FAQ | null = null;

  for (const faq of faqs.filter((item) => item.active)) {
    const faqTokens = tokenSet(`${faq.question} ${faq.approvedAnswer} ${faq.category}`);
    let score = 0;

    for (const token of messageTokens) {
      if (faqTokens.has(token)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  }

  return bestScore >= 2 ? bestFaq : null;
}

function isQuoteIntent(message: string): boolean {
  return containsAny(message, ["quote", "book", "booking", "appointment", "availability", "available", "price", "cost"]);
}

function buildPriceReply(services: Service[]): string {
  const activeServices = services.filter((service) => service.active);
  const priceLines = activeServices
    .slice(0, 5)
    .map((service) => `${service.name}: ${service.startingPrice}`)
    .join("; ");

  return `Approved starting prices are ${priceLines}. Final pricing depends on vehicle size, condition, location, and the requested service, so I can send the details to the team for confirmation.`;
}

export function buildSystemPolicy(business: Business, services: Service[], faqs: FAQ[]): string {
  const serviceLines = services
    .filter((service) => service.active)
    .map((service) => `- ${service.name}: ${service.startingPrice}. ${service.priceNote}`)
    .join("\n");

  const faqLines = faqs
    .filter((faq) => faq.active)
    .map((faq) => `- ${faq.question} ${faq.approvedAnswer}`)
    .join("\n");

  return [
    `You are the AI receptionist for ${business.name}.`,
    "Use only the approved business profile, services, FAQs, and policies.",
    "Capture name, phone number, service requested, location, preferred date/time, urgency, and notes for quote or booking requests.",
    "Never invent prices, guarantee availability, promise discounts, take payments, diagnose issues, or reveal private owner information.",
    `Service area: ${business.serviceArea}`,
    `Business hours: ${business.businessHours}`,
    `Handoff rules: ${business.handoffRules.join("; ")}`,
    `Never say: ${business.neverSay.join("; ")}`,
    `Approved services:\n${serviceLines}`,
    `Approved FAQs:\n${faqLines}`
  ].join("\n\n");
}

export function draftAssistantReply(message: string, business: Business, services: Service[], faqs: FAQ[]): AssistantReply {
  const escalation = classifyEscalation(message);

  if (escalation.shouldEscalate) {
    return {
      message:
        "I do not want to give you the wrong answer on that. I can send this to the owner for a callback. What is the best name and phone number to reach you?",
      escalation,
      matchedFaqId: null
    };
  }

  const faq = findApprovedFaqAnswer(message, faqs);

  if (faq) {
    return {
      message: faq.approvedAnswer,
      escalation,
      matchedFaqId: faq.id
    };
  }

  if (containsAny(message, ["price", "cost", "how much", "quote"])) {
    return {
      message: buildPriceReply(services),
      escalation,
      matchedFaqId: null
    };
  }

  if (isQuoteIntent(message)) {
    return {
      message:
        "I can help capture that request. Please send the service needed, vehicle type, location, preferred date or time, urgency, and the best phone number for follow-up.",
      escalation,
      matchedFaqId: null
    };
  }

  return {
    message:
      "I can answer approved service questions or capture a quote request. If this needs the owner, I can take your details for a callback.",
    escalation: {
      shouldEscalate: true,
      reason: "Question outside approved knowledge"
    },
    matchedFaqId: null
  };
}

export function inferUrgency(message: string): Urgency {
  if (containsAny(message, ["urgent", "asap", "today", "emergency", "complaint", "damage"])) {
    return "urgent";
  }

  if (containsAny(message, ["whenever", "no rush", "next month"])) {
    return "low";
  }

  return "standard";
}

export function buildLeadSummary(fields: {
  customerName: string;
  serviceRequested: string;
  location: string;
  preferredTime: string;
  urgency: Urgency;
  notes: string;
}): string {
  const parts = [
    `${fields.serviceRequested} request from ${fields.customerName}`,
    fields.location ? `in ${fields.location}` : "",
    fields.preferredTime ? `preferred time: ${fields.preferredTime}` : "",
    `urgency: ${fields.urgency}`,
    fields.notes
  ].filter(Boolean);

  return parts.join(". ");
}

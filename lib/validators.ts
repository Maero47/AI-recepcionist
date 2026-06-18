import { z } from "zod";

const trimmedString = z.string().trim();
const optionalString = z.preprocess((value) => (value === "" ? undefined : value), z.string().trim().optional());

export const businessUpdateSchema = z.object({
  name: trimmedString.min(1).optional(),
  websiteUrl: optionalString,
  phoneNumber: optionalString,
  aiForwardingNumber: optionalString,
  timezone: trimmedString.min(1).optional(),
  serviceArea: trimmedString.min(1).optional(),
  businessHours: trimmedString.min(1).optional(),
  emergencyHandoffNumber: optionalString,
  notificationEmail: optionalString,
  notificationPhone: optionalString,
  bookingLink: optionalString,
  consentDisclosure: optionalString,
  handoffRules: z.array(trimmedString.min(1)).optional(),
  neverSay: z.array(trimmedString.min(1)).optional()
});

export const serviceCreateSchema = z.object({
  businessId: trimmedString.min(1),
  name: trimmedString.min(1),
  description: trimmedString.min(1),
  startingPrice: trimmedString.min(1),
  priceNote: optionalString.default(""),
  durationMinutes: z.coerce.number().int().min(0).default(0),
  active: z.coerce.boolean().default(true)
});

export const serviceUpdateSchema = serviceCreateSchema.omit({ businessId: true }).partial();

export const faqCreateSchema = z.object({
  businessId: trimmedString.min(1),
  question: trimmedString.min(1),
  approvedAnswer: trimmedString.min(1),
  category: trimmedString.min(1).default("general"),
  active: z.coerce.boolean().default(true)
});

export const faqUpdateSchema = faqCreateSchema.omit({ businessId: true }).partial();

export const leadCreateSchema = z.object({
  businessId: trimmedString.min(1),
  source: z.enum(["phone", "website", "manual"]).default("manual"),
  customerName: trimmedString.min(1),
  customerPhone: optionalString.default(""),
  customerEmail: optionalString.default(""),
  serviceRequested: trimmedString.min(1),
  location: optionalString.default(""),
  preferredTime: optionalString.default(""),
  urgency: z.enum(["low", "standard", "urgent"]).default("standard"),
  notes: optionalString.default(""),
  summary: optionalString.default(""),
  status: z.enum(["new", "contacted", "booked", "won", "lost"]).default("new"),
  estimatedValue: z.coerce.number().min(0).default(0)
});

export const leadUpdateSchema = z.object({
  customerName: trimmedString.min(1).optional(),
  customerPhone: optionalString,
  customerEmail: optionalString,
  serviceRequested: trimmedString.min(1).optional(),
  location: optionalString,
  preferredTime: optionalString,
  urgency: z.enum(["low", "standard", "urgent"]).optional(),
  notes: optionalString,
  summary: optionalString,
  status: z.enum(["new", "contacted", "booked", "won", "lost"]).optional(),
  estimatedValue: z.coerce.number().min(0).optional()
});

export const chatRequestSchema = z.object({
  businessId: trimmedString.min(1),
  message: trimmedString.min(1),
  visitorName: optionalString.default("Website visitor"),
  visitorPhone: optionalString.default(""),
  visitorEmail: optionalString.default("")
});

export const voiceWebhookSchema = z.object({
  businessId: trimmedString.min(1).optional(),
  providerCallId: optionalString.default(""),
  callerName: optionalString.default("Caller"),
  callerPhone: optionalString.default(""),
  callerEmail: optionalString.default(""),
  serviceRequested: optionalString.default("Callback request"),
  location: optionalString.default(""),
  preferredTime: optionalString.default(""),
  urgency: z.enum(["low", "standard", "urgent"]).default("standard"),
  notes: optionalString.default(""),
  transcript: optionalString.default(""),
  aiSummary: optionalString.default(""),
  recordingUrl: optionalString.default(""),
  escalationReason: optionalString.default(""),
  outcome: z.enum(["lead_created", "answered_faq", "escalated", "callback_requested"]).default("lead_created"),
  estimatedValue: z.coerce.number().min(0).default(0)
});

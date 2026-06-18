export type LeadSource = "phone" | "website" | "manual";
export type LeadStatus = "new" | "contacted" | "booked" | "won" | "lost";
export type Urgency = "low" | "standard" | "urgent";
export type ConversationChannel = "phone" | "website" | "manual";
export type ConversationOutcome = "lead_created" | "answered_faq" | "escalated" | "callback_requested";

export interface Business {
  id: string;
  ownerUserId: string;
  name: string;
  websiteUrl: string;
  phoneNumber: string;
  aiForwardingNumber: string;
  timezone: string;
  serviceArea: string;
  businessHours: string;
  emergencyHandoffNumber: string;
  notificationEmail: string;
  notificationPhone: string;
  bookingLink: string;
  consentDisclosure: string;
  handoffRules: string[];
  neverSay: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  startingPrice: string;
  priceNote: string;
  durationMinutes: number;
  active: boolean;
}

export interface FAQ {
  id: string;
  businessId: string;
  question: string;
  approvedAnswer: string;
  category: string;
  active: boolean;
}

export interface Lead {
  id: string;
  businessId: string;
  source: LeadSource;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceRequested: string;
  location: string;
  preferredTime: string;
  urgency: Urgency;
  notes: string;
  summary: string;
  status: LeadStatus;
  estimatedValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  businessId: string;
  leadId: string | null;
  channel: ConversationChannel;
  providerCallId: string | null;
  transcript: string;
  aiSummary: string;
  recordingUrl: string | null;
  escalationReason: string | null;
  outcome: ConversationOutcome;
  createdAt: string;
}

export interface NotificationEvent {
  id: string;
  businessId: string;
  leadId: string;
  channel: "email" | "sms";
  recipient: string;
  status: "sent" | "skipped" | "failed";
  detail: string;
  sentAt: string;
}

export interface EvalCase {
  id: string;
  businessId: string;
  scenario: string;
  expectedBehavior: string;
  escalationRequired: boolean;
  passFail: "untested" | "pass" | "fail";
  notes: string;
  createdAt: string;
}

export interface DashboardStats {
  newLeadsThisWeek: number;
  callsAnswered: number;
  missedCallRecoveries: number;
  quoteRequests: number;
  bookingsRequested: number;
  escalations: number;
  estimatedPipeline: number;
}

export interface NotificationResult {
  channel: "email" | "sms";
  recipient: string;
  status: "sent" | "skipped" | "failed";
  detail: string;
}

export interface ChatTurn {
  role: "visitor" | "assistant";
  content: string;
  createdAt: string;
}

import { seedState } from "@/lib/seed";
import type {
  Business,
  Conversation,
  DashboardStats,
  EvalCase,
  FAQ,
  Lead,
  NotificationEvent,
  Service
} from "@/lib/types";

interface StoreState {
  businesses: Business[];
  services: Service[];
  faqs: FAQ[];
  leads: Lead[];
  conversations: Conversation[];
  notifications: NotificationEvent[];
  evalCases: EvalCase[];
}

const globalForStore = globalThis as typeof globalThis & {
  __alwaysBookedStore?: StoreState;
};

function cloneSeed(): StoreState {
  return JSON.parse(JSON.stringify(seedState)) as StoreState;
}

function state(): StoreState {
  if (!globalForStore.__alwaysBookedStore) {
    globalForStore.__alwaysBookedStore = cloneSeed();
  }

  return globalForStore.__alwaysBookedStore;
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function listBusinesses(): Business[] {
  return state().businesses;
}

export function getDefaultBusiness(): Business {
  return state().businesses[0];
}

export function getBusiness(id: string): Business | undefined {
  return state().businesses.find((business) => business.id === id);
}

export function updateBusiness(id: string, patch: Partial<Business>): Business | null {
  const business = getBusiness(id);

  if (!business) {
    return null;
  }

  Object.assign(business, patch, { updatedAt: nowIso() });
  return business;
}

export function listServices(businessId = getDefaultBusiness().id): Service[] {
  return state().services.filter((service) => service.businessId === businessId);
}

export function createService(input: Omit<Service, "id">): Service {
  const service: Service = {
    ...input,
    id: createId("svc")
  };

  state().services.unshift(service);
  return service;
}

export function updateService(id: string, patch: Partial<Service>): Service | null {
  const service = state().services.find((item) => item.id === id);

  if (!service) {
    return null;
  }

  Object.assign(service, patch);
  return service;
}

export function deleteService(id: string): boolean {
  const current = state().services;
  const index = current.findIndex((service) => service.id === id);

  if (index === -1) {
    return false;
  }

  current.splice(index, 1);
  return true;
}

export function listFaqs(businessId = getDefaultBusiness().id): FAQ[] {
  return state().faqs.filter((faq) => faq.businessId === businessId);
}

export function createFaq(input: Omit<FAQ, "id">): FAQ {
  const faq: FAQ = {
    ...input,
    id: createId("faq")
  };

  state().faqs.unshift(faq);
  return faq;
}

export function updateFaq(id: string, patch: Partial<FAQ>): FAQ | null {
  const faq = state().faqs.find((item) => item.id === id);

  if (!faq) {
    return null;
  }

  Object.assign(faq, patch);
  return faq;
}

export function deleteFaq(id: string): boolean {
  const current = state().faqs;
  const index = current.findIndex((faq) => faq.id === id);

  if (index === -1) {
    return false;
  }

  current.splice(index, 1);
  return true;
}

export function listLeads(businessId = getDefaultBusiness().id): Lead[] {
  return state()
    .leads.filter((lead) => lead.businessId === businessId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getLead(id: string): Lead | undefined {
  return state().leads.find((lead) => lead.id === id);
}

export function createLead(input: Omit<Lead, "id" | "createdAt" | "updatedAt">): Lead {
  const timestamp = nowIso();
  const lead: Lead = {
    ...input,
    id: createId("lead"),
    createdAt: timestamp,
    updatedAt: timestamp
  };

  state().leads.unshift(lead);
  return lead;
}

export function updateLead(id: string, patch: Partial<Lead>): Lead | null {
  const lead = getLead(id);

  if (!lead) {
    return null;
  }

  Object.assign(lead, patch, { updatedAt: nowIso() });
  return lead;
}

export function listConversations(businessId = getDefaultBusiness().id): Conversation[] {
  return state()
    .conversations.filter((conversation) => conversation.businessId === businessId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getConversationForLead(leadId: string): Conversation | undefined {
  return state().conversations.find((conversation) => conversation.leadId === leadId);
}

export function createConversation(input: Omit<Conversation, "id" | "createdAt">): Conversation {
  const conversation: Conversation = {
    ...input,
    id: createId("conv"),
    createdAt: nowIso()
  };

  state().conversations.unshift(conversation);
  return conversation;
}

export function createNotification(input: Omit<NotificationEvent, "id" | "sentAt">): NotificationEvent {
  const notification: NotificationEvent = {
    ...input,
    id: createId("note"),
    sentAt: nowIso()
  };

  state().notifications.unshift(notification);
  return notification;
}

export function listNotifications(businessId = getDefaultBusiness().id): NotificationEvent[] {
  return state()
    .notifications.filter((notification) => notification.businessId === businessId)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export function listEvalCases(businessId = getDefaultBusiness().id): EvalCase[] {
  return state().evalCases.filter((evalCase) => evalCase.businessId === businessId);
}

export function getDashboardStats(businessId = getDefaultBusiness().id): DashboardStats {
  const leads = listLeads(businessId);
  const conversations = listConversations(businessId);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return {
    newLeadsThisWeek: leads.filter((lead) => Date.parse(lead.createdAt) >= sevenDaysAgo).length,
    callsAnswered: conversations.filter((conversation) => conversation.channel === "phone").length,
    missedCallRecoveries: leads.filter((lead) => lead.source === "phone").length,
    quoteRequests: leads.filter((lead) => lead.serviceRequested.toLowerCase().includes("detail")).length,
    bookingsRequested: leads.filter((lead) => lead.status === "booked" || lead.preferredTime.length > 0).length,
    escalations: conversations.filter((conversation) => conversation.escalationReason).length,
    estimatedPipeline: leads.reduce((total, lead) => total + lead.estimatedValue, 0)
  };
}

import { NextResponse } from "next/server";
import { sendLeadNotification } from "@/lib/notifications";
import { createLead, getBusiness, getDefaultBusiness, listLeads } from "@/lib/store";
import { buildLeadSummary } from "@/lib/ai";
import { leadCreateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = getDefaultBusiness();

  return NextResponse.json({ leads: listLeads(business.id) });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const input = leadCreateSchema.parse(payload);
  const business = getBusiness(input.businessId) ?? getDefaultBusiness();
  const lead = createLead({
    ...input,
    businessId: business.id,
    summary:
      input.summary ||
      buildLeadSummary({
        customerName: input.customerName,
        serviceRequested: input.serviceRequested,
        location: input.location,
        preferredTime: input.preferredTime,
        urgency: input.urgency,
        notes: input.notes
      })
  });
  const notifications = await sendLeadNotification(lead, business);

  return NextResponse.json({ lead, notifications }, { status: 201 });
}

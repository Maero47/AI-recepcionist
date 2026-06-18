import { NextResponse } from "next/server";
import { getConversationForLead, getLead, updateLead } from "@/lib/store";
import { leadUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const lead = getLead(id);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({
    lead,
    conversation: getConversationForLead(lead.id) ?? null
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json();
  const input = leadUpdateSchema.parse(payload);
  const lead = updateLead(id, input);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

import { NextResponse } from "next/server";
import { deleteFaq, updateFaq } from "@/lib/store";
import { faqUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json();
  const input = faqUpdateSchema.parse(payload);
  const faq = updateFaq(id, input);

  if (!faq) {
    return NextResponse.json({ error: "FAQ not found." }, { status: 404 });
  }

  return NextResponse.json({ faq });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteFaq(id);

  if (!deleted) {
    return NextResponse.json({ error: "FAQ not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

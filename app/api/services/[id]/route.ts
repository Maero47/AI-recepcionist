import { NextResponse } from "next/server";
import { deleteService, updateService } from "@/lib/store";
import { serviceUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json();
  const input = serviceUpdateSchema.parse(payload);
  const service = updateService(id, input);

  if (!service) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  return NextResponse.json({ service });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const deleted = deleteService(id);

  if (!deleted) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

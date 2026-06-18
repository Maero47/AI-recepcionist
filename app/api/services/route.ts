import { NextResponse } from "next/server";
import { createService, getDefaultBusiness, listServices } from "@/lib/store";
import { serviceCreateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = getDefaultBusiness();

  return NextResponse.json({ services: listServices(business.id) });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const input = serviceCreateSchema.parse(payload);
  const service = createService(input);

  return NextResponse.json({ service }, { status: 201 });
}

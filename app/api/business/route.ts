import { NextResponse } from "next/server";
import { getDefaultBusiness, updateBusiness } from "@/lib/store";
import { businessUpdateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ business: getDefaultBusiness() });
}

export async function PATCH(request: Request) {
  const business = getDefaultBusiness();
  const payload = await request.json();
  const input = businessUpdateSchema.parse(payload);
  const updated = updateBusiness(business.id, input);

  return NextResponse.json({ business: updated });
}

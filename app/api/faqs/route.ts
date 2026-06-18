import { NextResponse } from "next/server";
import { createFaq, getDefaultBusiness, listFaqs } from "@/lib/store";
import { faqCreateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = getDefaultBusiness();

  return NextResponse.json({ faqs: listFaqs(business.id) });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const input = faqCreateSchema.parse(payload);
  const faq = createFaq(input);

  return NextResponse.json({ faq }, { status: 201 });
}

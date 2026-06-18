import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { handleVoiceWebhook, verifyVoiceWebhookSignature } from "@/lib/voiceProvider";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-webhook-signature") ??
    request.headers.get("x-retell-signature") ??
    request.headers.get("x-vapi-signature") ??
    request.headers.get("x-bland-signature");

  if (!verifyVoiceWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const result = await handleVoiceWebhook(payload);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid webhook payload.", issues: error.issues }, { status: 422 });
    }

    return NextResponse.json({ error: "Voice webhook failed." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { logAnalyticsEvent } from "@/lib/analytics";
import type { AnalyticsEventInput, AnalyticsEventType } from "@/lib/analytics-types";

export const dynamic = "force-dynamic";

const ALLOWED_EVENT_TYPES: AnalyticsEventType[] = [
  "link_generated",
  "generator_opened",
  "session_verified",
  "export_clicked",
  "export_succeeded",
  "export_failed",
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<AnalyticsEventInput>;

    if (!body.exhibitorId || typeof body.exhibitorId !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing exhibitorId" },
        { status: 400 }
      );
    }

    if (!body.companyName || typeof body.companyName !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing companyName" },
        { status: 400 }
      );
    }

    if (!body.eventType || !ALLOWED_EVENT_TYPES.includes(body.eventType as AnalyticsEventType)) {
      return NextResponse.json(
        { ok: false, error: "Invalid eventType" },
        { status: 400 }
      );
    }

    const event = await logAnalyticsEvent({
      exhibitorId: body.exhibitorId,
      companyName: body.companyName,
      eventType: body.eventType as AnalyticsEventType,
      format: body.format ?? null,
      metadata: body.metadata ?? {},
    });

    return NextResponse.json({
      ok: true,
      event,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to log event",
      },
      { status: 500 }
    );
  }
}
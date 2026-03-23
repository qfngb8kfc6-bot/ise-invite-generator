import { NextResponse } from "next/server";
import { exhibitors } from "@/lib/exhibitors";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const exhibitor = exhibitors[id];

  if (!exhibitor) {
    return NextResponse.json(
      { success: false, message: "Exhibitor not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    exhibitor,
  });
}
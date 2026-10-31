import { NextResponse } from "next/server";
import { getNeedsAttentionApplications } from "@/services/application.service";

export async function GET() {
  try {
    const items = await getNeedsAttentionApplications();
    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch follow-ups";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

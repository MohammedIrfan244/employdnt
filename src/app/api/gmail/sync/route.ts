import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { scanUserGmail } from "@/services/gmail.service";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let maxResults = 50;
  try {
    const body = await request.json();
    if (body.maxResults && typeof body.maxResults === "number") {
      maxResults = Math.min(Math.max(body.maxResults, 10), 100);
    }
  } catch {
    // no body passed, use default
  }

  const result = await scanUserGmail(session.user.email, { maxResults });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error || "Failed to scan Gmail" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      scanned: result.scanned,
      newDetected: result.newDetected,
      hasMore: result.hasMore,
    },
  });
}


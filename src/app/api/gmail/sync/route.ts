import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { scanUserGmail } from "@/services/gmail.service";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await scanUserGmail(session.user.email);

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
    },
  });
}


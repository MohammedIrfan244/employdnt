import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByEmail } from "@/services/user.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);

  return NextResponse.json({
    success: true,
    data: {
      connected: Boolean(user?.gmailConnected),
      gmailEmail: user?.gmailEmail || null,
      lastSyncedAt: user?.gmailLastSyncedAt || null,
    },
  });
}


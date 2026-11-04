import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { disconnectGmail } from "@/services/user.service";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await disconnectGmail(session.user.email);

  return NextResponse.json({
    success: true,
    message: "Gmail account disconnected successfully",
  });
}


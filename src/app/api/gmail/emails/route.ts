import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDetectedEmails } from "@/services/gmail.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") as "pending" | "confirmed" | "dismissed" | null;
  const limitParam = searchParams.get("limit");

  const emails = await getDetectedEmails(session.user.email, {
    status: statusParam || undefined,
    limit: limitParam ? parseInt(limitParam, 10) : 20,
  });

  return NextResponse.json({
    success: true,
    data: emails,
  });
}


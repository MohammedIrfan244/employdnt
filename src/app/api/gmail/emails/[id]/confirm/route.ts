import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { confirmEmailMatch } from "@/services/gmail.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { applySuggestedStatus, applicationId } = body;

  const result = await confirmEmailMatch(id, session.user.email, {
    applySuggestedStatus: Boolean(applySuggestedStatus),
    applicationId,
  });

  if (!result) {
    return NextResponse.json({ success: false, error: "Email record not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: result,
  });
}


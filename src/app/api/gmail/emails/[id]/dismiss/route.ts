import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dismissDetectedEmail } from "@/services/gmail.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await dismissDetectedEmail(id, session.user.email);

  if (!result) {
    return NextResponse.json({ success: false, error: "Email record not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: result,
  });
}


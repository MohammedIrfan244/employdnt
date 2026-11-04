import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFollowUpOverview } from "@/services/follow-up.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const clientDate = searchParams.get("clientDate") || undefined;

    const overview = await getFollowUpOverview(clientDate, userEmail);
    return NextResponse.json({ success: true, data: overview });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch follow-ups";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

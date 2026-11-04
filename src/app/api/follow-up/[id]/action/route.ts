import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  completeFollowUp,
  postponeFollowUp,
  dismissFollowUp,
} from "@/services/follow-up.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, days = 3, clientDate } = body;

    let updated = null;

    switch (action) {
      case "complete":
        updated = await completeFollowUp(id, userEmail);
        break;
      case "postpone":
        updated = await postponeFollowUp(id, userEmail, Number(days) || 3, clientDate);
        break;
      case "dismiss":
        updated = await dismissFollowUp(id, userEmail);
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action. Use 'complete', 'postpone', or 'dismiss'." },
          { status: 400 }
        );
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process follow-up action";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

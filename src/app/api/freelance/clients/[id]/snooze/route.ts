import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { snoozeScopingClient } from "@/services/freelance-client.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    let snoozeDate = body.snoozeUntil; // YYYY-MM-DD
    if (!snoozeDate && typeof body.days === "number") {
      const target = new Date();
      target.setDate(target.getDate() + body.days);
      snoozeDate = target.toISOString().split("T")[0];
    }

    if (!snoozeDate) {
      return NextResponse.json(
        { success: false, error: "snoozeUntil date or days count is required" },
        { status: 400 }
      );
    }

    const success = await snoozeScopingClient(id, userEmail, snoozeDate);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Client not found or could not be snoozed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Scoping reminder snoozed until ${snoozeDate}`,
      snoozeUntil: snoozeDate,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to snooze reminder";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


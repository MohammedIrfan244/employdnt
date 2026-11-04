import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user.model";
import { DEFAULT_FOLLOW_UP_DAYS, DEFAULT_INITIAL_TARGET } from "@/lib/constants";

export async function GET() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: userEmail }).lean();

    return NextResponse.json({
      success: true,
      data: {
        defaultFollowUpDays: user?.defaultFollowUpDays || DEFAULT_FOLLOW_UP_DAYS,
        notifyEmailDetected: user?.notifyEmailDetected ?? true,
        notifyFollowUpDue: user?.notifyFollowUpDue ?? true,
        targetDailyApplications: user?.targetDailyApplications || DEFAULT_INITIAL_TARGET,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch preferences";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const updateFields: Record<string, unknown> = {};
    if (typeof body.defaultFollowUpDays === "number") {
      updateFields.defaultFollowUpDays = Math.max(1, Math.min(30, body.defaultFollowUpDays));
    }
    if (typeof body.notifyEmailDetected === "boolean") {
      updateFields.notifyEmailDetected = body.notifyEmailDetected;
    }
    if (typeof body.notifyFollowUpDue === "boolean") {
      updateFields.notifyFollowUpDue = body.notifyFollowUpDue;
    }
    if (typeof body.targetDailyApplications === "number") {
      updateFields.targetDailyApplications = Math.max(1, Math.min(50, body.targetDailyApplications));
    }

    const updated = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: updateFields },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      data: {
        defaultFollowUpDays: updated?.defaultFollowUpDays || DEFAULT_FOLLOW_UP_DAYS,
        notifyEmailDetected: updated?.notifyEmailDetected ?? true,
        notifyFollowUpDue: updated?.notifyFollowUpDue ?? true,
        targetDailyApplications: updated?.targetDailyApplications || DEFAULT_INITIAL_TARGET,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update preferences";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


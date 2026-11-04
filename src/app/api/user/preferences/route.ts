import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user.model";
import { DEFAULT_FOLLOW_UP_DAYS, DEFAULT_INITIAL_TARGET } from "@/lib/constants";

export async function GET() {
  try {
    const session = await auth();
    const rawEmail = session?.user?.email;
    if (!rawEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const email = rawEmail.toLowerCase().trim();
    await connectDB();
    const user = await User.findOne({
      $or: [{ email }, { email: rawEmail }],
    }).lean();

    return NextResponse.json({
      success: true,
      data: {
        defaultFollowUpDays:
          typeof user?.defaultFollowUpDays === "number"
            ? user.defaultFollowUpDays
            : DEFAULT_FOLLOW_UP_DAYS,
        notifyEmailDetected:
          typeof user?.notifyEmailDetected === "boolean"
            ? user.notifyEmailDetected
            : true,
        notifyFollowUpDue:
          typeof user?.notifyFollowUpDue === "boolean"
            ? user.notifyFollowUpDue
            : true,
        targetDailyApplications:
          typeof user?.targetDailyApplications === "number"
            ? user.targetDailyApplications
            : DEFAULT_INITIAL_TARGET,
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
    const rawEmail = session?.user?.email;
    if (!rawEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const email = rawEmail.toLowerCase().trim();
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

    const existing = await User.findOne({
      $or: [{ email }, { email: rawEmail }],
    });

    let updated;
    if (existing) {
      updated = await User.findByIdAndUpdate(
        existing._id,
        { $set: { email, ...updateFields } },
        { returnDocument: "after", runValidators: true }
      ).lean();
    } else {
      const created = await User.create({
        email,
        ...updateFields,
      });
      updated = created.toObject ? created.toObject() : created;
    }

    return NextResponse.json({
      success: true,
      data: {
        defaultFollowUpDays:
          typeof updated?.defaultFollowUpDays === "number"
            ? updated.defaultFollowUpDays
            : DEFAULT_FOLLOW_UP_DAYS,
        notifyEmailDetected:
          typeof updated?.notifyEmailDetected === "boolean"
            ? updated.notifyEmailDetected
            : true,
        notifyFollowUpDue:
          typeof updated?.notifyFollowUpDue === "boolean"
            ? updated.notifyFollowUpDue
            : true,
        targetDailyApplications:
          typeof updated?.targetDailyApplications === "number"
            ? updated.targetDailyApplications
            : DEFAULT_INITIAL_TARGET,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update preferences";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

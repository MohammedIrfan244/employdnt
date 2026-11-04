import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/application.model";
import { logTimelineEvent } from "@/services/timeline.service";
import { IApplication } from "@/types/application";
import { ApplicationStatus, EVENT_TYPES } from "@/lib/constants";
import { addDays } from "@/lib/date-utils";

export interface IFollowUpOverview {
  due: IApplication[];
  upcoming: IApplication[];
  stats: {
    dueCount: number;
    upcomingCount: number;
    completedCount: number;
  };
}

/**
 * Retrieves follow-up overview categorized into due/overdue and upcoming,
 * calculated strictly relative to client date, scoped to the user.
 */
export async function getFollowUpOverview(
  clientDateStr: string | undefined,
  userEmail: string
): Promise<IFollowUpOverview> {
  await connectDB();

  // Auto-heal any legacy out-of-sync records: completed follow-ups still marked "Follow-up Needed"
  await Application.updateMany(
    { userEmail, followUpCompleted: true, status: "Follow-up Needed" },
    { $set: { status: "Applied" } }
  );

  // Establish client reference date
  let clientReferenceDate: Date;
  if (clientDateStr && /^\d{4}-\d{2}-\d{2}$/.test(clientDateStr)) {
    const [y, m, d] = clientDateStr.split("-").map(Number);
    clientReferenceDate = new Date(y, m - 1, d, 23, 59, 59, 999);
  } else {
    const now = new Date();
    clientReferenceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  // Active terminal statuses that don't need follow-up
  const nonFollowUpStatuses: ApplicationStatus[] = ["Offer", "Rejected", "Withdrawn"];

  // 1. Due / Overdue follow-ups
  const dueApps = await Application.find({
    userEmail,
    status: { $nin: nonFollowUpStatuses },
    followUpCompleted: { $ne: true },
    followUpDismissed: { $ne: true },
    $or: [
      { status: "Follow-up Needed" },
      {
        followUpDate: { $lte: clientReferenceDate },
      },
    ],
  })
    .populate("categoryId", "name defaultTarget")
    .sort({ followUpDate: 1 })
    .lean();

  // 2. Upcoming follow-ups (next 14 days after client today)
  const fourteenDaysOut = addDays(clientReferenceDate, 14);
  const upcomingApps = await Application.find({
    userEmail,
    status: { $nin: [...nonFollowUpStatuses, "Follow-up Needed"] },
    followUpCompleted: { $ne: true },
    followUpDismissed: { $ne: true },
    followUpDate: {
      $gt: clientReferenceDate,
      $lte: fourteenDaysOut,
    },
  })
    .populate("categoryId", "name defaultTarget")
    .sort({ followUpDate: 1 })
    .lean();

  // 3. Stats calculation
  const completedCount = await Application.countDocuments({
    userEmail,
    followUpCompleted: true,
  });

  return {
    due: JSON.parse(JSON.stringify(dueApps)),
    upcoming: JSON.parse(JSON.stringify(upcomingApps)),
    stats: {
      dueCount: dueApps.length,
      upcomingCount: upcomingApps.length,
      completedCount,
    },
  };
}

/**
 * Executes a follow-up action: complete, reschedule, or dismiss.
 */
export async function executeFollowUpAction(
  applicationId: string,
  userEmail: string,
  action: "complete" | "reschedule" | "dismiss",
  options: {
    rescheduleDate?: Date | string;
    note?: string;
    clientDate?: string;
  } = {}
): Promise<IApplication | null> {
  await connectDB();

  const app = await Application.findOne({ _id: applicationId, userEmail });
  if (!app) return null;

  switch (action) {
    case "complete": {
      app.followUpCompleted = true;
      app.followUpDismissed = false;
      if (app.status === "Follow-up Needed") {
        app.status = "Applied";
      }
      await app.save();

      await logTimelineEvent(
        applicationId,
        EVENT_TYPES.FOLLOW_UP_COMPLETED,
        options.note || "Follow-up marked as completed",
        { completedAt: new Date(), clientDate: options.clientDate }
      );
      break;
    }

    case "reschedule": {
      if (!options.rescheduleDate) {
        throw new Error("rescheduleDate is required for reschedule action");
      }
      const newDate = new Date(options.rescheduleDate);
      app.followUpDate = newDate;
      app.followUpCompleted = false;
      app.followUpDismissed = false;
      await app.save();

      await logTimelineEvent(
        applicationId,
        EVENT_TYPES.FOLLOW_UP_SCHEDULED,
        options.note || `Follow-up rescheduled to ${newDate.toLocaleDateString()}`,
        { newDate }
      );
      break;
    }

    case "dismiss": {
      app.followUpDismissed = true;
      await app.save();

      await logTimelineEvent(
        applicationId,
        EVENT_TYPES.FOLLOW_UP_DISMISSED,
        options.note || "Follow-up reminder dismissed by user"
      );
      break;
    }
  }

  return JSON.parse(JSON.stringify(app));
}

export async function completeFollowUp(applicationId: string, userEmail: string, note?: string) {
  return executeFollowUpAction(applicationId, userEmail, "complete", { note });
}

export async function postponeFollowUp(applicationId: string, userEmail: string, days: number = 3, clientDate?: string) {
  const reference = clientDate ? new Date(clientDate) : new Date();
  const rescheduleDate = addDays(reference, days);
  return executeFollowUpAction(applicationId, userEmail, "reschedule", {
    rescheduleDate,
    clientDate,
    note: `Follow-up postponed by ${days} days`,
  });
}

export async function dismissFollowUp(applicationId: string, userEmail: string) {
  return executeFollowUpAction(applicationId, userEmail, "dismiss");
}

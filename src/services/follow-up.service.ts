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
 * calculated strictly relative to client date.
 */
export async function getFollowUpOverview(clientDateStr?: string): Promise<IFollowUpOverview> {
  await connectDB();

  // Auto-heal any legacy out-of-sync records: completed follow-ups still marked "Follow-up Needed"
  await Application.updateMany(
    { followUpCompleted: true, status: "Follow-up Needed" },
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
  const futureLimit = addDays(clientReferenceDate, 14);
  const upcomingApps = await Application.find({
    status: { $nin: nonFollowUpStatuses },
    followUpCompleted: { $ne: true },
    followUpDismissed: { $ne: true },
    followUpDate: {
      $gt: clientReferenceDate,
      $lte: futureLimit,
    },
  })
    .populate("categoryId", "name defaultTarget")
    .sort({ followUpDate: 1 })
    .lean();

  // 3. Total completed follow-ups count
  const completedCount = await Application.countDocuments({
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
 * Marks follow-up as completed and logs to application timeline.
 */
export async function completeFollowUp(id: string): Promise<IApplication | null> {
  await connectDB();

  const application = await Application.findById(id);
  if (!application) return null;

  application.followUpCompleted = true;

  // Revert temporary "Follow-up Needed" status back to "Applied"
  if (application.status === "Follow-up Needed") {
    application.status = "Applied";
    await logTimelineEvent(
      id,
      EVENT_TYPES.STATUS_CHANGED,
      'Status updated from "Follow-up Needed" to "Applied"'
    );
  }

  await application.save();

  await logTimelineEvent(id, EVENT_TYPES.FOLLOW_UP_COMPLETED, "Follow-up marked as completed");

  return JSON.parse(JSON.stringify(application));
}

/**
 * Postpones follow-up date by N days (in client time) and logs to timeline.
 */
export async function postponeFollowUp(
  id: string,
  days: number = 3,
  clientDateStr?: string
): Promise<IApplication | null> {
  await connectDB();

  const application = await Application.findById(id);
  if (!application) return null;

  // Base date is either client today or existing followUpDate, whichever is later
  let baseDate = new Date();
  if (clientDateStr && /^\d{4}-\d{2}-\d{2}$/.test(clientDateStr)) {
    const [y, m, d] = clientDateStr.split("-").map(Number);
    baseDate = new Date(y, m - 1, d);
  }

  const newFollowUpDate = addDays(baseDate, days);

  application.followUpDate = newFollowUpDate;
  application.followUpCompleted = false;
  application.followUpDismissed = false;

  // Revert "Follow-up Needed" back to "Applied" as follow-up is deferred to the future date
  if (application.status === "Follow-up Needed") {
    application.status = "Applied";
    await logTimelineEvent(
      id,
      EVENT_TYPES.STATUS_CHANGED,
      'Status updated from "Follow-up Needed" to "Applied"'
    );
  }

  await application.save();

  const formattedDate = newFollowUpDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  await logTimelineEvent(
    id,
    EVENT_TYPES.FOLLOW_UP_POSTPONED,
    `Follow-up postponed by ${days} day${days > 1 ? "s" : ""} (scheduled for ${formattedDate})`
  );

  return JSON.parse(JSON.stringify(application));
}

/**
 * Dismisses follow-up reminder for an application without affecting status.
 */
export async function dismissFollowUp(id: string): Promise<IApplication | null> {
  await connectDB();

  const application = await Application.findById(id);
  if (!application) return null;

  application.followUpDismissed = true;

  // Revert "Follow-up Needed" back to "Applied" as reminder is dismissed
  if (application.status === "Follow-up Needed") {
    application.status = "Applied";
    await logTimelineEvent(
      id,
      EVENT_TYPES.STATUS_CHANGED,
      'Status updated from "Follow-up Needed" to "Applied"'
    );
  }

  await application.save();

  await logTimelineEvent(id, EVENT_TYPES.FOLLOW_UP_DISMISSED, "Follow-up reminder dismissed");

  return JSON.parse(JSON.stringify(application));
}

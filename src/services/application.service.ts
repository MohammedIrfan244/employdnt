import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/application.model";
import { Category } from "@/models/category.model";
import { addDays, getClientDateString } from "@/lib/date-utils";
import { DEFAULT_FOLLOW_UP_DAYS, EVENT_TYPES } from "@/lib/constants";
import { IApplication } from "@/types/application";
import { incrementCategoryLifetime } from "./category.service";
import { incrementCategoryDailyProgress } from "./progress.service";
import { logTimelineEvent } from "./timeline.service";

export interface CreateApplicationDTO {
  company: string;
  role: string;
  categoryId: string;
  jobUrl?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  contactDetails?: string;
  salary?: string;
  jobDescription?: string;
  notes?: string;
  resumeUsed?: string;
  clientDate?: string; // YYYY-MM-DD from client local time
}

export interface ApplicationFilterDTO {
  categoryId?: string;
  status?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

/**
 * Creates an application with Module 2.2 Automatic Initialization.
 */
export async function createApplication(
  dto: CreateApplicationDTO,
  userEmail: string
): Promise<IApplication> {
  await connectDB();

  const category = await Category.findOne({ _id: dto.categoryId, userEmail });
  if (!category) {
    throw new Error("Category not found");
  }

  const now = new Date();
  const followUpDate = addDays(now, DEFAULT_FOLLOW_UP_DAYS);
  const clientDateString = dto.clientDate || getClientDateString(now);

  // 1. Create the application record
  const newApp = await Application.create({
    userEmail,
    company: dto.company.trim(),
    role: dto.role.trim(),
    categoryId: dto.categoryId,
    status: "Applied",
    appliedDate: now,
    followUpDate,
    followUpCompleted: false,
    followUpDismissed: false,
    jobUrl: dto.jobUrl?.trim(),
    recruiterName: dto.recruiterName?.trim(),
    recruiterEmail: dto.recruiterEmail?.trim(),
    contactDetails: dto.contactDetails?.trim(),
    salary: dto.salary?.trim(),
    jobDescription: dto.jobDescription?.trim(),
    notes: dto.notes?.trim(),
    resumeUsed: dto.resumeUsed?.trim(),
  });

  const appId = newApp._id.toString();

  // 2. Increment category lifetime count
  await incrementCategoryLifetime(dto.categoryId, 1);

  // 3. Update category daily progress for client's current date
  await incrementCategoryDailyProgress(
    dto.categoryId,
    clientDateString,
    userEmail,
    category.defaultTarget
  );

  // 4. Log creation and follow-up events in the application timeline
  await logTimelineEvent(
    appId,
    EVENT_TYPES.APPLICATION_CREATED,
    `Application recorded for ${dto.role.trim()} at ${dto.company.trim()}`
  );
  await logTimelineEvent(
    appId,
    EVENT_TYPES.FOLLOW_UP_SCHEDULED,
    `Follow-up reminder automatically scheduled for 7 days after application`
  );

  return JSON.parse(JSON.stringify(newApp));
}

/**
 * Retrieves applications with optional filtering and pagination.
 */
export async function getApplications(
  userEmail: string,
  filters: ApplicationFilterDTO = {}
) {
  await connectDB();

  // Auto-migrate legacy records without userEmail to the active user
  await Application.updateMany(
    { userEmail: { $exists: false } },
    { $set: { userEmail } }
  );

  // Auto-heal any legacy records where followUpCompleted: true but status remains "Follow-up Needed"
  await Application.updateMany(
    { userEmail, followUpCompleted: true, status: "Follow-up Needed" },
    { $set: { status: "Applied" } }
  );

  const query: Record<string, unknown> = { userEmail };

  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [{ company: searchRegex }, { role: searchRegex }];
  }

  const limit = filters.limit || 50;
  const skip = filters.skip || 0;

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate("categoryId", "name")
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(query),
  ]);

  return {
    applications: JSON.parse(JSON.stringify(applications)),
    total,
    limit,
    skip,
  };
}

/**
 * Retrieves the most recent applications for the user.
 */
export async function getRecentApplications(
  userEmail: string,
  limit: number = 5
): Promise<IApplication[]> {
  await connectDB();
  const recent = await Application.find({ userEmail })
    .populate("categoryId", "name")
    .sort({ appliedDate: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(recent));
}

/**
 * Retrieves a single application by ID with category information.
 */
export async function getApplicationById(
  id: string,
  userEmail: string
): Promise<IApplication | null> {
  await connectDB();
  const app = await Application.findOne({ _id: id, userEmail }).populate(
    "categoryId",
    "name defaultTarget"
  );
  if (!app) return null;

  // Auto-heal legacy out-of-sync state: followUpCompleted: true while status: "Follow-up Needed"
  if (app.followUpCompleted && app.status === "Follow-up Needed") {
    app.status = "Applied";
    await app.save();
  }

  return JSON.parse(JSON.stringify(app));
}

/**
 * Updates an application and records status changes in the timeline.
 */
export async function updateApplication(
  id: string,
  updates: Partial<IApplication>,
  userEmail?: string
): Promise<IApplication | null> {
  await connectDB();

  const query = userEmail ? { _id: id, userEmail } : { _id: id };
  const existing = await Application.findOne(query);
  if (!existing) return null;

  const oldStatus = existing.status;
  const newStatus = updates.status;

  // Synchronize status changes with follow-up flags
  if (newStatus && newStatus !== oldStatus) {
    if (newStatus === "Follow-up Needed") {
      // User explicitly set status to Follow-up Needed:
      // Reactivate follow-up so it appears in the queue as due immediately
      updates.followUpCompleted = false;
      updates.followUpDismissed = false;
      updates.followUpDate = new Date();
    } else if (oldStatus === "Follow-up Needed") {
      // Moving away from Follow-up Needed marks the follow-up as resolved
      updates.followUpCompleted = true;
    } else if (["Offer", "Rejected", "Withdrawn"].includes(newStatus)) {
      // Terminal statuses disable follow-up reminders
      updates.followUpDismissed = true;
    }
  }

  const updated = await Application.findOneAndUpdate(
    query,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (newStatus && newStatus !== oldStatus) {
    await logTimelineEvent(
      id,
      EVENT_TYPES.STATUS_CHANGED,
      `Status updated from ${oldStatus} to ${newStatus}`,
      { from: oldStatus, to: newStatus }
    );
  }

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Deletes an application.
 */
export async function deleteApplication(
  id: string,
  userEmail: string
): Promise<boolean> {
  await connectDB();
  const res = await Application.deleteOne({ _id: id, userEmail });
  return res.deletedCount > 0;
}

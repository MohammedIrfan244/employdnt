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
export async function createApplication(dto: CreateApplicationDTO): Promise<IApplication> {
  await connectDB();

  const category = await Category.findById(dto.categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  const now = new Date();
  const followUpDate = addDays(now, DEFAULT_FOLLOW_UP_DAYS);
  const clientDateString = dto.clientDate || getClientDateString(now);

  // 1. Create the application record
  const newApp = await Application.create({
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
export async function getApplications(filters: ApplicationFilterDTO = {}) {
  await connectDB();

  const query: Record<string, unknown> = {};

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
 * Retrieves a single application by ID with category information.
 */
export async function getApplicationById(id: string): Promise<IApplication | null> {
  await connectDB();
  const app = await Application.findById(id).populate("categoryId", "name defaultTarget").lean();
  return app ? JSON.parse(JSON.stringify(app)) : null;
}

/**
 * Updates an application and records status changes in the timeline.
 */
export async function updateApplication(
  id: string,
  updates: Partial<IApplication>
): Promise<IApplication | null> {
  await connectDB();

  const existing = await Application.findById(id);
  if (!existing) return null;

  const oldStatus = existing.status;
  const newStatus = updates.status;

  const updated = await Application.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (newStatus && newStatus !== oldStatus) {
    await logTimelineEvent(
      id,
      EVENT_TYPES.STATUS_CHANGED,
      `Status updated from "${oldStatus}" to "${newStatus}"`
    );
  }

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Deletes an application (does not affect lifetime totals or categories).
 */
export async function deleteApplication(id: string): Promise<boolean> {
  await connectDB();
  const result = await Application.findByIdAndDelete(id);
  return !!result;
}

/**
 * Gets recent applications for the dashboard feed (Module 1.5).
 */
export async function getRecentApplications(limit: number = 5): Promise<IApplication[]> {
  await connectDB();
  const recent = await Application.find()
    .populate("categoryId", "name")
    .sort({ appliedDate: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(recent));
}

/**
 * Gets applications requiring attention (follow-up due or status is Follow-up Needed) (Module 1.4).
 */
export async function getNeedsAttentionApplications(): Promise<IApplication[]> {
  await connectDB();
  const now = new Date();

  const applications = await Application.find({
    $or: [
      { status: "Follow-up Needed" },
      {
        followUpDate: { $lte: now },
        followUpCompleted: false,
        followUpDismissed: false,
        status: "Applied",
      },
    ],
  })
    .populate("categoryId", "name")
    .sort({ followUpDate: 1 })
    .lean();

  return JSON.parse(JSON.stringify(applications));
}


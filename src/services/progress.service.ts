import { connectDB } from "@/lib/mongodb";
import { DailyProgress } from "@/models/daily-progress.model";
import { Category } from "@/models/category.model";
import { DEFAULT_GOAL_MILESTONES, DEFAULT_INITIAL_TARGET } from "@/lib/constants";
import { IDailyProgress } from "@/types/daily-progress";
import { ICategory } from "@/types/category";

/**
 * Calculates the appropriate milestone target based on the current application count.
 * Follows Module 1.2: 10 -> 15 -> 20 -> 30 -> 40 -> 50 (+10 increments thereafter).
 */
export function calculateNextMilestone(
  count: number,
  initialTarget: number = DEFAULT_INITIAL_TARGET
): { currentMilestone: number; isCompleted: boolean } {
  const milestones: readonly number[] = DEFAULT_GOAL_MILESTONES;

  // Find the smallest milestone in the sequence that is strictly greater than count
  let target = milestones.find((m) => m > count);

  if (!target) {
    // If user exceeds highest predefined milestone (50), scale progressively by 10
    const maxMilestone = milestones[milestones.length - 1];
    const stepsAbove = Math.floor((count - maxMilestone) / 10) + 1;
    target = maxMilestone + stepsAbove * 10;
  }

  // Completed is true if user has met or exceeded their initial daily target
  const isCompleted = count >= initialTarget;

  return {
    currentMilestone: target,
    isCompleted,
  };
}

/**
 * Gets or initializes the daily progress record for a specific category on a client's date (YYYY-MM-DD).
 */
export async function getCategoryDailyProgress(
  categoryId: string,
  clientDate: string,
  userEmail: string,
  defaultTarget: number = DEFAULT_INITIAL_TARGET
): Promise<IDailyProgress> {
  await connectDB();

  // Auto-migrate legacy progress records without userEmail to the active user
  await DailyProgress.updateMany(
    { userEmail: { $exists: false } },
    { $set: { userEmail } }
  );

  const progress = await DailyProgress.findOne({
    userEmail,
    categoryId,
    date: clientDate,
  }).lean();

  if (!progress) {
    const { currentMilestone, isCompleted } = calculateNextMilestone(0, defaultTarget);
    const created = await DailyProgress.create({
      userEmail,
      categoryId,
      date: clientDate,
      count: 0,
      currentMilestone,
      isCompleted,
    });
    return JSON.parse(JSON.stringify(created));
  }

  return JSON.parse(JSON.stringify(progress));
}

/**
 * Increments the daily application count for a category on a client date.
 */
export async function incrementCategoryDailyProgress(
  categoryId: string,
  clientDate: string,
  userEmail: string,
  defaultTarget: number = DEFAULT_INITIAL_TARGET
): Promise<IDailyProgress> {
  await connectDB();

  const progress = await getCategoryDailyProgress(categoryId, clientDate, userEmail, defaultTarget);
  const newCount = progress.count + 1;
  const { currentMilestone, isCompleted } = calculateNextMilestone(newCount, defaultTarget);

  const updated = await DailyProgress.findOneAndUpdate(
    { userEmail, categoryId, date: clientDate },
    {
      $set: {
        count: newCount,
        currentMilestone,
        isCompleted,
      },
    },
    { new: true, upsert: true }
  ).lean();

  return JSON.parse(JSON.stringify(updated));
}

/**
 * Retrieves the full progress overview for all active categories on a given client date.
 */
export async function getTodayProgressOverview(
  clientDate: string,
  userEmail: string
): Promise<{
  categories: Array<{
    category: ICategory;
    progress: IDailyProgress;
  }>;
  totalToday: number;
}> {
  await connectDB();

  const activeCategories = await Category.find({ userEmail, isArchived: false })
    .sort({ createdAt: 1 })
    .lean();

  let totalToday = 0;
  const categoriesProgress = await Promise.all(
    activeCategories.map(async (category) => {
      const progress = await getCategoryDailyProgress(
        category._id.toString(),
        clientDate,
        userEmail,
        category.defaultTarget
      );
      totalToday += progress.count;
      return {
        category: JSON.parse(JSON.stringify(category)),
        progress,
      };
    })
  );

  return {
    categories: categoriesProgress,
    totalToday,
  };
}

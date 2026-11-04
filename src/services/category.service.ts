import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/category.model";
import { DEFAULT_CATEGORIES, DEFAULT_INITIAL_TARGET } from "@/lib/constants";
import { ICategory } from "@/types/category";

/**
 * Ensures default categories exist for the specific user upon initial query.
 */
export async function ensureDefaultCategories(userEmail: string): Promise<void> {
  await connectDB();

  // Auto-migrate legacy categories without userEmail to the active user
  await Category.updateMany(
    { userEmail: { $exists: false } },
    { $set: { userEmail } }
  );

  const count = await Category.countDocuments({ userEmail });
  if (count === 0) {
    const defaults = DEFAULT_CATEGORIES.map((cat) => ({
      userEmail,
      name: cat.name,
      defaultTarget: cat.defaultTarget || DEFAULT_INITIAL_TARGET,
      lifetimeCount: 0,
      isArchived: false,
    }));
    await Category.insertMany(defaults);
  }
}

/**
 * Retrieves all active (non-archived) categories for the user.
 */
export async function getActiveCategories(userEmail: string): Promise<ICategory[]> {
  await connectDB();
  await ensureDefaultCategories(userEmail);
  const categories = await Category.find({ userEmail, isArchived: false })
    .sort({ createdAt: 1 })
    .lean();
  return JSON.parse(JSON.stringify(categories));
}

/**
 * Retrieves all categories for the user, including archived.
 */
export async function getAllCategories(userEmail: string): Promise<ICategory[]> {
  await connectDB();
  await ensureDefaultCategories(userEmail);
  const categories = await Category.find({ userEmail })
    .sort({ createdAt: 1 })
    .lean();
  return JSON.parse(JSON.stringify(categories));
}

/**
 * Retrieves a single category by ID, scoped to user.
 */
export async function getCategoryById(id: string, userEmail: string): Promise<ICategory | null> {
  await connectDB();
  const category = await Category.findOne({ _id: id, userEmail }).lean();
  return category ? JSON.parse(JSON.stringify(category)) : null;
}

/**
 * Creates a new category scoped to user.
 */
export async function createCategory(
  userEmail: string,
  data: { name: string; defaultTarget?: number }
): Promise<ICategory> {
  await connectDB();
  const newCategory = await Category.create({
    userEmail,
    name: data.name.trim(),
    defaultTarget: data.defaultTarget || DEFAULT_INITIAL_TARGET,
    lifetimeCount: 0,
    isArchived: false,
  });
  return JSON.parse(JSON.stringify(newCategory));
}

/**
 * Updates a category's name, target, or archive status.
 */
export async function updateCategory(
  id: string,
  userEmail: string,
  update: Partial<Pick<ICategory, "name" | "defaultTarget" | "isArchived">>
): Promise<ICategory | null> {
  await connectDB();
  const updated = await Category.findOneAndUpdate(
    { _id: id, userEmail },
    { $set: update },
    { new: true, runValidators: true }
  ).lean();
  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Increments the lifetime application count for a category.
 */
export async function incrementCategoryLifetime(
  id: string,
  amount: number = 1
): Promise<void> {
  await connectDB();
  await Category.findByIdAndUpdate(id, { $inc: { lifetimeCount: amount } });
}

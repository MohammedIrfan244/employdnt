import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/category.model";
import { DEFAULT_CATEGORIES, DEFAULT_INITIAL_TARGET } from "@/lib/constants";
import { ICategory } from "@/types/category";

/**
 * Ensures default categories exist in the database upon startup/initial query.
 */
export async function ensureDefaultCategories(): Promise<void> {
  await connectDB();
  const count = await Category.countDocuments();
  if (count === 0) {
    const defaults = DEFAULT_CATEGORIES.map((cat) => ({
      name: cat.name,
      defaultTarget: cat.defaultTarget || DEFAULT_INITIAL_TARGET,
      lifetimeCount: 0,
      isArchived: false,
    }));
    await Category.insertMany(defaults);
  } else {
    // Clean up legacy Freelance category if it has no applications
    await Category.deleteOne({ name: "Freelance", lifetimeCount: 0 });
  }
}

/**
 * Retrieves all active (non-archived) categories.
 */
export async function getActiveCategories(): Promise<ICategory[]> {
  await connectDB();
  await ensureDefaultCategories();
  const categories = await Category.find({ isArchived: false }).sort({ createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

/**
 * Retrieves all categories, including archived.
 */
export async function getAllCategories(): Promise<ICategory[]> {
  await connectDB();
  await ensureDefaultCategories();
  const categories = await Category.find().sort({ createdAt: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

/**
 * Retrieves a single category by ID.
 */
export async function getCategoryById(id: string): Promise<ICategory | null> {
  await connectDB();
  const category = await Category.findById(id).lean();
  return category ? JSON.parse(JSON.stringify(category)) : null;
}

/**
 * Creates a new category.
 */
export async function createCategory(data: { name: string; defaultTarget?: number }): Promise<ICategory> {
  await connectDB();
  const newCategory = await Category.create({
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
  update: Partial<Pick<ICategory, "name" | "defaultTarget" | "isArchived">>
): Promise<ICategory | null> {
  await connectDB();
  const updated = await Category.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Increments the lifetime application count for a category.
 */
export async function incrementCategoryLifetime(id: string, amount: number = 1): Promise<void> {
  await connectDB();
  await Category.findByIdAndUpdate(id, { $inc: { lifetimeCount: amount } });
}


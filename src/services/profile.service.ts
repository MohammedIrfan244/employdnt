import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user.model";
import { IUser } from "@/types/user";

export async function getUserProfile(userEmail: string): Promise<IUser | null> {
  await connectDB();
  const user = await User.findOne({ email: userEmail }).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function updateUserProfile(
  userEmail: string,
  data: Partial<IUser>
): Promise<IUser | null> {
  await connectDB();
  const allowedUpdates: Partial<IUser> = {
    name: data.name?.trim(),
    headline: data.headline?.trim(),
    phone: data.phone?.trim(),
    location: data.location?.trim(),
    bio: data.bio?.trim(),
    skills: Array.isArray(data.skills) ? data.skills.map((s) => s.trim()).filter(Boolean) : undefined,
    portfolioUrl: data.portfolioUrl?.trim(),
    githubUrl: data.githubUrl?.trim(),
    linkedinUrl: data.linkedinUrl?.trim(),
    workArrangement: data.workArrangement,
    targetRoles: Array.isArray(data.targetRoles) ? data.targetRoles.map((r) => r.trim()).filter(Boolean) : undefined,
  };

  // Remove undefined fields
  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key as keyof IUser] === undefined) {
      delete allowedUpdates[key as keyof IUser];
    }
  });

  const updated = await User.findOneAndUpdate(
    { email: userEmail },
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).lean();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}


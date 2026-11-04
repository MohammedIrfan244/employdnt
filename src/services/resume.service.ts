import { connectDB } from "@/lib/mongodb";
import { Resume } from "@/models/resume.model";
import { IResume } from "@/types/resume";

export async function getUserResumes(userEmail: string): Promise<IResume[]> {
  await connectDB();
  const resumes = await Resume.find({ userEmail })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(resumes));
}

export async function createResume(
  userEmail: string,
  data: {
    name: string;
    fileName: string;
    fileUrl: string;
    fileSize?: string;
    category?: string;
    isDefault?: boolean;
    notes?: string;
  }
): Promise<IResume> {
  await connectDB();

  // If this resume is set as default, unset other default resumes for this user
  if (data.isDefault) {
    await Resume.updateMany({ userEmail }, { $set: { isDefault: false } });
  }

  // If this is the user's first resume, automatically make it default
  const count = await Resume.countDocuments({ userEmail });
  const isDefault = data.isDefault || count === 0;

  const created = await Resume.create({
    userEmail,
    name: data.name.trim(),
    fileName: data.fileName.trim(),
    fileUrl: data.fileUrl.trim(),
    fileSize: data.fileSize?.trim(),
    category: data.category?.trim(),
    isDefault,
    notes: data.notes?.trim(),
  });

  return JSON.parse(JSON.stringify(created));
}

export async function updateResume(
  id: string,
  userEmail: string,
  data: Partial<IResume>
): Promise<IResume | null> {
  await connectDB();

  if (data.isDefault) {
    await Resume.updateMany({ userEmail, _id: { $ne: id } }, { $set: { isDefault: false } });
  }

  const updated = await Resume.findOneAndUpdate(
    { _id: id, userEmail },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

export async function deleteResume(id: string, userEmail: string): Promise<boolean> {
  await connectDB();
  const res = await Resume.deleteOne({ _id: id, userEmail });
  return res.deletedCount > 0;
}

export async function setDefaultResume(id: string, userEmail: string): Promise<IResume | null> {
  await connectDB();
  await Resume.updateMany({ userEmail }, { $set: { isDefault: false } });
  const updated = await Resume.findOneAndUpdate(
    { _id: id, userEmail },
    { $set: { isDefault: true } },
    { new: true }
  ).lean();
  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}


import { connectDB } from "@/lib/mongodb";
import { Resource } from "@/models/resource.model";
import { IResource, ResourceCategory } from "@/types/resource";

const STARTER_RESOURCES: Array<{
  title: string;
  url: string;
  category: ResourceCategory;
  description: string;
  tags: string[];
  isPinned: boolean;
}> = [
  {
    title: "LinkedIn Jobs",
    url: "https://www.linkedin.com/jobs",
    category: "Job Boards",
    description: "Primary professional network and direct company postings.",
    tags: ["network", "direct-apply"],
    isPinned: true,
  },
  {
    title: "Wellfound (AngelList)",
    url: "https://wellfound.com/jobs",
    category: "Job Boards",
    description: "Startup-focused roles with transparent equity and direct founder contacts.",
    tags: ["startups", "tech"],
    isPinned: true,
  },
  {
    title: "Levels.fyi",
    url: "https://www.levels.fyi",
    category: "Other",
    description: "Verified salary benchmarks, compensation negotiation data, and level mappings.",
    tags: ["salary", "negotiation"],
    isPinned: false,
  },
  {
    title: "LeetCode Prep",
    url: "https://leetcode.com/problemset",
    category: "Interview Prep",
    description: "Core algorithms and technical coding interview challenges.",
    tags: ["coding", "algorithms"],
    isPinned: false,
  },
  {
    title: "Tech Interview Handbook",
    url: "https://www.techinterviewhandbook.org",
    category: "Interview Prep",
    description: "Curated guides for behavioral, system design, and coding rounds.",
    tags: ["guides", "behavioral"],
    isPinned: false,
  },
];

export async function ensureStarterResources(userEmail: string): Promise<void> {
  await connectDB();
  const count = await Resource.countDocuments({ userEmail });
  if (count === 0) {
    const seeded = STARTER_RESOURCES.map((r) => ({ ...r, userEmail }));
    await Resource.insertMany(seeded);
  }
}

export async function getResources(
  userEmail: string,
  category?: string
): Promise<IResource[]> {
  await connectDB();
  await ensureStarterResources(userEmail);

  const query: Record<string, unknown> = { userEmail };
  if (category && category !== "All") {
    query.category = category;
  }

  const resources = await Resource.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(resources));
}

export async function createResource(
  userEmail: string,
  data: {
    title: string;
    url: string;
    category: ResourceCategory;
    description?: string;
    tags?: string[];
    isPinned?: boolean;
  }
): Promise<IResource> {
  await connectDB();

  let formattedUrl = data.url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const created = await Resource.create({
    userEmail,
    title: data.title.trim(),
    url: formattedUrl,
    category: data.category,
    description: data.description?.trim(),
    tags: Array.isArray(data.tags) ? data.tags.map((t) => t.trim()).filter(Boolean) : [],
    isPinned: Boolean(data.isPinned),
  });

  return JSON.parse(JSON.stringify(created));
}

export async function updateResource(
  id: string,
  userEmail: string,
  data: Partial<IResource>
): Promise<IResource | null> {
  await connectDB();

  if (data.url) {
    let formattedUrl = data.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    data.url = formattedUrl;
  }

  const updated = await Resource.findOneAndUpdate(
    { _id: id, userEmail },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

export async function deleteResource(id: string, userEmail: string): Promise<boolean> {
  await connectDB();
  const res = await Resource.deleteOne({ _id: id, userEmail });
  return res.deletedCount > 0;
}


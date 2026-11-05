import { connectDB } from "@/lib/mongodb";
import { FreelanceResource } from "@/models/freelance-resource.model";
import {
  IFreelanceResource,
  FreelanceResourceCategory,
} from "@/types/freelance-resource";

const STARTER_FREELANCE_RESOURCES: Array<
  Omit<IFreelanceResource, "_id" | "userEmail">
> = [
  {
    title: "Client Project Requirement Intake Form",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSc-sample-intake-form/viewform",
    category: "Requirement Form",
    description:
      "Reusable Google Forms template collecting business info, target users, feature specs, budget, and timeline.",
    isPinned: true,
    isSystem: true,
  },
  {
    title: "Standard Freelance Service Agreement (Contract)",
    url: "https://docs.google.com/document/d/sample-freelance-contract/edit",
    category: "Contract & Legal",
    description:
      "Clean, client-friendly contract covering IP ownership, payment milestones, revision clauses, and termination terms.",
    isPinned: true,
    isSystem: true,
  },
  {
    title: "Statement of Work (SOW) & Project Scope Template",
    url: "https://docs.google.com/document/d/sample-sow-template/edit",
    category: "Scope & SOW",
    description:
      "Defines project deliverables, functional requirements, out-of-scope boundaries, and sign-off criteria.",
    isPinned: true,
    isSystem: true,
  },
  {
    title: "Project Handover & Production Deployment Checklist",
    url: "https://docs.google.com/document/d/sample-handover-checklist/edit",
    category: "Checklist",
    description:
      "Step-by-step checklist for DNS transfer, environmental variables, credentials vault, and client sign-off.",
    isPinned: false,
    isSystem: true,
  },
];

export async function ensureStarterFreelanceResources(
  userEmail: string
): Promise<void> {
  await connectDB();
  const email = userEmail.toLowerCase().trim();
  const count = await FreelanceResource.countDocuments({
    $or: [{ userEmail: email }, { isSystem: true }],
  });

  if (count === 0) {
    const seeded = STARTER_FREELANCE_RESOURCES.map((r) => ({
      ...r,
      userEmail: email,
    }));
    await FreelanceResource.insertMany(seeded);
  }
}

export async function getFreelanceResources(
  userEmail: string,
  category?: string
): Promise<IFreelanceResource[]> {
  await connectDB();
  const email = userEmail.toLowerCase().trim();
  await ensureStarterFreelanceResources(email);

  const query: Record<string, unknown> = {
    $or: [{ userEmail: email }, { isSystem: true }],
  };

  if (category && category !== "All") {
    query.category = category;
  }

  const resources = await FreelanceResource.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(resources));
}

export async function createFreelanceResource(
  userEmail: string,
  data: {
    title: string;
    url: string;
    category: FreelanceResourceCategory;
    description?: string;
    isPinned?: boolean;
  }
): Promise<IFreelanceResource> {
  await connectDB();
  const email = userEmail.toLowerCase().trim();

  let formattedUrl = data.url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const created = await FreelanceResource.create({
    userEmail: email,
    title: data.title.trim(),
    url: formattedUrl,
    category: data.category,
    description: data.description?.trim(),
    isPinned: Boolean(data.isPinned),
    isSystem: false,
  });

  return JSON.parse(JSON.stringify(created));
}

export async function updateFreelanceResource(
  id: string,
  userEmail: string,
  data: Partial<IFreelanceResource>
): Promise<IFreelanceResource | null> {
  await connectDB();
  const email = userEmail.toLowerCase().trim();

  if (data.url) {
    let formattedUrl = data.url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    data.url = formattedUrl;
  }

  const updated = await FreelanceResource.findOneAndUpdate(
    { _id: id, $or: [{ userEmail: email }, { isSystem: true }] },
    { $set: data },
    { returnDocument: "after", runValidators: true }
  ).lean();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

export async function deleteFreelanceResource(
  id: string,
  userEmail: string
): Promise<boolean> {
  await connectDB();
  const email = userEmail.toLowerCase().trim();
  const res = await FreelanceResource.deleteOne({
    _id: id,
    userEmail: email,
    isSystem: { $ne: true }, // Protect system templates
  });
  return res.deletedCount > 0;
}


import { connectDB } from "@/lib/mongodb";
import { OutreachTemplate } from "@/models/outreach-template.model";
import { IOutreachTemplate } from "@/types/outreach";

const DEFAULT_OUTREACH_TEMPLATES: Array<Omit<IOutreachTemplate, "_id" | "userEmail">> = [
  {
    name: "Value-First Website / App Audit",
    category: "Website Audit",
    description: "Points out a tangible improvement opportunity with zero pressure.",
    subjectTemplate: "Quick question regarding {{companyName}}'s web experience",
    bodyTemplate: `Hi {{recipientName}},

I came across {{companyName}} recently and was really impressed by what you're building. While exploring, I noticed:
{{personalizedObservation}}

I specialize in {{serviceOffered}} and help companies streamline and elevate their digital product experience without bloated agency fees.

I put together a few concrete ideas on how to address this quickly. Would you be open to a 10-minute chat this week, or should I send over a short screen recording walkthrough?

Best regards,`,
    isSystem: true,
  },
  {
    name: "Direct & Concise Cold Pitch",
    category: "Cold Pitch",
    description: "Punchy, respectful 4-sentence proposal directly stating capability and value.",
    subjectTemplate: "{{serviceOffered}} support for {{companyName}}",
    bodyTemplate: `Hi {{recipientName}},

{{personalizedObservation}}

I help teams like {{companyName}} deliver {{serviceOffered}} cleanly, on-time, and without full-time hiring overhead.

Are you currently taking on freelance help or exploring contracted engineering support for the upcoming quarter?

Happy to share relevant case studies if this aligns with your current priorities.

Best,`,
    isSystem: true,
  },
  {
    name: "Scoping Stage Re-engagement",
    category: "Re-engagement",
    description: "Polite check-in when a scoping conversation has stalled.",
    subjectTemplate: "Checking in on {{companyName}} project scope",
    bodyTemplate: `Hi {{recipientName}},

Hope you've had a productive week.

Wanted to circle back on our earlier conversation regarding {{companyName}} and the {{serviceOffered}} requirements we discussed.

Are you still planning to move forward with this project, or has your timeline shifted?

No rush either way—just keeping my project calendar up to date. Let me know how you'd like to proceed!

Best,`,
    isSystem: true,
  },
];

export async function ensureStarterTemplates(userEmail: string): Promise<void> {
  await connectDB();
  const count = await OutreachTemplate.countDocuments({
    $or: [{ userEmail: userEmail.toLowerCase().trim() }, { isSystem: true }],
  });

  if (count === 0) {
    const seeded = DEFAULT_OUTREACH_TEMPLATES.map((t) => ({
      ...t,
      userEmail: userEmail.toLowerCase().trim(),
    }));
    await OutreachTemplate.insertMany(seeded);
  }
}

export async function getOutreachTemplates(
  userEmail: string
): Promise<IOutreachTemplate[]> {
  await connectDB();
  const email = userEmail.toLowerCase().trim();
  await ensureStarterTemplates(email);

  const templates = await OutreachTemplate.find({
    $or: [{ userEmail: email }, { isSystem: true }],
  })
    .sort({ isSystem: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(templates));
}

export async function createOutreachTemplate(
  userEmail: string,
  data: {
    name: string;
    category: "Cold Pitch" | "Website Audit" | "Re-engagement" | "Custom";
    subjectTemplate: string;
    bodyTemplate: string;
    description?: string;
  }
): Promise<IOutreachTemplate> {
  await connectDB();
  const email = userEmail.toLowerCase().trim();

  const created = await OutreachTemplate.create({
    userEmail: email,
    name: data.name.trim(),
    category: data.category,
    subjectTemplate: data.subjectTemplate.trim(),
    bodyTemplate: data.bodyTemplate.trim(),
    description: data.description?.trim(),
    isSystem: false,
  });

  return JSON.parse(JSON.stringify(created));
}

export async function deleteOutreachTemplate(
  id: string,
  userEmail: string
): Promise<boolean> {
  await connectDB();
  const email = userEmail.toLowerCase().trim();
  const res = await OutreachTemplate.deleteOne({
    _id: id,
    userEmail: email,
    isSystem: { $ne: true }, // Protect system templates
  });
  return res.deletedCount > 0;
}

export { compileOutreachDraft } from "@/lib/outreach-utils";


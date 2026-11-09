import { connectDB } from "@/lib/mongodb";
import { FreelanceClient } from "@/models/freelance-client.model";
import {
  IFreelanceClient,
  IFreelanceDashboardMetrics,
  LeadSource,
  IClientDuplicateMatch,
  IDuplicateCheckQuery,
} from "@/types/freelance-client";

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export interface GetClientsOptions {
  stage?: string;
  search?: string;
  archived?: boolean;
}

export async function getFreelanceClients(
  userEmail: string,
  options: GetClientsOptions = {}
): Promise<IFreelanceClient[]> {
  await connectDB();
  const email = normalizeEmail(userEmail);

  const query: Record<string, unknown> = {
    $or: [{ userEmail: email }, { userEmail }],
    isArchived: options.archived ? true : { $ne: true },
  };

  if (options.stage && options.stage !== "All") {
    query.currentStage = options.stage;
  }

  if (options.search && options.search.trim()) {
    const s = options.search.trim();
    query.$and = [
      {
        $or: [
          { companyName: { $regex: s, $options: "i" } },
          { contactName: { $regex: s, $options: "i" } },
          { location: { $regex: s, $options: "i" } },
          { leadSource: { $regex: s, $options: "i" } },
        ],
      },
    ];
  }

  const clients = await FreelanceClient.find(query)
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(clients));
}

export async function getFreelanceClientById(
  id: string,
  userEmail: string
): Promise<IFreelanceClient | null> {
  await connectDB();
  const email = normalizeEmail(userEmail);
  const client = await FreelanceClient.findOne({
    _id: id,
    $or: [{ userEmail: email }, { userEmail }],
  }).lean();

  return client ? JSON.parse(JSON.stringify(client)) : null;
}

export async function createFreelanceClient(
  userEmail: string,
  data: {
    companyName: string;
    contactName: string;
    location?: string;
    email?: string;
    mobile?: string;
    website?: string;
    leadSource: LeadSource;
    outreachDate: string;
    initialNotes?: string;
    stageDueDate?: string;
  }
): Promise<IFreelanceClient> {
  await connectDB();
  const email = normalizeEmail(userEmail);
  const now = new Date();

  const client = await FreelanceClient.create({
    userEmail: email,
    companyName: data.companyName.trim(),
    contactName: data.contactName.trim(),
    location: data.location?.trim(),
    email: data.email?.trim().toLowerCase(),
    mobile: data.mobile?.trim(),
    website: data.website?.trim(),
    leadSource: data.leadSource,
    outreachDate: data.outreachDate,
    initialNotes: data.initialNotes?.trim(),
    currentStage: "Outreached",
    stageEnteredAt: now,
    stageDueDate: data.stageDueDate?.trim(),
    isCompleted: false,
    isArchived: false,
    stageHistory: [
      {
        stage: "Outreached",
        enteredAt: now,
        notes: "Lead created and outreach initiated",
      },
    ],
  });

  return JSON.parse(JSON.stringify(client));
}

export async function updateFreelanceClient(
  id: string,
  userEmail: string,
  updates: Partial<IFreelanceClient>
): Promise<IFreelanceClient | null> {
  await connectDB();
  const email = normalizeEmail(userEmail);

  const existing = await FreelanceClient.findOne({
    _id: id,
    $or: [{ userEmail: email }, { userEmail }],
  });

  if (!existing) {
    return null;
  }

  // Handle stage transition
  if (updates.currentStage && updates.currentStage !== existing.currentStage) {
    const now = new Date();
    updates.stageEnteredAt = now;
    // Reset scoping snooze when stage changes
    updates.scopingSnoozedUntil = undefined;

    // Mark previous stage history entry completed
    const history = existing.stageHistory ? [...existing.stageHistory] : [];
    if (history.length > 0) {
      history[history.length - 1].completedAt = now;
    }
    history.push({
      stage: updates.currentStage,
      enteredAt: now,
      notes: updates.initialNotes || `Transitioned to ${updates.currentStage}`,
    });
    updates.stageHistory = history;

    // Auto mark completed if post-launch
    if (updates.currentStage === "Post-launch") {
      updates.isCompleted = true;
    }
  }

  const updated = await FreelanceClient.findOneAndUpdate(
    { _id: id, $or: [{ userEmail: email }, { userEmail }] },
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  ).lean();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

export async function snoozeScopingClient(
  id: string,
  userEmail: string,
  snoozeUntilDate: string // YYYY-MM-DD
): Promise<boolean> {
  await connectDB();
  const email = normalizeEmail(userEmail);
  const res = await FreelanceClient.updateOne(
    { _id: id, $or: [{ userEmail: email }, { userEmail }] },
    { $set: { scopingSnoozedUntil: snoozeUntilDate } }
  );
  return res.modifiedCount > 0;
}

export async function deleteFreelanceClient(
  id: string,
  userEmail: string
): Promise<boolean> {
  await connectDB();
  const email = normalizeEmail(userEmail);
  const res = await FreelanceClient.deleteOne({
    _id: id,
    $or: [{ userEmail: email }, { userEmail }],
  });
  return res.deletedCount > 0;
}

export async function getFreelanceDashboardMetrics(
  userEmail: string,
  clientToday: string
): Promise<IFreelanceDashboardMetrics> {
  await connectDB();
  const email = normalizeEmail(userEmail);
  const query = {
    $or: [{ userEmail: email }, { userEmail }],
    isArchived: { $ne: true },
  };

  const allClients = await FreelanceClient.find(query).lean();

  const totalLeads = allClients.filter(
    (c) => c.currentStage === "Outreached" || c.currentStage === "Scoping"
  ).length;

  const activeProjects = allClients.filter(
    (c) =>
      c.currentStage === "Contract" ||
      c.currentStage === "Build" ||
      c.currentStage === "Test" ||
      c.currentStage === "Launch"
  ).length;

  // Upcoming deadlines: due within next 7 days from clientToday
  const todayMs = new Date(clientToday).getTime();
  const sevenDaysLaterMs = todayMs + 7 * 24 * 60 * 60 * 1000;

  const upcomingDeadlinesCount = allClients.filter((c) => {
    if (!c.stageDueDate || c.isCompleted) return false;
    const dueMs = new Date(c.stageDueDate).getTime();
    return dueMs >= todayMs - 24 * 60 * 60 * 1000 && dueMs <= sevenDaysLaterMs;
  }).length;

  // Scoping attention: Scoping stage, entered >= 7 days ago, not snoozed
  const scopingAttentionCount = allClients.filter((c) => {
    if (c.currentStage !== "Scoping") return false;
    if (c.scopingSnoozedUntil && c.scopingSnoozedUntil >= clientToday) return false;
    const enteredMs = new Date(c.stageEnteredAt).getTime();
    const diffDays = (todayMs - enteredMs) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  }).length;

  // Count Jar: Leads reached out today
  const todayOutreachCount = allClients.filter(
    (c) => c.outreachDate === clientToday
  ).length;

  return {
    totalLeads,
    activeProjects,
    upcomingDeadlinesCount,
    scopingAttentionCount,
    todayOutreachCount,
    dailyTarget: 5,
  };
}

export async function getScopingAttentionLeads(
  userEmail: string,
  clientToday: string
): Promise<IFreelanceClient[]> {
  await connectDB();
  const email = normalizeEmail(userEmail);
  const todayMs = new Date(clientToday).getTime();

  const scopingClients = await FreelanceClient.find({
    $or: [{ userEmail: email }, { userEmail }],
    currentStage: "Scoping",
    isArchived: { $ne: true },
  }).lean();

  const attentionLeads = scopingClients.filter((c) => {
    if (c.scopingSnoozedUntil && c.scopingSnoozedUntil >= clientToday) return false;
    const enteredMs = new Date(c.stageEnteredAt).getTime();
    const diffDays = (todayMs - enteredMs) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  });

  return JSON.parse(JSON.stringify(attentionLeads));
}

function cleanDomain(url?: string): string {
  if (!url) return "";
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .trim();
}

function cleanPhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export async function checkDuplicateFreelanceClient(
  userEmail: string,
  query: IDuplicateCheckQuery
): Promise<IClientDuplicateMatch[]> {
  await connectDB();
  const email = normalizeEmail(userEmail);

  const compQuery = query.companyName?.trim().toLowerCase() || "";
  const contactQuery = query.contactName?.trim().toLowerCase() || "";
  const emailQuery = query.email?.trim().toLowerCase() || "";
  const domainQuery = cleanDomain(query.website);
  const phoneQuery = cleanPhone(query.mobile);

  if (!compQuery && !contactQuery && !emailQuery && !domainQuery && !phoneQuery) {
    return [];
  }

  const allClients = await FreelanceClient.find({
    $or: [{ userEmail: email }, { userEmail }],
    isArchived: { $ne: true },
  }).lean();

  const matches: IClientDuplicateMatch[] = [];

  for (const c of allClients) {
    const reasons: string[] = [];

    // 1. Email exact match (strongest)
    if (emailQuery && c.email) {
      if (c.email.toLowerCase().trim() === emailQuery) {
        reasons.push(`Exact email match: ${c.email}`);
      }
    }

    // 2. Company name match
    if (compQuery && c.companyName) {
      const cComp = c.companyName.toLowerCase().trim();
      if (cComp === compQuery) {
        reasons.push(`Same company name: "${c.companyName}"`);
      } else if (
        (compQuery.length >= 4 && cComp.includes(compQuery)) ||
        (cComp.length >= 4 && compQuery.includes(cComp))
      ) {
        reasons.push(`Similar company name: "${c.companyName}"`);
      }
    }

    // 3. Website domain match
    if (domainQuery && c.website) {
      const cDomain = cleanDomain(c.website);
      if (cDomain && (cDomain === domainQuery || cDomain.includes(domainQuery) || domainQuery.includes(cDomain))) {
        reasons.push(`Website domain match: ${cDomain}`);
      }
    }

    // 4. Contact person match
    if (contactQuery && c.contactName) {
      const cContact = c.contactName.toLowerCase().trim();
      if (cContact === contactQuery) {
        reasons.push(`Same contact person: "${c.contactName}"`);
      }
    }

    // 5. Phone match (if at least 7 digits)
    if (phoneQuery && phoneQuery.length >= 7 && c.mobile) {
      const cPhone = cleanPhone(c.mobile);
      if (cPhone && cPhone.includes(phoneQuery)) {
        reasons.push(`Phone number match: ${c.mobile}`);
      }
    }

    if (reasons.length > 0) {
      matches.push({
        _id: c._id.toString(),
        companyName: c.companyName,
        contactName: c.contactName,
        email: c.email,
        website: c.website,
        mobile: c.mobile,
        currentStage: c.currentStage,
        outreachDate: c.outreachDate,
        matchReasons: reasons,
      });
    }
  }

  // Sort: most match reasons first
  matches.sort((a, b) => b.matchReasons.length - a.matchReasons.length);

  return matches;
}

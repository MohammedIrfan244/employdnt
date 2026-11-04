import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user.model";
import { Application } from "@/models/application.model";
import { DetectedEmail } from "@/models/detected-email.model";
import { getValidGmailAccessToken } from "@/services/user.service";
import { updateApplication } from "@/services/application.service";
import { logTimelineEvent } from "@/services/timeline.service";
import { IDetectedEmail, EmailCategory, MatchConfidence } from "@/types/detected-email";
import { IApplication } from "@/types/application";
import { ApplicationStatus, EVENT_TYPES } from "@/lib/constants";

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessageResponse {
  id: string;
  threadId: string;
  snippet?: string;
  payload?: {
    headers?: GmailMessageHeader[];
  };
}

/**
 * Extracts display name and clean email address from a "From" header.
 * e.g. "Google Careers <careers@google.com>" -> { name: "Google Careers", email: "careers@google.com" }
 */
function parseSender(fromHeader: string): { senderName: string; senderEmail: string } {
  const match = fromHeader.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    return {
      senderName: match[1].replace(/["']/g, "").trim(),
      senderEmail: match[2].toLowerCase().trim(),
    };
  }
  return {
    senderName: fromHeader.split("@")[0].trim(),
    senderEmail: fromHeader.toLowerCase().trim(),
  };
}

/**
 * Detects marketing, promotional newsletters, job alert digests, and non-employment applications.
 */
export function isAdvertisementOrSpam(
  subject: string,
  snippet: string,
  senderEmail: string,
  senderName: string
): boolean {
  const text = `${subject} ${snippet}`.toLowerCase();
  const sender = `${senderEmail} ${senderName}`.toLowerCase();

  // 1. Promotional / marketing sales, discounts & commercial offers
  const promoKeywords = [
    "discount",
    "% off",
    "coupon",
    "special offer",
    "exclusive offer",
    "limited time offer",
    "limited-time offer",
    "sale ends",
    "black friday",
    "cyber monday",
    "cashback",
    "gift card",
    "promo code",
    "voucher",
    "pricing plan",
    "free trial",
    "upgrade your account",
    "save up to",
    "best deal",
    "shop now",
    "earn cash",
  ];
  if (promoKeywords.some((kw) => text.includes(kw))) {
    return true;
  }

  // 2. Job aggregator automated newsletters, digests & alert blasts
  const alertKeywords = [
    "job alert",
    "job alerts",
    "jobs matching your",
    "jobs for you",
    "recommended jobs",
    "jobs you may be interested in",
    "jobs you might like",
    "suggested jobs",
    "weekly job digest",
    "daily job alert",
    "top picks for you",
    "apply to these jobs",
    "companies are hiring",
    "urgent hiring for",
    "hot jobs for",
    "explore new opportunities on",
    "see jobs for",
    "new job matches",
    "based on your profile",
    "weekly alert",
  ];
  if (alertKeywords.some((kw) => text.includes(kw))) {
    return true;
  }

  // 3. Known newsletter/aggregator bot senders
  const botSenders = [
    "jobalerts-noreply@linkedin.com",
    "newsletters-noreply@linkedin.com",
    "invitations@linkedin.com",
    "alert@indeed.com",
    "alerts@indeed.com",
    "jobalerts@naukri.com",
    "info@naukri.com",
    "noreply@glassdoor.com",
    "jobs@glassdoor.com",
    "alerts@ziprecruiter.com",
    "mailer@ziprecruiter.com",
    "marketing@",
    "newsletter@",
    "promotions@",
    "noreply@medium.com",
    "digest@",
  ];
  if (botSenders.some((bot) => sender.includes(bot))) {
    return true;
  }

  // 4. Non-employment applications
  const nonJobApps = [
    "credit card application",
    "loan application",
    "mortgage application",
    "passport application",
    "visa application",
    "grant application",
    "patent application",
    "membership application",
    "rental application",
    "web application",
    "mobile application",
    "application security",
    "application performance",
    "application monitoring",
    "cloud application",
  ];
  if (nonJobApps.some((kw) => text.includes(kw))) {
    return true;
  }

  return false;
}

/**
 * Classifies recruitment email intent using domain heuristics (Module 4.2).
 */
function classifyEmail(subject: string, snippet: string): {
  category: EmailCategory;
  suggestedStatus: ApplicationStatus | null;
} {
  const text = `${subject} ${snippet}`.toLowerCase();

  // 1. Employment Offer (must be formal job/employment offer, not a promotional offer)
  if (
    text.includes("offer letter") ||
    text.includes("formal offer") ||
    text.includes("pleased to offer") ||
    text.includes("job offer") ||
    text.includes("employment offer") ||
    text.includes("offer of employment") ||
    text.includes("extend an offer") ||
    text.includes("conditional offer of employment")
  ) {
    return { category: "offer", suggestedStatus: "Offer" };
  }

  // 2. Interview Invitation
  if (
    text.includes("interview") ||
    text.includes("invitation to speak") ||
    text.includes("schedule a call") ||
    text.includes("phone screen") ||
    text.includes("screening call") ||
    text.includes("video call") ||
    text.includes("technical assessment") ||
    text.includes("coding challenge") ||
    text.includes("chat with the team") ||
    text.includes("next steps in the interview process")
  ) {
    return { category: "interview", suggestedStatus: "Interview" };
  }

  // 3. Rejection
  if (
    text.includes("unfortunately") ||
    text.includes("moving forward with other candidates") ||
    text.includes("not selected") ||
    text.includes("pursue other candidates") ||
    text.includes("not moving forward") ||
    text.includes("will not be moving forward") ||
    text.includes("decided not to proceed") ||
    text.includes("regret to inform") ||
    text.includes("other applicants whose qualifications")
  ) {
    return { category: "rejection", suggestedStatus: "Rejected" };
  }

  // 4. Application Acknowledgment
  if (
    text.includes("thank you for applying") ||
    text.includes("we have received your application") ||
    text.includes("application received") ||
    text.includes("confirming receipt of your application") ||
    text.includes("application submitted") ||
    text.includes("thanks for your interest in")
  ) {
    // Note: Module 4.5: Automated acknowledgment must not change status
    return { category: "acknowledgment", suggestedStatus: null };
  }

  // 5. Additional inquiry
  if (
    text.includes("additional information") ||
    text.includes("provide more details") ||
    text.includes("work sample") ||
    text.includes("portfolio link")
  ) {
    return { category: "inquiry", suggestedStatus: null };
  }

  return { category: "other", suggestedStatus: null };
}

/**
 * Matches detected email to an existing application (Module 4.3).
 */
function matchEmailToApplications(
  subject: string,
  snippet: string,
  senderEmail: string,
  senderName: string,
  applications: IApplication[]
): {
  matchedApp: IApplication | null;
  confidence: MatchConfidence;
  reason: string;
} {
  const combinedText = `${subject} ${snippet} ${senderName}`.toLowerCase();
  const senderDomain = senderEmail.split("@")[1]?.toLowerCase() || "";

  let bestMatch: IApplication | null = null;
  let highestConfidence: MatchConfidence = "none";
  let matchReason = "";

  for (const app of applications) {
    const compName = app.company.toLowerCase().trim();
    const roleName = app.role.toLowerCase().trim();
    const recruiter = app.recruiterEmail?.toLowerCase().trim();

    // Signal 1: Recruiter email matches
    if (recruiter && senderEmail === recruiter) {
      return {
        matchedApp: app,
        confidence: "high",
        reason: `Sender email matches contact for ${app.company}`,
      };
    }

    // Signal 2: Exact company name in text
    const companyRegex = new RegExp(`\\b${compName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const companyMatches = companyRegex.test(combinedText);

    // Signal 3: Sender domain matches company name
    const domainMatchesCompany =
      compName.length >= 3 && senderDomain.includes(compName.replace(/\s+/g, ""));

    // Signal 4: Role name mentioned
    const roleMatches = roleName.length >= 4 && combinedText.includes(roleName);

    if (companyMatches && (roleMatches || domainMatchesCompany)) {
      return {
        matchedApp: app,
        confidence: "high",
        reason: `Matched company "${app.company}" and role/domain in email`,
      };
    }

    if (companyMatches || domainMatchesCompany) {
      bestMatch = app;
      highestConfidence = "medium";
      matchReason = `Matched company name "${app.company}"`;
    }
  }

  return {
    matchedApp: bestMatch,
    confidence: highestConfidence,
    reason: matchReason || "No clear application match found",
  };
}

/**
 * Automatically purges any previously stored marketing/spam emails from pending.
 */
export async function cleanSpamDetectedEmails(userEmail: string): Promise<number> {
  await connectDB();
  const pending = await DetectedEmail.find({ userEmail, status: "pending" });
  let cleanedCount = 0;
  for (const email of pending) {
    if (
      isAdvertisementOrSpam(email.subject, email.snippet, email.senderEmail, email.senderName || "") ||
      (email.category === "other" && !email.matchedApplicationId)
    ) {
      await DetectedEmail.deleteOne({ _id: email._id });
      cleanedCount++;
    }
  }
  return cleanedCount;
}

/**
 * Scans user's Gmail inbox for recent recruitment emails.
 * Uses batch filtering and parallel metadata fetching for high performance.
 */
export async function scanUserGmail(
  userEmail: string,
  options: { maxResults?: number } = {}
): Promise<{
  success: boolean;
  scanned: number;
  newDetected: number;
  hasMore?: boolean;
  error?: string;
}> {
  await connectDB();

  // Purge any existing marketing/spam that slipped into pending previously
  await cleanSpamDetectedEmails(userEmail);

  const accessToken = await getValidGmailAccessToken(userEmail);
  if (!accessToken) {
    return { success: false, scanned: 0, newDetected: 0, error: "Gmail is not connected or token expired" };
  }

  const limit = Math.min(Math.max(options.maxResults || 50, 10), 100);

  // Targeted query to surface only genuine recruitment emails (Module 4.2)
  const query = encodeURIComponent(
    'subject:(application OR interview OR "job offer" OR "offer letter" OR "status of your application" OR "thank you for applying" OR "update on your application" OR "next steps" OR "job application") -category:promotions -category:social -subject:(newsletter OR digest OR "job alert" OR "jobs for you" OR "recommended jobs" OR discount OR "sale" OR webinar)'
  );

  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=${limit}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listRes.ok) {
      const errJson = await listRes.json().catch(() => ({}));
      return {
        success: false,
        scanned: 0,
        newDetected: 0,
        error: errJson.error?.message || "Failed to query Gmail messages",
      };
    }

    const listData = await listRes.json();
    const messages: Array<{ id: string; threadId: string }> = listData.messages || [];

    if (messages.length === 0) {
      await User.updateOne({ email: userEmail }, { $set: { gmailLastSyncedAt: new Date() } });
      return { success: true, scanned: 0, newDetected: 0, hasMore: false };
    }

    // Single query to identify already-processed emails
    const existingEmails = await DetectedEmail.find({
      userEmail,
      messageId: { $in: messages.map((m) => m.id) },
    }).select("messageId").lean();

    const existingSet = new Set(existingEmails.map((e) => e.messageId));
    const newMessages = messages.filter((m) => !existingSet.has(m.id));

    // Fetch existing active applications to match against, scoped to user
    const applications = await Application.find({
      userEmail,
      status: { $nin: ["Withdrawn"] },
    }).lean();

    let newDetectedCount = 0;

    // Fetch message metadata in concurrent chunks (5 concurrent requests)
    const BATCH_SIZE = 5;
    for (let i = 0; i < newMessages.length; i += BATCH_SIZE) {
      const chunk = newMessages.slice(i, i + BATCH_SIZE);

      await Promise.all(
        chunk.map(async (msg) => {
          try {
            const detailRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (!detailRes.ok) return;

            const detail: GmailMessageResponse = await detailRes.json();
            const headers = detail.payload?.headers || [];

            const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
            const fromHeader = headers.find((h) => h.name.toLowerCase() === "from")?.value || "";
            const dateHeader = headers.find((h) => h.name.toLowerCase() === "date")?.value;

            const receivedAt = dateHeader ? new Date(dateHeader) : new Date();
            const snippet = detail.snippet || "";
            const { senderName, senderEmail } = parseSender(fromHeader);

            // 1. Skip if identified as advertisement, commercial promo, or job alert newsletter
            if (isAdvertisementOrSpam(subject, snippet, senderEmail, senderName)) {
              return;
            }

            // 2. Classify email intent
            const { category, suggestedStatus } = classifyEmail(subject, snippet);

            // 3. Match against applications
            const { matchedApp, confidence, reason } = matchEmailToApplications(
              subject,
              snippet,
              senderEmail,
              senderName,
              JSON.parse(JSON.stringify(applications))
            );

            // 4. If category is "other" and it does NOT match any application, skip saving
            if (category === "other" && !matchedApp) {
              return;
            }

            await DetectedEmail.create({
              userEmail,
              messageId: msg.id,
              threadId: msg.threadId,
              sender: fromHeader,
              senderEmail,
              senderName,
              subject,
              snippet,
              receivedAt,
              category,
              matchedApplicationId: matchedApp?._id || null,
              matchedCompany: matchedApp?.company || undefined,
              matchedRole: matchedApp?.role || undefined,
              matchConfidence: confidence,
              matchReason: reason,
              suggestedStatus,
              status: "pending",
            });

            newDetectedCount++;
          } catch {
            // Ignore individual message failure to preserve overall sync
          }
        })
      );
    }

    await User.updateOne({ email: userEmail }, { $set: { gmailLastSyncedAt: new Date() } });

    return {
      success: true,
      scanned: messages.length,
      newDetected: newDetectedCount,
      hasMore: Boolean(listData.nextPageToken),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unexpected error scanning Gmail";
    return { success: false, scanned: 0, newDetected: 0, error: errorMsg };
  }
}

/**
 * Retrieves pending detected recruitment emails for the user.
 */
export async function getDetectedEmails(
  userEmail: string,
  options: { status?: "pending" | "confirmed" | "dismissed"; limit?: number } = {}
): Promise<IDetectedEmail[]> {
  await connectDB();

  // Clean up any spam/marketing emails that might have previously slipped into pending
  if (!options.status || options.status === "pending") {
    await cleanSpamDetectedEmails(userEmail);
  }

  const query: Record<string, unknown> = { userEmail };
  if (options.status) {
    query.status = options.status;
  }

  const emails = await DetectedEmail.find(query)
    .populate("matchedApplicationId", "company role status appliedDate")
    .sort({ receivedAt: -1 })
    .limit(options.limit || 50)
    .lean();

  return JSON.parse(JSON.stringify(emails));
}

/**
 * Confirms an email match, optionally applying the suggested status transition.
 */
export async function confirmEmailMatch(
  emailId: string,
  userEmail: string,
  options: { applySuggestedStatus?: boolean; applicationId?: string } = {}
): Promise<IDetectedEmail | null> {
  await connectDB();

  const detected = await DetectedEmail.findOne({ _id: emailId, userEmail });
  if (!detected) return null;

  const targetAppId = options.applicationId || detected.matchedApplicationId?.toString();

  detected.status = "confirmed";
  if (options.applicationId) {
    detected.matchedApplicationId = options.applicationId;
  }
  await detected.save();

  // If application is linked, record to timeline and optionally transition status
  if (targetAppId) {
    // 1. Log EMAIL_LINKED to application timeline
    await logTimelineEvent(
      targetAppId,
      EVENT_TYPES.EMAIL_LINKED,
      `Email linked: "${detected.subject}" from ${detected.senderName || detected.senderEmail}`,
      {
        messageId: detected.messageId,
        category: detected.category,
        receivedAt: detected.receivedAt,
      }
    );

    // 2. Apply suggested status transition if confirmed by user (Module 4.5)
    if (options.applySuggestedStatus && detected.suggestedStatus) {
      await updateApplication(
        targetAppId,
        {
          status: detected.suggestedStatus,
        },
        userEmail
      );
    }
  }

  return JSON.parse(JSON.stringify(detected));
}

/**
 * Dismisses a detected email notification.
 */
export async function dismissDetectedEmail(
  emailId: string,
  userEmail: string
): Promise<IDetectedEmail | null> {
  await connectDB();

  const detected = await DetectedEmail.findOneAndUpdate(
    { _id: emailId, userEmail },
    { $set: { status: "dismissed" } },
    { new: true }
  ).lean();

  return detected ? JSON.parse(JSON.stringify(detected)) : null;
}

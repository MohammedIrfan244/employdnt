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
 * Classifies recruitment email intent using domain heuristics (Module 4.2).
 */
function classifyEmail(subject: string, snippet: string): {
  category: EmailCategory;
  suggestedStatus: ApplicationStatus | null;
} {
  const text = `${subject} ${snippet}`.toLowerCase();

  // 1. Offer
  if (
    text.includes("offer letter") ||
    text.includes("formal offer") ||
    text.includes("pleased to offer") ||
    text.includes("job offer")
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
 * Scans user's Gmail inbox for recent recruitment emails.
 */
export async function scanUserGmail(userEmail: string): Promise<{
  success: boolean;
  scanned: number;
  newDetected: number;
  error?: string;
}> {
  await connectDB();

  const accessToken = await getValidGmailAccessToken(userEmail);
  if (!accessToken) {
    return { success: false, scanned: 0, newDetected: 0, error: "Gmail is not connected or token expired" };
  }

  // Targeted query to surface only recruitment emails (Module 4.2)
  const query = encodeURIComponent(
    'subject:(application OR interview OR offer OR "status of your application" OR "thank you for applying" OR "update on your application" OR "next steps" OR "job application") -category:promotions -category:social'
  );

  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=20`,
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
      return { success: true, scanned: 0, newDetected: 0 };
    }

    // Fetch existing active applications to match against
    const applications = await Application.find({
      status: { $nin: ["Withdrawn"] },
    }).lean();

    let newDetectedCount = 0;

    for (const msg of messages) {
      // Check if already processed
      const exists = await DetectedEmail.findOne({ userEmail, messageId: msg.id });
      if (exists) continue;

      // Fetch message metadata (headers + snippet)
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!detailRes.ok) continue;

      const detail: GmailMessageResponse = await detailRes.json();
      const headers = detail.payload?.headers || [];

      const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
      const fromHeader = headers.find((h) => h.name.toLowerCase() === "from")?.value || "";
      const dateHeader = headers.find((h) => h.name.toLowerCase() === "date")?.value;

      const receivedAt = dateHeader ? new Date(dateHeader) : new Date();
      const snippet = detail.snippet || "";
      const { senderName, senderEmail } = parseSender(fromHeader);

      // Classify email intent
      const { category, suggestedStatus } = classifyEmail(subject, snippet);

      // Match against applications
      const { matchedApp, confidence, reason } = matchEmailToApplications(
        subject,
        snippet,
        senderEmail,
        senderName,
        JSON.parse(JSON.stringify(applications))
      );

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
    }

    await User.updateOne({ email: userEmail }, { $set: { gmailLastSyncedAt: new Date() } });

    return {
      success: true,
      scanned: messages.length,
      newDetected: newDetectedCount,
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

  const query: Record<string, unknown> = { userEmail };
  if (options.status) {
    query.status = options.status;
  }

  const emails = await DetectedEmail.find(query)
    .populate("matchedApplicationId", "company role status appliedDate")
    .sort({ receivedAt: -1 })
    .limit(options.limit || 20)
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
      await updateApplication(targetAppId, {
        status: detected.suggestedStatus,
      });
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

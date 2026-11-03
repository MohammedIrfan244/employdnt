import { Types } from "mongoose";
import { ApplicationStatus } from "@/lib/constants";
import { IApplication } from "@/types/application";

export type EmailCategory =
  | "interview"
  | "rejection"
  | "acknowledgment"
  | "offer"
  | "inquiry"
  | "other";

export type MatchConfidence = "high" | "medium" | "low" | "none";

export type EmailResolutionStatus = "pending" | "confirmed" | "dismissed";

export interface IDetectedEmail {
  _id?: Types.ObjectId | string;
  userEmail: string;
  messageId: string;
  threadId: string;
  sender: string;
  senderEmail: string;
  senderName?: string;
  subject: string;
  snippet: string;
  receivedAt: Date;
  category: EmailCategory;
  matchedApplicationId?: Types.ObjectId | string | IApplication | null;
  matchedCompany?: string;
  matchedRole?: string;
  matchConfidence: MatchConfidence;
  matchReason?: string;
  suggestedStatus?: ApplicationStatus | null;
  status: EmailResolutionStatus;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


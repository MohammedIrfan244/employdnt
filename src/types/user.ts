import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId | string;
  name?: string;
  email: string;
  image?: string;
  googleId?: string;
  defaultFollowUpDays?: number;

  // Profile fields (Module 6)
  headline?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  workArrangement?: string[]; // "Remote", "Hybrid", "On-site"
  targetRoles?: string[];

  // Preferences (Module 8)
  notifyEmailDetected?: boolean;
  notifyFollowUpDue?: boolean;
  targetDailyApplications?: number;

  // Gmail integration fields
  gmailConnected?: boolean;
  gmailEmail?: string;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailTokenExpiresAt?: number;
  gmailLastSyncedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

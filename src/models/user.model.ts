import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types/user";
import { DEFAULT_FOLLOW_UP_DAYS, DEFAULT_INITIAL_TARGET } from "@/lib/constants";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    defaultFollowUpDays: {
      type: Number,
      default: DEFAULT_FOLLOW_UP_DAYS,
    },

    // Profile fields (Module 6)
    headline: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    workArrangement: {
      type: [String],
      default: ["Remote"],
    },
    targetRoles: {
      type: [String],
      default: [],
    },

    // Preferences (Module 8)
    notifyEmailDetected: {
      type: Boolean,
      default: true,
    },
    notifyFollowUpDue: {
      type: Boolean,
      default: true,
    },
    targetDailyApplications: {
      type: Number,
      default: DEFAULT_INITIAL_TARGET,
    },

    // Gmail integration fields
    gmailConnected: {
      type: Boolean,
      default: false,
    },
    gmailEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    gmailAccessToken: {
      type: String,
    },
    gmailRefreshToken: {
      type: String,
    },
    gmailTokenExpiresAt: {
      type: Number,
    },
    gmailLastSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

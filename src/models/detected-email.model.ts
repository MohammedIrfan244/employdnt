import mongoose, { Schema, Model } from "mongoose";
import { IDetectedEmail } from "@/types/detected-email";
import { APPLICATION_STATUSES } from "@/lib/constants";

const DetectedEmailSchema = new Schema<IDetectedEmail>(
  {
    userEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    messageId: {
      type: String,
      required: true,
      index: true,
    },
    threadId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    snippet: {
      type: String,
      required: true,
      trim: true,
    },
    receivedAt: {
      type: Date,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["interview", "rejection", "acknowledgment", "offer", "inquiry", "other"],
      required: true,
    },
    matchedApplicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      default: null,
      index: true,
    },
    matchedCompany: {
      type: String,
      trim: true,
    },
    matchedRole: {
      type: String,
      trim: true,
    },
    matchConfidence: {
      type: String,
      enum: ["high", "medium", "low", "none"],
      default: "none",
    },
    matchReason: {
      type: String,
      trim: true,
    },
    suggestedStatus: {
      type: String,
      enum: [...APPLICATION_STATUSES, null],
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "dismissed"],
      default: "pending",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate message processing per user
DetectedEmailSchema.index({ userEmail: 1, messageId: 1 }, { unique: true });

export const DetectedEmail: Model<IDetectedEmail> =
  mongoose.models.DetectedEmail ||
  mongoose.model<IDetectedEmail>("DetectedEmail", DetectedEmailSchema);


import mongoose, { Schema, Model } from "mongoose";
import { IOutreachTemplate } from "@/types/outreach";

const OutreachTemplateSchema = new Schema<IOutreachTemplate>(
  {
    userEmail: {
      type: String,
      index: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Cold Pitch", "Website Audit", "Re-engagement", "Custom"],
      default: "Cold Pitch",
    },
    subjectTemplate: {
      type: String,
      required: true,
      trim: true,
    },
    bodyTemplate: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).OutreachTemplate;
}

export const OutreachTemplate: Model<IOutreachTemplate> =
  mongoose.models.OutreachTemplate ||
  mongoose.model<IOutreachTemplate>("OutreachTemplate", OutreachTemplateSchema);


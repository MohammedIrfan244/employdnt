import mongoose, { Schema, Model } from "mongoose";
import { IFreelanceResource } from "@/types/freelance-resource";

const FreelanceResourceSchema = new Schema<IFreelanceResource>(
  {
    userEmail: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Requirement Form",
        "Contract & Legal",
        "Scope & SOW",
        "Proposal",
        "Checklist",
        "Other",
      ],
      default: "Other",
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
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

FreelanceResourceSchema.index({ userEmail: 1, category: 1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).FreelanceResource;
}

export const FreelanceResource: Model<IFreelanceResource> =
  mongoose.models.FreelanceResource ||
  mongoose.model<IFreelanceResource>(
    "FreelanceResource",
    FreelanceResourceSchema
  );


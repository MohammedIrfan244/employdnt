import mongoose, { Schema, Model } from "mongoose";
import { IResource } from "@/types/resource";

const ResourceSchema = new Schema<IResource>(
  {
    userEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Job Boards",
        "Company Portals",
        "Interview Prep",
        "Portfolio & Docs",
        "Recruiter Contacts",
        "Other",
      ],
      default: "Other",
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ResourceSchema.index({ userEmail: 1, category: 1 });
ResourceSchema.index({ userEmail: 1, isPinned: -1, createdAt: -1 });

export const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);


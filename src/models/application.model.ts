import mongoose, { Schema, Model } from "mongoose";
import { IApplication } from "@/types/application";
import { APPLICATION_STATUSES } from "@/lib/constants";

const ApplicationSchema = new Schema<IApplication>(
  {
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Applied",
      index: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    followUpDate: {
      type: Date,
      index: true,
    },
    followUpCompleted: {
      type: Boolean,
      default: false,
    },
    followUpDismissed: {
      type: Boolean,
      default: false,
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    recruiterName: {
      type: String,
      trim: true,
    },
    recruiterEmail: {
      type: String,
      trim: true,
    },
    contactDetails: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    jobDescription: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    resumeUsed: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);


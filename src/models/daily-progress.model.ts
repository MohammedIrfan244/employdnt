import mongoose, { Schema, Model } from "mongoose";
import { IDailyProgress } from "@/types/daily-progress";
import { DEFAULT_INITIAL_TARGET } from "@/lib/constants";

const DailyProgressSchema = new Schema<IDailyProgress>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    date: {
      type: String, // Client date formatted as YYYY-MM-DD
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentMilestone: {
      type: Number,
      default: DEFAULT_INITIAL_TARGET,
      min: 1,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one progress document exists per category per client date
DailyProgressSchema.index({ categoryId: 1, date: 1 }, { unique: true });

export const DailyProgress: Model<IDailyProgress> =
  mongoose.models.DailyProgress || mongoose.model<IDailyProgress>("DailyProgress", DailyProgressSchema);


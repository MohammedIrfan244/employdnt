import mongoose, { Schema, Model } from "mongoose";
import { ICategory } from "@/types/category";
import { DEFAULT_INITIAL_TARGET } from "@/lib/constants";

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    defaultTarget: {
      type: Number,
      default: DEFAULT_INITIAL_TARGET,
      min: 1,
    },
    lifetimeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);


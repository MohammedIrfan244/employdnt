import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types/user";
import { DEFAULT_FOLLOW_UP_DAYS } from "@/lib/constants";

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
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


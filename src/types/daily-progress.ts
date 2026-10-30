import { Types } from "mongoose";

export interface IDailyProgress {
  _id?: Types.ObjectId | string;
  categoryId: Types.ObjectId | string;
  date: string; // Stored in YYYY-MM-DD relative to client local date
  count: number;
  currentMilestone: number; // e.g. 10, 15, 20...
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

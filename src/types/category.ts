import { Types } from "mongoose";

export interface ICategory {
  _id?: Types.ObjectId | string;
  name: string;
  defaultTarget: number;
  lifetimeCount: number;
  isArchived: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

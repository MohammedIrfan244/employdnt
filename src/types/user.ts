import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId | string;
  name?: string;
  email: string;
  image?: string;
  googleId?: string;
  defaultFollowUpDays?: number;
  createdAt?: Date;
  updatedAt?: Date;
}


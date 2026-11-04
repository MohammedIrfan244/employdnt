import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId | string;
  name?: string;
  email: string;
  image?: string;
  googleId?: string;
  defaultFollowUpDays?: number;
  // Gmail integration fields
  gmailConnected?: boolean;
  gmailEmail?: string;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailTokenExpiresAt?: number;
  gmailLastSyncedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

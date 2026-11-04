import { Types } from "mongoose";

export interface IResume {
  _id?: Types.ObjectId | string;
  userEmail: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  category?: string;
  isDefault?: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


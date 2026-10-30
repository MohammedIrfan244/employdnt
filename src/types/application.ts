import { Types } from "mongoose";
import { ApplicationStatus } from "@/lib/constants";

export interface IApplication {
  _id?: Types.ObjectId | string;
  company: string;
  role: string;
  categoryId: Types.ObjectId | string;
  status: ApplicationStatus;
  appliedDate: Date;
  followUpDate?: Date;
  followUpCompleted?: boolean;
  followUpDismissed?: boolean;
  jobUrl?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  contactDetails?: string;
  salary?: string;
  jobDescription?: string;
  notes?: string;
  resumeUsed?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

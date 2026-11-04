import { Types } from "mongoose";

export type ResourceCategory =
  | "Job Boards"
  | "Company Portals"
  | "Interview Prep"
  | "Portfolio & Docs"
  | "Recruiter Contacts"
  | "Other";

export interface IResource {
  _id?: Types.ObjectId | string;
  userEmail: string;
  title: string;
  url: string;
  category: ResourceCategory;
  description?: string;
  tags?: string[];
  isPinned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


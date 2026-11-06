export type FreelanceResourceCategory =
  | "Requirement Form"
  | "Contract & Legal"
  | "Scope & SOW"
  | "Proposal"
  | "Checklist"
  | "Other";

export interface IFreelanceResource {
  _id?: string;
  userEmail: string;
  title: string;
  url: string;
  category: FreelanceResourceCategory;
  description?: string;
  isPinned?: boolean;
  isSystem?: boolean;
  createdAt?: string;
}


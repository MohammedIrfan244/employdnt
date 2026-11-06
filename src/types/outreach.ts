export interface IOutreachTemplate {
  _id?: string;
  userEmail?: string; // null/undefined for system templates
  name: string;
  category: "Cold Pitch" | "Website Audit" | "Re-engagement" | "Custom";
  subjectTemplate: string;
  bodyTemplate: string;
  description?: string;
  isSystem?: boolean;
  createdAt?: string;
}

export interface IOutreachDraft {
  recipientName: string;
  companyName: string;
  serviceOffered: string;
  personalizedObservation: string;
  subject: string;
  body: string;
  templateId?: string;
}


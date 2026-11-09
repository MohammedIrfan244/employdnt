export type FreelanceStage =
  | "Outreached"
  | "Scoping"
  | "Contract"
  | "Build"
  | "Test"
  | "Launch"
  | "Post-launch";

export const FREELANCE_STAGES: FreelanceStage[] = [
  "Outreached",
  "Scoping",
  "Contract",
  "Build",
  "Test",
  "Launch",
  "Post-launch",
];

export type LeadSource =
  | "LinkedIn"
  | "Google Maps"
  | "Website"
  | "Referral"
  | "Cold Email"
  | "Upwork"
  | "Twitter/X"
  | "Other";

// 1. Statement of Work (SOW) Data Schema
export interface ISowDocumentData {
  developerName: string;
  developerEmail?: string;
  clientName: string;
  companyName: string;
  projectTitle: string;
  effectiveDate: string; // YYYY-MM-DD
  projectOverview: string;
  coreDeliverables: string[];
  outOfScope: string[];
  estimatedBudget: number;
  currency: string;
  paymentTerms: string;
  timelineWeeks?: number;
  revisionPolicy?: string;
  generatedAt?: string;
}

// 2. Contract Agreement Data Schema
export interface IContractDocumentData {
  developerName: string;
  developerEmail?: string;
  clientName: string;
  companyName: string;
  projectTitle: string;
  effectiveDate: string; // YYYY-MM-DD
  servicesDescription: string;
  agreedAmount: number;
  currency: string;
  paymentSchedule: string;
  ipOwnershipClause?: string;
  confidentialityTerms?: string;
  warrantyDays?: number;
  governingLaw?: string;
  generatedAt?: string;
}

// 3. Project Handover Document Data Schema
export interface IHandoverDocumentData {
  developerName: string;
  developerEmail?: string;
  clientName: string;
  companyName: string;
  projectTitle: string;
  handoverDate: string; // YYYY-MM-DD
  productionUrl: string;
  stagingUrl?: string;
  repositoryUrl: string;
  hostingProvider?: string;
  credentialsChecklist: Array<{ item: string; transferred: boolean }>;
  supportPeriodDays?: number;
  supportEndDate?: string;
  maintenanceNotes?: string;
  generatedAt?: string;
}

export interface IStageScoping {
  requirementsSummary?: string;
  scopeDocUrl?: string;
  scopeDocFileName?: string;
  sowData?: ISowDocumentData;
  budgetEstimate?: number;
  currency?: string;
}

export interface IStageContract {
  contractDocUrl?: string;
  contractData?: IContractDocumentData;
  agreedAmount?: number;
  currency?: string;
  functionalRequirements?: string;
  signedDate?: string;
}

export interface IStageBuild {
  repositoryUrl?: string;
  stagingUrl?: string;
  developmentNotes?: string;
}

export interface IStageTest {
  testingUrl?: string;
  feedbackNotes?: string;
  bugLog?: string;
}

export interface IStageLaunch {
  productionUrl?: string;
  deploymentDate?: string;
  handoverNotes?: string;
  handoverData?: IHandoverDocumentData;
}

export interface IStagePostLaunch {
  supportPeriodMonths?: number;
  supportEndDate?: string;
  maintenanceNotes?: string;
}

export interface IStageHistoryEntry {
  stage: FreelanceStage;
  enteredAt: Date | string;
  completedAt?: Date | string;
  notes?: string;
}

export interface IFreelanceClient {
  _id?: string;
  userEmail: string;

  // Initial Details
  companyName: string;
  contactName: string;
  location?: string;
  email?: string;
  mobile?: string;
  website?: string;
  leadSource: LeadSource;
  outreachDate: string; // YYYY-MM-DD
  initialNotes?: string;

  // Lifecycle & Due Date
  currentStage: FreelanceStage;
  stageEnteredAt: Date | string;
  stageDueDate?: string; // YYYY-MM-DD
  isCompleted?: boolean;
  isArchived?: boolean;

  // Scoping Reminder State
  scopingSnoozedUntil?: string; // YYYY-MM-DD

  // Stage-specific evolving fields
  scoping?: IStageScoping;
  contract?: IStageContract;
  build?: IStageBuild;
  test?: IStageTest;
  launch?: IStageLaunch;
  postLaunch?: IStagePostLaunch;

  stageHistory: IStageHistoryEntry[];

  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IFreelanceDashboardMetrics {
  totalLeads: number;
  activeProjects: number;
  upcomingDeadlinesCount: number;
  scopingAttentionCount: number;
  todayOutreachCount?: number;
  dailyTarget?: number;
}

export interface IClientDuplicateMatch {
  _id: string;
  companyName: string;
  contactName: string;
  email?: string;
  website?: string;
  mobile?: string;
  currentStage: FreelanceStage;
  outreachDate: string;
  matchReasons: string[];
}

export interface IDuplicateCheckQuery {
  companyName?: string;
  contactName?: string;
  email?: string;
  website?: string;
  mobile?: string;
}

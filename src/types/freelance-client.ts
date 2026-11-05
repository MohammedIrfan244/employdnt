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

export interface IStageScoping {
  requirementsSummary?: string;
  scopeDocUrl?: string;
  budgetEstimate?: number;
  currency?: string;
}

export interface IStageContract {
  contractDocUrl?: string;
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
}

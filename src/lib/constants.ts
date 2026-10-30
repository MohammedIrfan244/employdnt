export const APPLICATION_STATUSES = [
  "Applied",
  "Follow-up Needed",
  "In Progress",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const DEFAULT_CATEGORIES = [
  { name: "Development", defaultTarget: 10 },
  { name: "Other Remote Jobs", defaultTarget: 10 },
  { name: "Freelance", defaultTarget: 10 },
] as const;

export const DEFAULT_GOAL_MILESTONES = [10, 15, 20, 30, 40, 50] as const;

export const DEFAULT_INITIAL_TARGET = 10;

export const DEFAULT_FOLLOW_UP_DAYS = 7;

export const EVENT_TYPES = {
  APPLICATION_CREATED: "APPLICATION_CREATED",
  STATUS_CHANGED: "STATUS_CHANGED",
  FOLLOW_UP_SCHEDULED: "FOLLOW_UP_SCHEDULED",
  FOLLOW_UP_COMPLETED: "FOLLOW_UP_COMPLETED",
  FOLLOW_UP_POSTPONED: "FOLLOW_UP_POSTPONED",
  NOTE_UPDATED: "NOTE_UPDATED",
  EMAIL_LINKED: "EMAIL_LINKED",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];


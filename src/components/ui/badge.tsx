import React from "react";

type BadgeVariant =
  | "default"
  | "applied"
  | "followup"
  | "progress"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-hover)] text-[var(--muted)] border-[var(--border)]",
  applied:
    "bg-[var(--status-applied-bg)] text-[var(--status-applied-text)] border-[var(--status-applied-border)] shadow-[0_0_8px_rgba(16,185,129,0.15)]",
  followup:
    "bg-[var(--status-followup-bg)] text-[var(--status-followup-text)] border-[var(--status-followup-border)] shadow-[0_0_8px_rgba(245,158,11,0.15)]",
  progress:
    "bg-[var(--status-progress-bg)] text-[var(--status-progress-text)] border-[var(--status-progress-border)] shadow-[0_0_8px_rgba(59,130,246,0.15)]",
  interview:
    "bg-[var(--status-progress-bg)] text-[var(--status-progress-text)] border-[var(--status-progress-border)] shadow-[0_0_8px_rgba(59,130,246,0.15)]",
  offer:
    "bg-[var(--status-offer-bg)] text-[var(--status-offer-text)] border-[var(--status-offer-border)] shadow-[0_0_10px_rgba(16,185,129,0.25)]",
  rejected:
    "bg-[var(--status-rejected-bg)] text-[var(--status-rejected-text)] border-[var(--status-rejected-border)]",
  withdrawn:
    "bg-[var(--status-rejected-bg)] text-[var(--status-rejected-text)] border-[var(--status-rejected-border)]",
};

export function getStatusBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    "Applied": "applied",
    "Follow-up Needed": "followup",
    "In Progress": "progress",
    "Interview": "interview",
    "Offer": "offer",
    "Rejected": "rejected",
    "Withdrawn": "withdrawn",
  };
  return map[status] || "default";
}

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 text-xs font-medium
        rounded-full border tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

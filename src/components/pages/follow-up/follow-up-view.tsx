"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useClientDate } from "@/hooks/use-client-date";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import FollowUpDraftModal from "@/components/shared/follow-up-draft-modal";
import { Clock, Calendar, Check, CheckCircle2, Mail, X, ArrowUpRight } from "lucide-react";
import { IApplication } from "@/types/application";
import { IFollowUpOverview } from "@/services/follow-up.service";

export default function FollowUpView() {
  const { isClient, todayString, formatDate } = useClientDate();

  const [overview, setOverview] = useState<IFollowUpOverview>({
    due: [],
    upcoming: [],
    stats: { dueCount: 0, upcomingCount: 0, completedCount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [draftApp, setDraftApp] = useState<IApplication | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchFollowUps = useCallback(async () => {
    if (!todayString) return;
    try {
      const res = await fetch(`/api/follow-up?clientDate=${encodeURIComponent(todayString)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [todayString]);

  useEffect(() => {
    if (isClient && todayString) {
      fetchFollowUps();
    }
  }, [isClient, todayString, fetchFollowUps]);

  const handleAction = async (
    applicationId: string,
    action: "complete" | "postpone" | "dismiss",
    days: number = 3
  ) => {
    setActionLoadingId(applicationId);
    try {
      const res = await fetch(`/api/follow-up/${applicationId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, days, clientDate: todayString }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchFollowUps();
      }
    } catch {
      // silent
    } finally {
      setActionLoadingId(null);
    }
  };

  const getDaysOverdue = (followUpDate?: Date | string) => {
    if (!followUpDate) return 0;
    const target = new Date(followUpDate);
    const now = new Date();
    const diff = Math.round((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysUntil = (followUpDate?: Date | string) => {
    if (!followUpDate) return 0;
    const target = new Date(followUpDate);
    const now = new Date();
    const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Follow-Up Assistant
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Never let a warm application slip away without corporate pressure
          </p>
        </div>

        {/* Overview Stats Badges */}
        <div className="flex items-center gap-2">
          {overview.stats.dueCount > 0 ? (
            <Badge variant="followup">{overview.stats.dueCount} due now</Badge>
          ) : (
            <Badge variant="applied">All caught up</Badge>
          )}
          <span className="text-xs text-[var(--muted)]">•</span>
          <span className="text-xs text-[var(--muted)]">
            {overview.stats.completedCount} completed lifetime
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--muted)] animate-pulse">
          Reviewing your application reminders...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Due & Overdue (Needs Attention Now) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
                  Needs Attention ({overview.due.length})
                </h2>
              </div>
              <span className="text-xs text-[var(--muted)]">
                Recommended follow-up window (+7 days after applying)
              </span>
            </div>

            {overview.due.length === 0 ? (
              <Card className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  You are completely caught up!
                </p>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                  No applications are waiting for a follow-up today. Check the upcoming section below to preview what is scheduled next.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {overview.due.map((app) => {
                  const overdueDays = getDaysOverdue(app.followUpDate);
                  const isActioning = actionLoadingId === app._id?.toString();
                  const catName =
                    typeof app.categoryId === "object" && app.categoryId !== null && "name" in app.categoryId
                      ? (app.categoryId as { name: string }).name
                      : "General";

                  return (
                    <Card
                      key={app._id?.toString()}
                      className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-[var(--muted-light)] transition-all"
                    >
                      {/* Left Application Info */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/applications/${app._id}`}
                            className="text-base font-bold text-[var(--foreground)] hover:text-[var(--accent-text)] transition-colors truncate"
                          >
                            {app.company}
                          </Link>
                          <span className="text-xs text-[var(--muted)] font-medium">
                            • {app.role}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--muted)]">
                            {catName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[var(--muted)] flex-wrap">
                          <span>Applied {formatDate(app.appliedDate)}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">
                            {overdueDays > 0 ? `Overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}` : "Due today"}
                          </span>
                          {app.recruiterName && (
                            <>
                              <span>•</span>
                              <span>Recruiter: {app.recruiterName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setDraftApp(app)}
                          className="text-xs font-semibold py-1.5 px-3 shadow-xs flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Draft Email
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleAction(app._id!.toString(), "complete")}
                          className="text-xs py-1.5 px-3 flex items-center gap-1"
                          title="Mark follow-up as sent and resolved"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Done
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleAction(app._id!.toString(), "postpone", 3)}
                          className="text-xs py-1.5 px-2.5 text-[var(--muted)] hover:text-[var(--foreground)]"
                          title="Postpone reminder by +3 days"
                        >
                          +3d
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleAction(app._id!.toString(), "dismiss")}
                          className="text-xs py-1.5 px-2.5 text-[var(--muted)] hover:text-red-400"
                          title="Dismiss reminder"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Upcoming Follow-Ups (Scheduled Next 14 Days) */}
          <div className="space-y-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
                  Upcoming Schedule ({overview.upcoming.length})
                </h2>
              </div>
              <span className="text-xs text-[var(--muted)]">Next 14 days</span>
            </div>

            {overview.upcoming.length === 0 ? (
              <p className="text-xs text-[var(--muted)] italic">
                No upcoming follow-ups scheduled for the next two weeks.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overview.upcoming.map((app) => {
                  const daysUntil = getDaysUntil(app.followUpDate);
                  return (
                    <Card
                      key={app._id?.toString()}
                      className="p-4 space-y-3 hover:border-[var(--muted-light)] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/applications/${app._id}`}
                            className="text-sm font-bold text-[var(--foreground)] hover:text-[var(--accent-text)] transition-colors truncate block"
                          >
                            {app.company}
                          </Link>
                          <p className="text-xs text-[var(--muted)] truncate">{app.role}</p>
                        </div>
                        <Badge variant="default">In {daysUntil}d</Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
                        <span>Due {formatDate(app.followUpDate)}</span>
                        <button
                          type="button"
                          onClick={() => setDraftApp(app)}
                          className="text-[var(--accent-text)] hover:underline font-medium cursor-pointer flex items-center gap-1"
                        >
                          Preview draft
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Follow-Up Draft Modal */}
      <FollowUpDraftModal
        isOpen={Boolean(draftApp)}
        onClose={() => setDraftApp(null)}
        application={draftApp}
        onMarkDone={async (applicationId) => {
          await handleAction(applicationId, "complete");
        }}
      />
    </div>
  );
}

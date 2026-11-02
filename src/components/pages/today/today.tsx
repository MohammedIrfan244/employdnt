"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useClientDate } from "@/hooks/use-client-date";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge, { getStatusBadgeVariant } from "@/components/ui/badge";
import FollowUpDraftModal from "@/components/shared/follow-up-draft-modal";
import { Clock, Briefcase, Check, Mail, ArrowRight, ArrowUpRight } from "lucide-react";
import { ICategory } from "@/types/category";
import { IDailyProgress } from "@/types/daily-progress";
import { IApplication } from "@/types/application";

interface CategoryProgressItem {
  category: ICategory;
  progress: IDailyProgress;
}

export default function Today() {
  const { isClient, todayString, formatDate } = useClientDate();

  const [categoriesProgress, setCategoriesProgress] = useState<CategoryProgressItem[]>([]);
  const [needsAttention, setNeedsAttention] = useState<IApplication[]>([]);
  const [recentApplications, setRecentApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftApp, setDraftApp] = useState<IApplication | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!todayString) return;

    try {
      const [progRes, attnRes, recentRes] = await Promise.all([
        fetch(`/api/progress/today?clientDate=${encodeURIComponent(todayString)}`),
        fetch(`/api/follow-up?clientDate=${encodeURIComponent(todayString)}`),
        fetch("/api/applications?recent=true&limit=8"),
      ]);

      const [progData, attnData, recentData] = await Promise.all([
        progRes.json(),
        attnRes.json(),
        recentRes.json(),
      ]);

      if (progData.success) {
        setCategoriesProgress(progData.data.categories || []);
      }
      if (attnData.success) {
        const list = Array.isArray(attnData.data)
          ? attnData.data
          : attnData.data?.due || [];
        setNeedsAttention(list);
      }
      if (recentData.success) {
        setRecentApplications(recentData.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [todayString]);

  useEffect(() => {
    if (isClient && todayString) {
      fetchDashboardData();
    }
  }, [isClient, todayString, fetchDashboardData]);

  const handleCompleteFollowUp = async (applicationId: string) => {
    setActioningId(applicationId);
    try {
      const res = await fetch(`/api/follow-up/${applicationId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", clientDate: todayString }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDashboardData();
      }
    } catch {
      // silent
    } finally {
      setActioningId(null);
    }
  };

  const totalLifetime = categoriesProgress.reduce(
    (acc, curr) => acc + (curr.category.lifetimeCount || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Serene Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Today</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {isClient
              ? formatDate(new Date(), { weekday: "long", month: "long", day: "numeric", year: "numeric" })
              : "Welcome back"}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span>Tracking {categoriesProgress.length} categories</span>
        </div>
      </div>

      {/* Fluid Multi-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Area: Daily Rhythm & Recent Logs (8 cols on lg, 8 on xl, 9 on 2xl) */}
        <div className="lg:col-span-8 2xl:col-span-9 space-y-6">
          {/* Daily Goals / Rhythm */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Daily rhythm</h2>
              <span className="text-xs text-[var(--muted)]">Milestones advance automatically</span>
            </div>

            {loading ? (
              <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--muted)] animate-pulse">
                Fetching today&apos;s counts...
              </div>
            ) : categoriesProgress.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-sm text-[var(--muted)]">No active categories yet.</p>
                <p className="text-xs text-[var(--muted-light)] mt-1">
                  Click &quot;+ Log application&quot; above to get started.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                {categoriesProgress.map(({ category, progress }) => {
                  const count = progress.count || 0;
                  const target = progress.currentMilestone || category.defaultTarget || 10;
                  const percentage = Math.min(Math.round((count / target) * 100), 100);
                  const reachedInitial = count >= (category.defaultTarget || 10);

                  return (
                    <Card key={category._id?.toString()} hover className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-[var(--foreground)] tracking-tight">
                            {category.name}
                          </h3>
                          <p className="text-[11px] text-[var(--muted)] mt-0.5">
                            {category.lifetimeCount || 0} applications logged so far
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[var(--foreground)]">
                            {count}
                          </span>
                          <span className="text-xs text-[var(--muted)] font-mono">
                            {" "}/ {target}
                          </span>
                        </div>
                      </div>

                      {/* Quiet Progress Bar */}
                      <div className="w-full bg-[var(--surface-hover)] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ease-out rounded-full ${
                            reachedInitial ? "bg-emerald-400" : "bg-[var(--accent)]"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Applications Feed */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent logs</h2>
              </div>
              <Link
                href="/applications"
                className="text-xs font-medium text-[var(--accent-text)] hover:underline flex items-center gap-1"
              >
                View all applications
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--muted)] animate-pulse">
                Loading recent logs...
              </div>
            ) : recentApplications.length === 0 ? (
              <Card className="text-center py-8 text-xs text-[var(--muted)]">
                Nothing logged yet. Use the &quot;+ Log application&quot; button above to log your first job submission.
              </Card>
            ) : (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)] overflow-hidden shadow-xs">
                {recentApplications.map((app) => {
                  const catName =
                    typeof app.categoryId === "object" && app.categoryId !== null && "name" in app.categoryId
                      ? (app.categoryId as { name: string }).name
                      : "General";

                  return (
                    <div
                      key={app._id?.toString()}
                      className="p-3.5 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/applications/${app._id}`}
                            className="text-xs font-semibold text-[var(--foreground)] hover:text-[var(--accent-text)] transition-colors truncate"
                          >
                            {app.company}
                          </Link>
                          <span className="text-xs text-[var(--muted)] truncate">
                            • {app.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)]">
                            {catName}
                          </span>
                          <span>{formatDate(app.appliedDate)}</span>
                          {app.salary && <span>• {app.salary}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={getStatusBadgeVariant(app.status)}>
                          {app.status}
                        </Badge>
                        <Link
                          href={`/applications/${app._id}`}
                          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Follow-ups due + Journey Summary (4 cols on lg, 4 on xl, 3 on 2xl) */}
        <div className="lg:col-span-4 2xl:col-span-3 space-y-5">
          {/* Follow-up attention card */}
          <Card className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Follow-ups due</h2>
              </div>
              <div className="flex items-center gap-2">
                {needsAttention.length > 0 && (
                  <Badge variant="followup">{needsAttention.length} pending</Badge>
                )}
                <Link
                  href="/follow-up"
                  className="text-xs font-medium text-[var(--accent-text)] hover:underline flex items-center gap-0.5"
                >
                  View all
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {needsAttention.length === 0 ? (
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                No reminders due today. You are completely caught up!
              </p>
            ) : (
              <div className="space-y-2.5">
                {needsAttention.slice(0, 5).map((app) => {
                  const isActioning = actioningId === app._id?.toString();

                  return (
                    <div
                      key={app._id?.toString()}
                      className="p-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/applications/${app._id}`}
                          className="text-xs font-semibold text-[var(--foreground)] truncate hover:text-[var(--accent-text)] transition-colors block"
                        >
                          {app.company}
                        </Link>
                        <p className="text-[11px] text-[var(--muted)] truncate">{app.role}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setDraftApp(app)}
                          className="text-[11px] py-1 px-2.5 shadow-xs flex items-center gap-1"
                          title="Generate follow-up email draft"
                        >
                          <Mail className="w-3 h-3" />
                          Draft
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isActioning}
                          onClick={() => handleCompleteFollowUp(app._id!.toString())}
                          className="text-[11px] py-1 px-2 flex items-center justify-center"
                          title="Mark follow-up done"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quiet Journey Card */}
          <Card className="space-y-3 bg-[var(--accent-light)] border-[var(--accent-border)]">
            <h3 className="text-xs font-semibold text-[var(--accent-text)] uppercase tracking-wider">
              Your Journey
            </h3>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {totalLifetime} <span className="text-xs font-normal text-[var(--muted)]">lifetime applications</span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              No rejection statistics. No pressure dials. Just steady, quiet consistency on your own terms.
            </p>
          </Card>
        </div>
      </div>

      {/* Follow-Up Email Draft Modal */}
      <FollowUpDraftModal
        isOpen={Boolean(draftApp)}
        onClose={() => setDraftApp(null)}
        application={draftApp}
        onMarkDone={async (applicationId) => {
          await handleCompleteFollowUp(applicationId);
        }}
      />
    </div>
  );
}

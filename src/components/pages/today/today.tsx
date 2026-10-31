"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useClientDate } from "@/hooks/use-client-date";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge, { getStatusBadgeVariant } from "@/components/ui/badge";
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

  const fetchDashboardData = useCallback(async () => {
    if (!todayString) return;

    try {
      const [progRes, attnRes, recentRes] = await Promise.all([
        fetch(`/api/progress/today?clientDate=${encodeURIComponent(todayString)}`),
        fetch("/api/follow-up"),
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
        setNeedsAttention(attnData.data || []);
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

      {/* Fluid Multi-Column Layout - Perfectly Proportioned Across Ultrawide Monitors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Area: Daily Rhythm & Recent Logs (8 cols on lg, 8 on xl, 9 on 2xl) */}
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
                          <h3 className="font-semibold text-sm text-[var(--foreground)]">
                            {category.name}
                          </h3>
                          <p className="text-xs text-[var(--muted)] mt-0.5">
                            {category.lifetimeCount || 0} applications logged
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-[var(--accent-text)]">
                            {count}{" "}
                            <span className="text-[var(--muted)] font-normal text-xs">/ {target}</span>
                          </div>
                          {reachedInitial && (
                            <span className="text-[10px] font-semibold text-[var(--accent-text)] bg-[var(--accent-light)] px-1.5 py-0.5 rounded-full border border-[var(--accent-border)]">
                              Target reached
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tactile progress bar */}
                      <div className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]"
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent logs</h2>
              <Link
                href="/applications"
                className="text-xs font-medium text-[var(--accent-text)] hover:underline"
              >
                View all applications →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <Card className="text-center py-12 space-y-2">
                <p className="text-sm font-medium text-[var(--foreground)]">No applications logged yet</p>
                <p className="text-xs text-[var(--muted)]">
                  Use the &quot;+ Log application&quot; button above to log your first job submission.
                </p>
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
                      className="p-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/applications/${app._id}`}
                            className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent-text)] transition-colors"
                          >
                            {app.company}
                          </Link>
                          <span className="text-xs text-[var(--muted)]">• {app.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)]">
                            {catName}
                          </span>
                          <span>{formatDate(app.appliedDate)}</span>
                          {app.salary && <span>• {app.salary}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
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
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Follow-ups due</h2>
              {needsAttention.length > 0 && (
                <Badge variant="followup">{needsAttention.length} pending</Badge>
              )}
            </div>

            {needsAttention.length === 0 ? (
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                No reminders due today. You are completely caught up!
              </p>
            ) : (
              <div className="space-y-2.5">
                {needsAttention.map((app) => (
                  <div
                    key={app._id?.toString()}
                    className="p-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                        {app.company}
                      </p>
                      <p className="text-[11px] text-[var(--muted)] truncate">{app.role}</p>
                    </div>
                    <Link href={`/applications/${app._id}`}>
                      <Button variant="secondary" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
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
    </div>
  );
}

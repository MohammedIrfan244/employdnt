"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useClientDate } from "@/hooks/use-client-date";
import QuickAddModal from "@/components/shared/quick-add-modal";
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
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!todayString) return;

    try {
      const [progRes, attnRes, recentRes] = await Promise.all([
        fetch(`/api/progress/today?clientDate=${encodeURIComponent(todayString)}`),
        fetch("/api/follow-up"),
        fetch("/api/applications?recent=true&limit=5"),
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
      // Graceful error fallback
    } finally {
      setLoading(false);
    }
  }, [todayString]);

  useEffect(() => {
    if (isClient && todayString) {
      fetchDashboardData();
    }
  }, [isClient, todayString, fetchDashboardData]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header with Greeting & Quick Add Button (Module 1.6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Today</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isClient ? formatDate(new Date(), { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Today's Overview"}
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="text-sm leading-none">+</span> Add Application
          </button>
        </div>
      </div>

      {/* Module 1.1 & 1.2: Daily Application Goals (Progressive Goal System) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Daily Progress</h2>
          <span className="text-xs text-zinc-400">Resets daily</span>
        </div>

        {loading ? (
          <div className="p-8 border border-zinc-100 rounded-xl bg-zinc-50 text-center text-xs text-zinc-400 animate-pulse">
            Loading your progress...
          </div>
        ) : categoriesProgress.length === 0 ? (
          <div className="p-6 border border-zinc-100 rounded-xl bg-white text-center text-xs text-zinc-500">
            No active categories found. Add your first application to initialize categories!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoriesProgress.map(({ category, progress }) => {
              const count = progress.count || 0;
              const target = progress.currentMilestone || category.defaultTarget || 10;
              const percentage = Math.min(Math.round((count / target) * 100), 100);
              const reachedInitial = count >= (category.defaultTarget || 10);

              return (
                <div
                  key={category._id?.toString()}
                  className="p-5 bg-white border border-zinc-200/80 rounded-xl shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">{category.name}</h3>
                      <p className="text-[11px] text-zinc-400">
                        Lifetime: <span className="font-medium text-zinc-600">{category.lifetimeCount || 0}</span> applications
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-700">
                        {count} <span className="text-zinc-400 font-normal">/ {target}</span>
                      </span>
                      {reachedInitial && (
                        <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                          Goal Reached!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar (Module 1.1) */}
                  <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        reachedInitial ? "bg-emerald-600" : "bg-emerald-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Module 1.4: Needs Attention */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Needs Attention</h2>
          {needsAttention.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
              {needsAttention.length} due
            </span>
          )}
        </div>

        {needsAttention.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-zinc-200 bg-white text-center text-xs text-zinc-400">
            No follow-ups due today. You are all caught up!
          </div>
        ) : (
          <div className="space-y-2">
            {needsAttention.map((app) => (
              <div
                key={app._id?.toString()}
                className="p-3.5 bg-amber-50/40 border border-amber-200/60 rounded-xl flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">{app.company}</span>
                    <span className="text-xs text-zinc-500">• {app.role}</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Follow-up reminder due • Applied on {formatDate(app.appliedDate)}
                  </p>
                </div>

                <Link
                  href={`/applications/${app._id}`}
                  className="px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors whitespace-nowrap"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Module 1.5: Recent Applications */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700">Recent Applications</h2>
          <Link
            href="/applications"
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="p-4 rounded-xl border border-zinc-100 bg-white text-center text-xs text-zinc-400">
            No applications recorded yet. Click &quot;Add Application&quot; above to log your first job submission.
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/80 rounded-xl divide-y divide-zinc-100 overflow-hidden shadow-xs">
            {recentApplications.map((app) => {
              const catName =
                typeof app.categoryId === "object" && app.categoryId !== null && "name" in app.categoryId
                  ? (app.categoryId as { name: string }).name
                  : "General";

              return (
                <div
                  key={app._id?.toString()}
                  className="p-3.5 flex items-center justify-between hover:bg-zinc-50/60 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{app.company}</span>
                      <span className="text-xs text-zinc-500">• {app.role}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                        {catName}
                      </span>
                      <span className="text-[11px] text-zinc-400">{formatDate(app.appliedDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {app.status}
                    </span>
                    <Link
                      href={`/applications/${app._id}`}
                      className="text-xs text-zinc-400 hover:text-zinc-600"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import { useClientDate } from "@/hooks/use-client-date";
import {
  IFreelanceClient,
  IFreelanceDashboardMetrics,
  FreelanceStage,
  FREELANCE_STAGES,
} from "@/types/freelance-client";
import {
  Users,
  Briefcase,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  ArrowUpRight,
  Send,
  Calendar,
} from "lucide-react";

interface FreelanceDashboardViewProps {
  onOpenQuickAddLead?: () => void;
}

const STAGE_BADGE_VARIANTS: Record<
  FreelanceStage,
  "default" | "applied" | "interview" | "offer" | "rejected"
> = {
  Outreached: "default",
  Scoping: "interview",
  Contract: "offer",
  Build: "applied",
  Test: "interview",
  Launch: "offer",
  "Post-launch": "default",
};

export default function FreelanceDashboardView({
  onOpenQuickAddLead,
}: FreelanceDashboardViewProps) {
  const { todayString, formatDate } = useClientDate();

  const [clients, setClients] = useState<IFreelanceClient[]>([]);
  const [metrics, setMetrics] = useState<IFreelanceDashboardMetrics>({
    totalLeads: 0,
    activeProjects: 0,
    upcomingDeadlinesCount: 0,
    scopingAttentionCount: 0,
  });
  const [scopingAttention, setScopingAttention] = useState<IFreelanceClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [snoozingId, setSnoozingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (stageFilter && stageFilter !== "All") params.set("stage", stageFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (todayString) params.set("clientDate", todayString);

      const res = await fetch(`/api/freelance/clients?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setClients(json.data.clients || []);
        setMetrics(json.data.metrics);
        setScopingAttention(json.data.scopingAttention || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [stageFilter, searchQuery, todayString]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSnooze = async (id: string, days: number) => {
    setSnoozingId(id);
    try {
      const res = await fetch(`/api/freelance/clients/${id}/snooze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      const json = await res.json();
      if (json.success) {
        fetchDashboardData();
      }
    } catch {
      // silent
    } finally {
      setSnoozingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              Freelance CRM
            </h1>
            <Badge variant="applied" className="text-[10px] py-0.5 px-2">
              7-Stage Lifecycle
            </Badge>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Single evolving client record from cold outreach to post-launch handover.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/freelance/email-studio">
            <Button variant="secondary" size="sm" className="text-xs flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>Email Studio</span>
            </Button>
          </Link>
          {onOpenQuickAddLead && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenQuickAddLead}
              className="text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 space-y-1 bg-[var(--surface)]">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-medium">Total Leads</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {metrics.totalLeads}
          </p>
          <p className="text-[11px] text-[var(--muted)]">Outreached &amp; Scoping</p>
        </Card>

        <Card className="p-4 space-y-1 bg-[var(--surface)]">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-medium">Active Projects</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {metrics.activeProjects}
          </p>
          <p className="text-[11px] text-[var(--muted)]">Contract, Build &amp; Test</p>
        </Card>

        <Card className="p-4 space-y-1 bg-[var(--surface)]">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-medium">Upcoming Deadlines</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {metrics.upcomingDeadlinesCount}
          </p>
          <p className="text-[11px] text-[var(--muted)]">Due within 7 days</p>
        </Card>

        <Card className="p-4 space-y-1 bg-[var(--surface)]">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-medium">Scoping Attention</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
            {metrics.scopingAttentionCount}
          </p>
          <p className="text-[11px] text-[var(--muted)]">Inactive $\ge$ 7 days</p>
        </Card>
      </div>

      {/* Scoping Follow-up Attention Alert (Module 3) */}
      {scopingAttention.length > 0 && (
        <Card className="p-4 border-orange-500/30 bg-orange-500/5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
            <h2 className="text-xs font-bold text-orange-400 tracking-wide uppercase">
              Scoping Follow-Up Required ({scopingAttention.length})
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)]">
            These leads have been in the Scoping stage for 7+ days without progressing. Re-engage or snooze follow-ups manually.
          </p>

          <div className="divide-y divide-[var(--border)] pt-1">
            {scopingAttention.map((client) => (
              <div
                key={client._id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      {client.companyName}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      ({client.contactName})
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">
                    In Scoping since {formatDate(client.stageEnteredAt)} • Source: {client.leadSource}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/freelance/email-studio?company=${encodeURIComponent(
                      client.companyName
                    )}&recipient=${encodeURIComponent(client.contactName)}`}
                  >
                    <Button variant="secondary" size="sm" className="text-[11px] py-1 px-2.5">
                      <Send className="w-3 h-3 text-[var(--accent-text)]" />
                      <span>Draft Email</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={snoozingId === client._id}
                    onClick={() => handleSnooze(client._id!, 3)}
                    className="text-[11px] py-1 px-2"
                  >
                    +3d Snooze
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={snoozingId === client._id}
                    onClick={() => handleSnooze(client._id!, 7)}
                    className="text-[11px] py-1 px-2"
                  >
                    +7d Snooze
                  </Button>
                  <Link href={`/freelance/clients/${client._id}`}>
                    <Button variant="primary" size="sm" className="text-[11px] py-1 px-2.5">
                      <span>View</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Stage Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStageFilter("All")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              stageFilter === "All"
                ? "bg-[var(--foreground)] text-[var(--background)] font-bold shadow-xs"
                : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            All ({metrics.totalLeads + metrics.activeProjects})
          </button>
          {FREELANCE_STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setStageFilter(stage)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                stageFilter === stage
                  ? "bg-[var(--accent-light)] text-[var(--accent-text)] border border-[var(--accent-border)] font-bold shadow-xs"
                  : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            placeholder="Search company or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      {/* Client Pipeline List */}
      <Card className="overflow-hidden border-[var(--border)]">
        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--muted)]">
            Loading freelance pipeline...
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] mx-auto flex items-center justify-center text-[var(--muted)]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                No clients found in this view
              </p>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                {searchQuery || stageFilter !== "All"
                  ? "Try clearing your search filters."
                  : "Add your first freelance outreach lead to start tracking its 7-stage lifecycle."}
              </p>
            </div>
            {onOpenQuickAddLead && (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenQuickAddLead}
                className="text-xs inline-flex items-center gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Lead</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-hover)]/40 text-[var(--muted)] border-b border-[var(--border)] text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Company &amp; Contact</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Milestone Due</th>
                  <th className="py-3 px-4">Outreached</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {clients.map((client) => (
                  <tr
                    key={client._id}
                    className="hover:bg-[var(--surface-hover)]/30 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/freelance/clients/${client._id}`}
                        className="font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors block"
                      >
                        {client.companyName}
                      </Link>
                      <div className="text-[11px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                        <span>{client.contactName}</span>
                        {client.location && (
                          <>
                            <span>•</span>
                            <span>{client.location}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[var(--muted)]">
                      {client.leadSource}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={STAGE_BADGE_VARIANTS[client.currentStage]}
                        className="text-[11px] font-medium"
                      >
                        {client.currentStage}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      {client.stageDueDate ? (
                        <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{formatDate(client.stageDueDate)}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--muted)] italic">Not set</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[var(--muted)]">
                      {formatDate(client.outreachDate)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/freelance/clients/${client._id}`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-[11px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ArrowUpRight className="w-3 h-3 text-[var(--muted)] group-hover:text-[var(--foreground)]" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

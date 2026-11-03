"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClientDate } from "@/hooks/use-client-date";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Textarea from "@/components/ui/textarea";
import StatusSelect from "@/components/ui/status-select";
import ConfirmModal from "@/components/ui/confirm-modal";
import Badge from "@/components/ui/badge";
import FollowUpDraftModal from "@/components/shared/follow-up-draft-modal";
import { ArrowLeft, Trash2, ExternalLink, Mail, Check, CalendarPlus, X, Clock } from "lucide-react";
import { ApplicationStatus } from "@/lib/constants";
import { IApplication } from "@/types/application";
import { IApplicationEvent } from "@/types/application-event";
import { IDetectedEmail } from "@/types/detected-email";

interface ApplicationDetailProps {
  id: string;
}

export default function ApplicationDetail({ id }: ApplicationDetailProps) {
  const router = useRouter();
  const { formatDate, formatTime, todayString } = useClientDate();

  const [application, setApplication] = useState<IApplication | null>(null);
  const [timeline, setTimeline] = useState<IApplicationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [actingFollowUp, setActingFollowUp] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<IDetectedEmail | null>(null);
  const [emailActing, setEmailActing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appRes, emailRes] = await Promise.all([
        fetch(`/api/applications/${id}`),
        fetch("/api/gmail/emails?status=pending"),
      ]);

      const [appJson, emailJson] = await Promise.all([
        appRes.json(),
        emailRes.json().catch(() => ({})),
      ]);

      if (appJson.success && appJson.data) {
        setApplication(appJson.data.application);
        setTimeline(appJson.data.timeline || []);
        setNotesValue(appJson.data.application.notes || "");
      }

      if (emailJson.success && Array.isArray(emailJson.data)) {
        const match = emailJson.data.find(
          (e: IDetectedEmail) =>
            (typeof e.matchedApplicationId === "object" && e.matchedApplicationId !== null
              ? (e.matchedApplicationId as { _id?: string })._id?.toString()
              : e.matchedApplicationId?.toString()) === id
        );
        setPendingEmail(match || null);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setApplication((prev) => (prev ? { ...prev, status: newStatus } : prev));
        loadData();
      }
    } catch {
      // silent
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue }),
      });
      const json = await res.json();
      if (json.success) {
        setApplication((prev) => (prev ? { ...prev, notes: notesValue } : prev));
        setEditingNotes(false);
      }
    } catch {
      // silent
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        router.push("/applications");
      }
    } catch {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFollowUpAction = async (action: "complete" | "postpone" | "dismiss", days = 3) => {
    if (!application) return;
    setActingFollowUp(true);
    try {
      const res = await fetch(`/api/follow-up/${application._id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, days, clientDate: todayString }),
      });
      const json = await res.json();
      if (json.success) {
        await loadData();
      }
    } catch {
      // silent
    } finally {
      setActingFollowUp(false);
    }
  };

  const handleConfirmPendingEmail = async (applySuggestedStatus: boolean) => {
    if (!pendingEmail) return;
    setEmailActing(true);
    try {
      const res = await fetch(`/api/gmail/emails/${pendingEmail._id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applySuggestedStatus, applicationId: id }),
      });
      const json = await res.json();
      if (json.success) {
        setPendingEmail(null);
        await loadData();
      }
    } catch {
      // silent
    } finally {
      setEmailActing(false);
    }
  };

  const handleDismissPendingEmail = async () => {
    if (!pendingEmail) return;
    setEmailActing(true);
    try {
      const res = await fetch(`/api/gmail/emails/${pendingEmail._id}/dismiss`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setPendingEmail(null);
      }
    } catch {
      // silent
    } finally {
      setEmailActing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--muted)] animate-pulse">
        Loading application details...
      </div>
    );
  }

  if (!application) {
    return (
      <Card className="text-center py-12 space-y-3">
        <p className="text-sm font-semibold text-[var(--foreground)]">Application not found</p>
        <Link href="/applications" className="text-xs text-[var(--accent-text)] hover:underline">
          ← Back to applications
        </Link>
      </Card>
    );
  }

  const catName =
    typeof application.categoryId === "object" && application.categoryId !== null && "name" in application.categoryId
      ? (application.categoryId as { name: string }).name
      : "General";

  return (
    <div className="space-y-6 w-full">
      {/* Top back navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <Link
          href="/applications"
          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to applications
        </Link>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove Application
        </Button>
      </div>

      {/* Fluid Multi-Column Layout matching Today & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Primary Section (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Detected Recruiter Email Banner (Module 4.4, 4.5) */}
          {pendingEmail && (
            <Card className="p-4 border-amber-500/40 bg-amber-950/15 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      New recruitment email detected: &ldquo;{pendingEmail.subject}&rdquo;
                    </p>
                    <p className="text-[11px] text-[var(--muted)] line-clamp-2 italic">
                      &ldquo;{pendingEmail.snippet}&rdquo;
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    pendingEmail.category === "interview"
                      ? "progress"
                      : pendingEmail.category === "offer"
                      ? "offer"
                      : pendingEmail.category === "rejection"
                      ? "rejected"
                      : "applied"
                  }
                >
                  {pendingEmail.category.toUpperCase()}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-amber-500/20 text-xs">
                <span className="text-[11px] text-[var(--muted)]">
                  {pendingEmail.suggestedStatus
                    ? `Suggested status: ${pendingEmail.suggestedStatus}`
                    : "Recruiter response detected"}
                </span>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={emailActing}
                    onClick={handleDismissPendingEmail}
                    className="text-xs text-[var(--muted)] hover:text-red-400"
                  >
                    Dismiss
                  </Button>

                  {pendingEmail.suggestedStatus ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={emailActing}
                      onClick={() => handleConfirmPendingEmail(true)}
                      className="text-xs font-semibold shadow-xs"
                    >
                      Confirm &amp; Set to {pendingEmail.suggestedStatus}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      loading={emailActing}
                      onClick={() => handleConfirmPendingEmail(false)}
                      className="text-xs"
                    >
                      Link Email to Timeline
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Main Info Card */}
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--border)]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)]">
                    {catName}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    Logged on {formatDate(application.appliedDate)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                  {application.company}
                </h1>
                <p className="text-sm text-[var(--muted)]">{application.role}</p>
              </div>

              <div className="flex items-center gap-3">
                <StatusSelect
                  value={application.status}
                  onChange={handleStatusChange}
                />
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-[var(--muted)] uppercase tracking-wider text-[10px]">
                  Compensation
                </span>
                <p className="text-[var(--foreground)] text-sm font-medium">
                  {application.salary || "Not specified"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-[var(--muted)] uppercase tracking-wider text-[10px]">
                  Contact Person
                </span>
                <p className="text-[var(--foreground)] text-sm font-medium">
                  {application.recruiterName || "None specified"}
                  {application.recruiterEmail ? ` (${application.recruiterEmail})` : ""}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="font-semibold text-[var(--muted)] uppercase tracking-wider text-[10px]">
                  Job Listing
                </span>
                {application.jobUrl ? (
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--accent-text)] hover:underline inline-flex items-center gap-1 text-sm truncate max-w-full"
                  >
                    <span className="truncate">{application.jobUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <p className="text-[var(--muted-light)] text-sm">None provided</p>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="pt-5 border-t border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                  Personal notes
                </h2>
                {!editingNotes && (
                  <button
                    type="button"
                    onClick={() => setEditingNotes(true)}
                    className="text-xs font-medium text-[var(--accent-text)] hover:underline cursor-pointer"
                  >
                    Edit notes
                  </button>
                )}
              </div>

              {editingNotes ? (
                <div className="space-y-2.5">
                  <Textarea
                    rows={4}
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Personal thoughts, portfolio variant, interview impressions, referral..."
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setNotesValue(application.notes || "");
                        setEditingNotes(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNotes}
                      loading={savingNotes}
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--foreground)] bg-[var(--surface-hover)] p-4 rounded-xl border border-[var(--border)] whitespace-pre-wrap leading-relaxed">
                  {application.notes || "No notes added yet."}
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Rail: Follow-Up & Timeline (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Follow-up Status Card */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                  Follow-up reminder
                </h2>
              </div>
              {application.followUpCompleted ? (
                <Badge variant="applied">Completed</Badge>
              ) : application.followUpDismissed ? (
                <Badge variant="default">Dismissed</Badge>
              ) : ["Offer", "Rejected", "Withdrawn"].includes(application.status) ? (
                <Badge variant="default">Inactive</Badge>
              ) : (application.status === "Follow-up Needed" || (application.followUpDate && todayString && new Date(application.followUpDate).toISOString().slice(0, 10) <= todayString)) ? (
                <Badge variant="followup">Due Now</Badge>
              ) : (
                <Badge variant="default">Scheduled</Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {application.followUpDate ? formatDate(application.followUpDate) : "None scheduled"}
              </p>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                {application.followUpCompleted
                  ? "Follow-up has been marked as completed for this application."
                  : application.followUpDismissed
                  ? "Follow-up reminder for this application has been dismissed."
                  : ["Offer", "Rejected", "Withdrawn"].includes(application.status)
                  ? "Follow-up is not required for terminal statuses."
                  : (application.status === "Follow-up Needed" || (application.followUpDate && todayString && new Date(application.followUpDate).toISOString().slice(0, 10) <= todayString))
                  ? "Action recommended: Send a polite check-in email."
                  : "Automatically calculated based on your application date (+7 days)."}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full justify-center text-xs flex items-center gap-1.5"
                onClick={() => setIsDraftModalOpen(true)}
              >
                <Mail className="w-3.5 h-3.5" />
                Draft Follow-Up Email
              </Button>

              {!application.followUpCompleted && !["Offer", "Rejected", "Withdrawn"].includes(application.status) && (
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[11px] px-1 justify-center flex items-center gap-1"
                    loading={actingFollowUp}
                    onClick={() => handleFollowUpAction("complete")}
                    title="Mark follow-up completed"
                  >
                    <Check className="w-3 h-3" />
                    Done
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[11px] px-1 justify-center flex items-center gap-1"
                    loading={actingFollowUp}
                    onClick={() => handleFollowUpAction("postpone", 3)}
                    title="Postpone follow-up by 3 days"
                  >
                    <CalendarPlus className="w-3 h-3" />
                    +3d
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[11px] px-1 justify-center text-[var(--muted)] hover:text-[var(--danger)] flex items-center gap-1"
                    loading={actingFollowUp}
                    onClick={() => handleFollowUpAction("dismiss")}
                    title="Dismiss reminder"
                  >
                    <X className="w-3 h-3" />
                    Dismiss
                  </Button>
                </div>
              )}

              {application.followUpCompleted && !["Offer", "Rejected", "Withdrawn"].includes(application.status) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 pt-1"
                  loading={actingFollowUp}
                  onClick={() => handleFollowUpAction("postpone", 7)}
                  title="Schedule another follow-up in 7 days"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Schedule Next Follow-Up (+7d)
                </Button>
              )}

              {application.followUpDismissed && !["Offer", "Rejected", "Withdrawn"].includes(application.status) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 pt-1"
                  loading={actingFollowUp}
                  onClick={() => handleFollowUpAction("postpone", 3)}
                  title="Reactivate follow-up reminder"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Reactivate Reminder (+3d)
                </Button>
              )}
            </div>
          </Card>

          {/* Timeline Card */}
          <Card className="p-5 space-y-4">
            <h2 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
              Timeline &amp; Activity
            </h2>

            {timeline.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">No activity logged.</p>
            ) : (
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
                {timeline.map((event) => (
                  <div key={event._id?.toString()} className="relative text-xs space-y-0.5">
                    <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)]" />
                    <p className="font-medium text-[var(--foreground)] leading-snug">
                      {event.description}
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">
                      {formatDate(event.createdAt)} at {formatTime(event.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Reusable Confirm Modal for Deletion */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Application"
        message={`Are you sure you want to remove ${application.company} (${application.role})? This action cannot be undone.`}
        confirmText="Remove Application"
        cancelText="Keep Application"
        variant="danger"
        loading={deleting}
      />

      {/* Follow-Up Email Draft Generator Modal */}
      <FollowUpDraftModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        application={application}
        onMarkDone={async () => {
          await handleFollowUpAction("complete");
          setIsDraftModalOpen(false);
        }}
      />
    </div>
  );
}

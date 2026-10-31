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
import { ApplicationStatus } from "@/lib/constants";
import { IApplication } from "@/types/application";
import { IApplicationEvent } from "@/types/application-event";

interface ApplicationDetailProps {
  id: string;
}

export default function ApplicationDetail({ id }: ApplicationDetailProps) {
  const router = useRouter();
  const { formatDate, formatTime } = useClientDate();

  const [application, setApplication] = useState<IApplication | null>(null);
  const [timeline, setTimeline] = useState<IApplicationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setApplication(json.data.application);
        setTimeline(json.data.timeline || []);
        setNotesValue(json.data.application.notes || "");
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
          <span>←</span> Back to applications
        </Link>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
        >
          Remove Application
        </Button>
      </div>

      {/* Fluid Multi-Column Layout matching Today & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Primary Section (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
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
                    className="text-[var(--accent-text)] hover:underline block truncate text-sm"
                  >
                    {application.jobUrl}
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
          <Card className="p-5 space-y-3">
            <h2 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
              Follow-up reminder
            </h2>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {application.followUpDate ? formatDate(application.followUpDate) : "None scheduled"}
              </p>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Automatically calculated based on your application date (+7 days).
              </p>
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
    </div>
  );
}

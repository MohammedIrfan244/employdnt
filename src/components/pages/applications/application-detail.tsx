"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClientDate } from "@/hooks/use-client-date";
import { APPLICATION_STATUSES, ApplicationStatus } from "@/lib/constants";
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
        loadData(); // Reload timeline
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this application?")) return;

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
    }
  };

  if (loading) {
    return (
      <div className="p-12 border border-zinc-100 rounded-xl bg-zinc-50 text-center text-xs text-zinc-400 animate-pulse">
        Loading application details...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-12 rounded-xl border border-dashed border-zinc-200 bg-white text-center space-y-3">
        <p className="text-sm font-semibold text-zinc-800">Application not found</p>
        <Link href="/applications" className="text-xs text-emerald-700 hover:underline">
          ← Back to all applications
        </Link>
      </div>
    );
  }

  const catName =
    typeof application.categoryId === "object" && application.categoryId !== null && "name" in application.categoryId
      ? (application.categoryId as { name: string }).name
      : "General";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top back navigation & actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
        >
          ← Back to applications
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
        >
          {deleting ? "Deleting..." : "Delete Application"}
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                {catName}
              </span>
              <span className="text-xs text-zinc-400">
                Applied on {formatDate(application.appliedDate)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mt-1">{application.company}</h1>
            <p className="text-sm text-zinc-600">{application.role}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-500">Status:</span>
            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 focus:outline-none cursor-pointer"
            >
              {APPLICATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Follow-up info */}
          <div className="space-y-1">
            <span className="font-semibold text-zinc-500">Follow-up Target</span>
            <p className="text-zinc-800">
              {application.followUpDate ? formatDate(application.followUpDate) : "None scheduled"}
            </p>
          </div>

          {/* Salary */}
          <div className="space-y-1">
            <span className="font-semibold text-zinc-500">Compensation / Salary</span>
            <p className="text-zinc-800">{application.salary || "Not specified"}</p>
          </div>

          {/* Listing URL */}
          <div className="space-y-1">
            <span className="font-semibold text-zinc-500">Job Listing</span>
            {application.jobUrl ? (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline block truncate"
              >
                {application.jobUrl}
              </a>
            ) : (
              <p className="text-zinc-400">No URL provided</p>
            )}
          </div>

          {/* Recruiter / Contact */}
          <div className="space-y-1">
            <span className="font-semibold text-zinc-500">Contact / Recruiter</span>
            <p className="text-zinc-800">
              {application.recruiterName || "None"}
              {application.recruiterEmail ? ` (${application.recruiterEmail})` : ""}
            </p>
          </div>
        </div>

        {/* Notes Section */}
        <div className="pt-4 border-t border-zinc-100 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Notes</h2>
            {!editingNotes && (
              <button
                type="button"
                onClick={() => setEditingNotes(true)}
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                Edit Notes
              </button>
            )}
          </div>

          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                className="w-full p-2.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600 resize-none"
                placeholder="Add any personal notes, referral context..."
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNotesValue(application.notes || "");
                    setEditingNotes(false);
                  }}
                  className="px-3 py-1 text-xs text-zinc-600 rounded border border-zinc-200 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  {savingNotes ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 whitespace-pre-wrap">
              {application.notes || "No notes added yet."}
            </p>
          )}
        </div>
      </div>

      {/* Module 2.6: Timeline (Chronological Audit Trail) */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Timeline & Activity</h2>

        {timeline.length === 0 ? (
          <p className="text-xs text-zinc-400">No activity logged.</p>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100">
            {timeline.map((event) => (
              <div key={event._id?.toString()} className="relative text-xs space-y-0.5">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                <p className="font-semibold text-zinc-800">{event.description}</p>
                <p className="text-[10px] text-zinc-400">
                  {formatDate(event.createdAt)} at {formatTime(event.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


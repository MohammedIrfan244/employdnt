"use client";

import React, { useState, useEffect } from "react";
import { useClientDate } from "@/hooks/use-client-date";
import { ICategory } from "@/types/category";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickAddModal({ isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const { todayString } = useClientDate();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Three required fields
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Expandable optional fields
  const [showOptional, setShowOptional] = useState(false);
  const [jobUrl, setJobUrl] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch categories when opened
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (mounted && json.success && Array.isArray(json.data)) {
          setCategories(json.data);
          if (json.data.length > 0 && !categoryId) {
            setCategoryId(json.data[0]._id.toString());
          }
        }
      } catch {
        // silent error fallback
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    }
    loadCategories();

    return () => {
      mounted = false;
    };
  }, [isOpen, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!company.trim()) {
      setErrorMessage("Company name is required");
      return;
    }
    if (!role.trim()) {
      setErrorMessage("Job role is required");
      return;
    }
    if (!categoryId) {
      setErrorMessage("Category is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        company: company.trim(),
        role: role.trim(),
        categoryId,
        jobUrl: jobUrl.trim() || undefined,
        recruiterName: recruiterName.trim() || undefined,
        recruiterEmail: recruiterEmail.trim() || undefined,
        salary: salary.trim() || undefined,
        notes: notes.trim() || undefined,
        clientDate: todayString, // Pass client local date
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add application");
      }

      // Reset form
      setCompany("");
      setRole("");
      setJobUrl("");
      setRecruiterName("");
      setRecruiterEmail("");
      setSalary("");
      setNotes("");
      setShowOptional(false);

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Add Application</h2>
            <p className="text-xs text-zinc-500">Record a new job submission in seconds</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* 3 Core Required Fields */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              autoFocus
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Job Role *</label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCategories || categories.length === 0}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              {loadingCategories ? (
                <option>Loading categories...</option>
              ) : categories.length === 0 ? (
                <option>No categories found</option>
              ) : (
                categories.map((c) => (
                  <option key={c._id?.toString()} value={c._id?.toString()}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Collapsible Optional Section */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{showOptional ? "▼ Hide optional details" : "▶ Add more details (optional)"}</span>
            </button>

            {showOptional && (
              <div className="mt-3 space-y-3 pt-3 border-t border-zinc-100">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Job Listing URL</label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Recruiter Name</label>
                    <input
                      type="text"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-600 mb-1">Recruiter Email</label>
                    <input
                      type="email"
                      value={recruiterEmail}
                      onChange={(e) => setRecruiterEmail(e.target.value)}
                      placeholder="e.g. sarah@acme.com"
                      className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Salary / Compensation</label>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. $120k - $140k"
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-600 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes about referrals, questions asked..."
                    className="w-full px-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-800 rounded-lg border border-zinc-200 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

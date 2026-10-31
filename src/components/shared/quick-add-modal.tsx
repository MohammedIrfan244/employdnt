"use client";

import React, { useState, useEffect } from "react";
import { useClientDate } from "@/hooks/use-client-date";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
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
        // silent
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
      setErrorMessage("Company name is needed");
      return;
    }
    if (!role.trim()) {
      setErrorMessage("Job role is needed");
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
        clientDate: todayString,
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

      // Reset
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

  const categoryOptions = categories.map((c) => ({
    value: c._id?.toString() || "",
    label: c.name,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">Log an application</h2>
            <p className="text-xs text-[var(--muted)]">Takes just a few seconds</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] p-1 rounded-md text-sm transition-colors"
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
          <Input
            label="Company *"
            autoFocus
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Linear, Spotify, Local Studio"
          />

          <Input
            label="Role *"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Fullstack Engineer"
          />

          <Select
            label="Category *"
            value={categoryId}
            onChange={(val) => setCategoryId(val)}
            options={categoryOptions}
            placeholder={loadingCategories ? "Loading categories..." : undefined}
          />

          {/* Collapsible Optional Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1"
            >
              <span>{showOptional ? "▾ Hide extra details" : "▸ Add extra details (salary, link, notes)"}</span>
            </button>

            {showOptional && (
              <div className="mt-3 space-y-3 pt-3 border-t border-[var(--border-light)]">
                <Input
                  label="Listing link"
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Contact name"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    placeholder="Recruiter name"
                  />
                  <Input
                    label="Contact email"
                    type="email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="email@company.com"
                  />
                </div>

                <Input
                  label="Salary / Pay"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $130k or $65/hr"
                />

                <Textarea
                  label="Notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Referral name, portfolio variant used..."
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[var(--border-light)]">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Save Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

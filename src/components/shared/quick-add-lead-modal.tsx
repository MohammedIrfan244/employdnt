"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import {
  X,
  Building2,
  User,
  Globe,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useClientDate } from "@/hooks/use-client-date";
import { LeadSource, IClientDuplicateMatch } from "@/types/freelance-client";

interface QuickAddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LEAD_SOURCES: LeadSource[] = [
  "LinkedIn",
  "Google Maps",
  "Website",
  "Referral",
  "Cold Email",
  "Upwork",
  "Twitter/X",
  "Other",
];

export default function QuickAddLeadModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickAddLeadModalProps) {
  const { todayString } = useClientDate();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [website, setWebsite] = useState("");
  const [leadSource, setLeadSource] = useState<LeadSource>("LinkedIn");
  const [outreachDate, setOutreachDate] = useState("");
  const [stageDueDate, setStageDueDate] = useState("");
  const [initialNotes, setInitialNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Previous contact / duplicate check state
  const [duplicates, setDuplicates] = useState<IClientDuplicateMatch[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  useEffect(() => {
    if (todayString && !outreachDate) {
      setOutreachDate(todayString);
    }
  }, [todayString, outreachDate]);

  // Real-time debounced check if we have contacted this client before
  useEffect(() => {
    const trimmedComp = companyName.trim();
    const trimmedContact = contactName.trim();
    const trimmedEmail = email.trim();
    const trimmedWeb = website.trim();
    const trimmedMob = mobile.trim();

    if (
      trimmedComp.length < 2 &&
      trimmedContact.length < 2 &&
      trimmedEmail.length < 3 &&
      trimmedWeb.length < 3 &&
      trimmedMob.length < 7
    ) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicates(true);
      try {
        const params = new URLSearchParams();
        if (trimmedComp) params.set("companyName", trimmedComp);
        if (trimmedContact) params.set("contactName", trimmedContact);
        if (trimmedEmail) params.set("email", trimmedEmail);
        if (trimmedWeb) params.set("website", trimmedWeb);
        if (trimmedMob) params.set("mobile", trimmedMob);

        const res = await fetch(`/api/freelance/clients/check?${params.toString()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDuplicates(json.data);
          // If fresh matches appear, re-show warning
          if (json.data.length > 0) {
            setDismissedWarning(false);
          }
        }
      } catch {
        // silent
      } finally {
        setCheckingDuplicates(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [companyName, contactName, email, website, mobile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim()) {
      setError("Company name and contact person are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const submissionDate = outreachDate || todayString || "";

    try {
      const res = await fetch("/api/freelance/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactName,
          location,
          email,
          mobile,
          website,
          leadSource,
          outreachDate: submissionDate,
          stageDueDate: stageDueDate || undefined,
          initialNotes,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to create lead");
      }

      // Reset form
      setCompanyName("");
      setContactName("");
      setLocation("");
      setEmail("");
      setMobile("");
      setWebsite("");
      setInitialNotes("");
      setStageDueDate("");
      setDuplicates([]);
      setDismissedWarning(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-hover)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-text)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Add Freelance Lead
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Starts at stage 1 (Outreached) with evolving project tracking.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Real-time Duplicate / Previously Contacted Alert Banner */}
          {duplicates.length > 0 && !dismissedWarning && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5 text-xs animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-amber-300">
                    Previously Contacted Client Found ({duplicates.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissedWarning(true)}
                  className="text-[10px] text-amber-400/80 hover:text-amber-200 uppercase font-mono tracking-wider underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Records in your CRM already match this business or contact. You can view the existing record or continue creating this lead:
              </p>

              <div className="space-y-2 pt-0.5 max-h-44 overflow-y-auto">
                {duplicates.map((match) => (
                  <div
                    key={match._id}
                    className="p-2.5 bg-zinc-950/70 border border-amber-500/20 rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">
                          {match.companyName}
                        </span>
                        <Badge variant="interview" className="text-[9px] py-0 px-1.5">
                          Stage: {match.currentStage}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] truncate">
                        Contact: <span className="text-zinc-300">{match.contactName}</span>
                        {match.outreachDate && ` • First outreach: ${match.outreachDate}`}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {match.matchReasons.map((r, i) => (
                          <span
                            key={i}
                            className="text-[10px] text-amber-300/90 font-medium bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/20"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/freelance/clients/${match._id}`}
                      target="_blank"
                      className="shrink-0 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  Company Name *
                </span>
                {checkingDuplicates && (
                  <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                    Checking...
                  </span>
                )}
              </label>
              <Input
                placeholder="e.g. Acme Studio"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                Contact Name *
              </label>
              <Input
                placeholder="e.g. Sarah Connor"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="text-xs"
              />
            </div>
          </div>

          {/* Email & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--muted)]" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="sarah@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[var(--muted)]" />
                Mobile / Phone
              </label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)]">
                Location
              </label>
              <Input
                placeholder="e.g. San Francisco / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[var(--muted)]" />
                Website URL
              </label>
              <Input
                placeholder="https://acme.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Lead Source & Outreach Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)]">
                Lead Source
              </label>
              <Select
                value={leadSource}
                onChange={(val) => setLeadSource(val as LeadSource)}
                options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                Outreach Date
              </label>
              <Input
                type="date"
                value={outreachDate}
                onChange={(e) => setOutreachDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Stage Due Date (optional milestone) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground)]">
              Follow-up / Initial Response Due Date (Optional)
            </label>
            <Input
              type="date"
              value={stageDueDate}
              onChange={(e) => setStageDueDate(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Initial Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground)]">
              Initial Notes / Pitch Angle
            </label>
            <Textarea
              placeholder="e.g. Found on LinkedIn, pitched custom Next.js redesign for their agency showcase."
              rows={3}
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              Create Lead
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

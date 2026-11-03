"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Button from "@/components/ui/button";
import Textarea from "@/components/ui/textarea";
import Input from "@/components/ui/input";
import { IApplication } from "@/types/application";
import { useClientDate } from "@/hooks/use-client-date";
import { Mail, Copy, Check, ExternalLink, CheckCircle2, X } from "lucide-react";

interface FollowUpDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: IApplication | null;
  onMarkDone?: (applicationId: string) => void | Promise<void>;
}

type TemplateTone = "direct" | "short" | "value";

export default function FollowUpDraftModal({
  isOpen,
  onClose,
  application,
  onMarkDone,
}: FollowUpDraftModalProps) {
  const { formatDate } = useClientDate();
  const [tone, setTone] = useState<TemplateTone>("direct");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);

  // Calculate relative days
  const relativeDaysText = useMemo(() => {
    if (!application?.appliedDate) return "recently";
    const applied = new Date(application.appliedDate);
    const now = new Date();
    const diffDays = Math.max(1, Math.round((now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24)));
    if (diffDays === 1) return "yesterday";
    return `${diffDays} days ago`;
  }, [application?.appliedDate]);

  const appliedDateStr = useMemo(() => {
    return application?.appliedDate ? formatDate(application.appliedDate) : "a few days ago";
  }, [application?.appliedDate, formatDate]);

  const recruiterGreeting = useMemo(() => {
    if (application?.recruiterName && application.recruiterName.trim()) {
      return application.recruiterName.trim();
    }
    return "Hiring Team";
  }, [application?.recruiterName]);

  // Generate templates based on tone
  const generateDraft = useCallback(
    (selectedTone: TemplateTone) => {
      if (!application) return { subject: "", body: "" };

      const { company, role } = application;

      if (selectedTone === "short") {
        return {
          subject: `Follow-up: ${role} application (${company})`,
          body: `Hi ${recruiterGreeting},\n\nJust checking in briefly on the status of my application for the ${role} role at ${company} submitted on ${appliedDateStr}.\n\nI remain very interested in the position and would be happy to share any further details or work samples if helpful.\n\nBest,\n`,
        };
      }

      if (selectedTone === "value") {
        return {
          subject: `Checking in: ${role} at ${company}`,
          body: `Hi ${recruiterGreeting},\n\nI hope you're having a productive week.\n\nI wanted to touch base regarding my application for the ${role} role submitted ${relativeDaysText} (${appliedDateStr}). I continue to be very enthusiastic about what ${company} is building and would love to contribute.\n\nLooking forward to hearing from you regarding any next steps when you have a moment.\n\nBest regards,\n`,
        };
      }

      // Default: Direct & Polite
      return {
        subject: `Following up on my application for ${role} — ${company}`,
        body: `Hi ${recruiterGreeting},\n\nI hope you're doing well.\n\nI'm writing to follow up on my application for the ${role} position at ${company}, which I submitted ${relativeDaysText} on ${appliedDateStr}.\n\nI'm very excited about this opportunity and wanted to see if there are any updates regarding the next steps in your review process. Please let me know if you need any additional information from my side.\n\nThank you for your time and consideration.\n\nBest regards,\n`,
      };
    },
    [application, recruiterGreeting, appliedDateStr, relativeDaysText]
  );

  // Sync draft when tone or application changes
  useEffect(() => {
    if (application) {
      const draft = generateDraft(tone);
      setSubject(draft.subject);
      setBody(draft.body);
      setCopied(false);
    }
  }, [application, tone, generateDraft]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !application) return null;

  const handleCopy = async () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenEmailClient = () => {
    const to = application.recruiterEmail ? encodeURIComponent(application.recruiterEmail) : "";
    const sub = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    window.open(`mailto:${to}?subject=${sub}&body=${b}`, "_blank");
  };

  const handleDone = async () => {
    if (!onMarkDone || !application._id) return;
    setMarkingDone(true);
    try {
      await onMarkDone(application._id.toString());
      onClose();
    } finally {
      setMarkingDone(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border)] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                Follow-Up Email Draft
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              {application.company} • {application.role}
              {application.recruiterEmail && ` (${application.recruiterEmail})`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Draft Workspace */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Tone Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--muted)] font-medium">Tone:</span>
            <div className="inline-flex rounded-xl bg-[var(--surface)] p-1 border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setTone("direct")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  tone === "direct"
                    ? "bg-[var(--accent-light)] text-[var(--accent-text)] font-semibold shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Direct &amp; Polite
              </button>
              <button
                type="button"
                onClick={() => setTone("short")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  tone === "short"
                    ? "bg-[var(--accent-light)] text-[var(--accent-text)] font-semibold shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Short (2-3 Sentences)
              </button>
              <button
                type="button"
                onClick={() => setTone("value")}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  tone === "value"
                    ? "bg-[var(--accent-light)] text-[var(--accent-text)] font-semibold shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                Value-Focused
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <Input
            label="Email Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          {/* Email Body Field */}
          <Textarea
            label="Email Message"
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="font-mono text-xs leading-relaxed"
          />

          <p className="text-[11px] text-[var(--muted-light)] leading-relaxed italic">
            Note: Employdnt never sends emails automatically. Review and copy or open in your email client to send on your own terms.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onMarkDone && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDone}
                loading={markingDone}
                className="w-full sm:w-auto text-xs flex items-center justify-center gap-1.5"
                title="Mark this reminder as resolved"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Mark as Completed
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleOpenEmailClient}
              className="w-full sm:w-auto text-xs flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Email Client
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCopy}
              className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


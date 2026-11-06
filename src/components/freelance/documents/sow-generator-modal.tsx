"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { X, FileText, Printer, Check, Eye } from "lucide-react";
import { ISowDocumentData } from "@/types/freelance-client";
import DocumentViewerModal from "./document-viewer-modal";
import { useClientDate } from "@/hooks/use-client-date";

interface SowGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  initialData?: Partial<ISowDocumentData>;
  onSaveToClient?: (data: ISowDocumentData) => Promise<void>;
}

export default function SowGeneratorModal({
  isOpen,
  onClose,
  initialData,
  onSaveToClient,
}: SowGeneratorModalProps) {
  const { todayString } = useClientDate();

  // Editable fields with Developer Name as an input option
  const [developerName, setDeveloperName] = useState(initialData?.developerName || "Mohammed Irfan");
  const [developerEmail, setDeveloperEmail] = useState(initialData?.developerEmail || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [projectTitle, setProjectTitle] = useState(
    initialData?.projectTitle || (companyName ? `${companyName} Web Application` : "Custom Web Application")
  );
  const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || "");

  useEffect(() => {
    if (!effectiveDate && todayString) {
      setEffectiveDate(todayString);
    }
  }, [todayString, effectiveDate]);
  const [projectOverview, setProjectOverview] = useState(
    initialData?.projectOverview ||
      "Design, build, and deploy a production-grade web application tailored to the client's business workflows, focusing on performance, mobile responsiveness, and clean maintainable code."
  );
  const [coreDeliverablesText, setCoreDeliverablesText] = useState(
    initialData?.coreDeliverables?.join("\n") ||
      "Complete responsive frontend implementation in Next.js\nDatabase architecture & RESTful API endpoints\nAuthentication & role-based access control\nDeployment to production hosting environment with SSL"
  );
  const [outOfScopeText, setOutOfScopeText] = useState(
    initialData?.outOfScope?.join("\n") ||
      "Native mobile app store submissions (iOS/Android)\nThird-party API / SaaS monthly subscription fees\nOngoing content creation or marketing campaigns"
  );
  const [estimatedBudget, setEstimatedBudget] = useState(initialData?.estimatedBudget || 35000);
  const [currency, setCurrency] = useState(initialData?.currency || "INR");
  const [timelineWeeks, setTimelineWeeks] = useState(initialData?.timelineWeeks || 4);
  const [paymentTerms, setPaymentTerms] = useState(
    initialData?.paymentTerms || "50% upfront deposit to initiate development; 50% upon final staging acceptance prior to production DNS transfer."
  );
  const [revisionPolicy, setRevisionPolicy] = useState(
    initialData?.revisionPolicy || "Includes up to 2 rounds of design and functional revisions during the testing milestone."
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentDocData: ISowDocumentData = {
    developerName,
    developerEmail,
    clientName,
    companyName,
    projectTitle,
    effectiveDate,
    projectOverview,
    coreDeliverables: coreDeliverablesText.split("\n").map((s) => s.trim()).filter(Boolean),
    outOfScope: outOfScopeText.split("\n").map((s) => s.trim()).filter(Boolean),
    estimatedBudget: Number(estimatedBudget) || 0,
    currency,
    timelineWeeks: Number(timelineWeeks) || undefined,
    paymentTerms,
    revisionPolicy,
    generatedAt: new Date().toISOString(),
  };

  const handleSave = async () => {
    if (onSaveToClient) {
      setSaving(true);
      try {
        await onSaveToClient(currentDocData);
        onClose();
      } finally {
        setSaving(false);
      }
    } else {
      setIsPreviewOpen(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
        <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-hover)]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-text)]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--foreground)]">
                  Statement of Work (SOW) Generator
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Generates an official project scope agreement with printable PDF.
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
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {/* Developer Details (Input option) */}
            <div className="p-3 bg-[var(--surface-hover)]/40 border border-[var(--border)] rounded-xl space-y-3">
              <span className="font-bold text-[var(--foreground)] uppercase tracking-wider block text-[11px]">
                Developer Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Developer Name *</label>
                  <Input
                    value={developerName}
                    onChange={(e) => setDeveloperName(e.target.value)}
                    placeholder="Your Name"
                    className="text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Developer Email</label>
                  <Input
                    type="email"
                    value={developerEmail}
                    onChange={(e) => setDeveloperEmail(e.target.value)}
                    placeholder="dev@example.com"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="p-3 bg-[var(--surface-hover)]/40 border border-[var(--border)] rounded-xl space-y-3">
              <span className="font-bold text-[var(--foreground)] uppercase tracking-wider block text-[11px]">
                Client Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Client Contact Name *</label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Company Name *</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Project Title & Effective Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-[var(--foreground)]">Project Title *</label>
                <Input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Custom Next.js Platform"
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Effective Date</label>
                <Input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Project Overview */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)]">
                Project Overview &amp; Objective
              </label>
              <Textarea
                rows={3}
                value={projectOverview}
                onChange={(e) => setProjectOverview(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Core Deliverables (One per line) */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)] flex justify-between">
                <span>In-Scope Deliverables</span>
                <span className="text-[10px] text-[var(--muted)]">One per line</span>
              </label>
              <Textarea
                rows={4}
                value={coreDeliverablesText}
                onChange={(e) => setCoreDeliverablesText(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            {/* Out of Scope (One per line) */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)] flex justify-between">
                <span>Out-of-Scope (Boundaries)</span>
                <span className="text-[10px] text-[var(--muted)]">One per line</span>
              </label>
              <Textarea
                rows={3}
                value={outOfScopeText}
                onChange={(e) => setOutOfScopeText(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            {/* Budget, Currency & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Estimated Budget *</label>
                <Input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                  className="text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Currency</label>
                <Input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="INR"
                  className="text-xs uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Timeline (Weeks)</label>
                <Input
                  type="number"
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Payment Terms */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)]">Payment Terms</label>
              <Input
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Revision Policy */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)]">Revisions Policy</label>
              <Input
                value={revisionPolicy}
                onChange={(e) => setRevisionPolicy(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-[var(--surface-hover)]/30">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview &amp; Print Document</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              {onSaveToClient ? (
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={handleSave}
                  loading={saving}
                  className="text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Save &amp; Attach to Client
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-xs flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Export PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal for Print / PDF */}
      <DocumentViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Statement of Work — ${projectTitle}`}
        type="sow"
        data={currentDocData}
      />
    </>
  );
}

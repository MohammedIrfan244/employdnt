"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { X, FileText, Printer, Check, Eye } from "lucide-react";
import { IContractDocumentData } from "@/types/freelance-client";
import DocumentViewerModal from "./document-viewer-modal";
import { useClientDate } from "@/hooks/use-client-date";

interface ContractGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  initialData?: Partial<IContractDocumentData>;
  onSaveToClient?: (data: IContractDocumentData) => Promise<void>;
}

export default function ContractGeneratorModal({
  isOpen,
  onClose,
  initialData,
  onSaveToClient,
}: ContractGeneratorModalProps) {
  const { todayString } = useClientDate();

  // Editable fields with Developer Name as an input option
  const [developerName, setDeveloperName] = useState(initialData?.developerName || "Mohammed Irfan");
  const [developerEmail, setDeveloperEmail] = useState(initialData?.developerEmail || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [projectTitle, setProjectTitle] = useState(
    initialData?.projectTitle || (companyName ? `${companyName} Web Platform` : "Custom Web Platform")
  );
  const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || "");

  useEffect(() => {
    if (!effectiveDate && todayString) {
      setEffectiveDate(todayString);
    }
  }, [todayString, effectiveDate]);
  const [servicesDescription, setServicesDescription] = useState(
    initialData?.servicesDescription ||
      "The Developer agrees to perform bespoke software engineering, architecture, frontend/backend implementation, and production deployment services as described in the accompanying Statement of Work."
  );
  const [agreedAmount, setAgreedAmount] = useState(initialData?.agreedAmount || 45000);
  const [currency, setCurrency] = useState(initialData?.currency || "INR");
  const [paymentSchedule, setPaymentSchedule] = useState(
    initialData?.paymentSchedule ||
      "50% advance deposit upon agreement execution; 50% upon final staging demonstration and prior to production domain transfer."
  );
  const [ipOwnershipClause, setIpOwnershipClause] = useState(
    initialData?.ipOwnershipClause ||
      "Upon 100% full receipt of agreed payment, all intellectual property, source code, design assets, and copyrights created specifically for this project shall transfer unconditionally to the Client. The Developer retains the right to display the completed work in personal professional portfolios."
  );
  const [warrantyDays, setWarrantyDays] = useState(initialData?.warrantyDays || 30);
  const [governingLaw, setGoverningLaw] = useState(initialData?.governingLaw || "Standard International Commercial Law");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentDocData: IContractDocumentData = {
    developerName,
    developerEmail,
    clientName,
    companyName,
    projectTitle,
    effectiveDate,
    servicesDescription,
    agreedAmount: Number(agreedAmount) || 0,
    currency,
    paymentSchedule,
    ipOwnershipClause,
    warrantyDays: Number(warrantyDays) || 30,
    governingLaw,
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
                  Freelance Agreement (Contract) Generator
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Standard legal contract covering IP ownership, payment terms, and warranty.
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
            {/* Developer Details */}
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

            {/* Services Description */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)]">Description of Services</label>
              <Textarea
                rows={3}
                value={servicesDescription}
                onChange={(e) => setServicesDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Agreed Amount, Currency & Warranty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Agreed Fixed Amount *</label>
                <Input
                  type="number"
                  value={agreedAmount}
                  onChange={(e) => setAgreedAmount(Number(e.target.value))}
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
                <label className="font-medium text-[var(--foreground)]">Bug Warranty (Days)</label>
                <Input
                  type="number"
                  value={warrantyDays}
                  onChange={(e) => setWarrantyDays(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)]">Payment Schedule &amp; Terms</label>
              <Input
                value={paymentSchedule}
                onChange={(e) => setPaymentSchedule(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* IP Ownership */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)]">IP Ownership Transfer Clause</label>
              <Textarea
                rows={3}
                value={ipOwnershipClause}
                onChange={(e) => setIpOwnershipClause(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Governing Jurisdiction */}
            <div className="space-y-1">
              <label className="font-medium text-[var(--foreground)]">Governing Jurisdiction / Law</label>
              <Input
                value={governingLaw}
                onChange={(e) => setGoverningLaw(e.target.value)}
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
              <span>Preview &amp; Print Contract</span>
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
        title={`Freelance Agreement — ${projectTitle}`}
        type="contract"
        data={currentDocData}
      />
    </>
  );
}

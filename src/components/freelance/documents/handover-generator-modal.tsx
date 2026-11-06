"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { X, FileText, Check, Eye, Plus, Trash2 } from "lucide-react";
import { IHandoverDocumentData } from "@/types/freelance-client";
import DocumentViewerModal from "./document-viewer-modal";
import { useClientDate } from "@/hooks/use-client-date";

interface HandoverGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  initialData?: Partial<IHandoverDocumentData>;
  onSaveToClient?: (data: IHandoverDocumentData) => Promise<void>;
}

export default function HandoverGeneratorModal({
  isOpen,
  onClose,
  initialData,
  onSaveToClient,
}: HandoverGeneratorModalProps) {
  const { todayString } = useClientDate();

  // Editable fields with Developer Name as an input option
  const [developerName, setDeveloperName] = useState(initialData?.developerName || "Mohammed Irfan");
  const [developerEmail, setDeveloperEmail] = useState(initialData?.developerEmail || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [projectTitle, setProjectTitle] = useState(
    initialData?.projectTitle || (companyName ? `${companyName} Web Platform` : "Custom Web Platform")
  );
  const [handoverDate, setHandoverDate] = useState(initialData?.handoverDate || "");

  useEffect(() => {
    if (!handoverDate && todayString) {
      setHandoverDate(todayString);
    }
  }, [todayString, handoverDate]);

  const [productionUrl, setProductionUrl] = useState(initialData?.productionUrl || "");
  const [stagingUrl, setStagingUrl] = useState(initialData?.stagingUrl || "");
  const [repositoryUrl, setRepositoryUrl] = useState(initialData?.repositoryUrl || "");
  const [hostingProvider, setHostingProvider] = useState(initialData?.hostingProvider || "Vercel & Supabase");
  const [supportPeriodDays, setSupportPeriodDays] = useState(initialData?.supportPeriodDays || 30);
  const [supportEndDate, setSupportEndDate] = useState(initialData?.supportEndDate || "");
  const [maintenanceNotes, setMaintenanceNotes] = useState(
    initialData?.maintenanceNotes ||
      "Complimentary 30-day bug fix warranty covering any regressions against original specification. Post-warranty feature development or SLA maintenance will be billed under a separate monthly retainer."
  );

  const [checklist, setChecklist] = useState<Array<{ item: string; transferred: boolean }>>(
    initialData?.credentialsChecklist || [
      { item: "Production DNS records pointed to target nameservers", transferred: true },
      { item: "Production environment variables and secret API keys securely transferred", transferred: true },
      { item: "Admin / Superuser credentials created and verified with client", transferred: true },
      { item: "Source code repository transferred or collaborator access granted", transferred: true },
      { item: "Database backups configured and verified", transferred: false },
    ]
  );
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const currentDocData: IHandoverDocumentData = {
    developerName,
    developerEmail,
    clientName,
    companyName,
    projectTitle,
    handoverDate: handoverDate || todayString,
    productionUrl,
    stagingUrl,
    repositoryUrl,
    hostingProvider,
    credentialsChecklist: checklist,
    supportPeriodDays: Number(supportPeriodDays) || 30,
    supportEndDate,
    maintenanceNotes,
    generatedAt: new Date().toISOString(),
  };

  const toggleChecklistItem = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, transferred: !item.transferred } : item))
    );
  };

  const removeChecklistItem = (index: number) => {
    setChecklist((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist((prev) => [...prev, { item: newChecklistItem.trim(), transferred: true }]);
    setNewChecklistItem("");
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
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-zinc-950/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Generate Project Handover Spec</h2>
                <p className="text-xs text-[var(--muted)]">
                  Standard production delivery, asset transfer checklist & warranty sign-off
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--muted)] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            {/* Parties */}
            <div className="p-3 bg-zinc-900/50 border border-[var(--border)] rounded-xl space-y-3">
              <span className="font-semibold text-zinc-300 block">1. Parties & Metadata</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">
                    Developer Name <span className="text-emerald-400 font-normal">(editable)</span>
                  </label>
                  <Input
                    value={developerName}
                    onChange={(e) => setDeveloperName(e.target.value)}
                    placeholder="Developer full name"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Developer Email</label>
                  <Input
                    value={developerEmail}
                    onChange={(e) => setDeveloperEmail(e.target.value)}
                    placeholder="dev@example.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Client Name</label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client Contact Name"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Client / Company Name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Ltd."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Project Title</label>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Project Title"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Handover Date</label>
                  <Input
                    type="date"
                    value={handoverDate}
                    onChange={(e) => setHandoverDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Production & Deployment Endpoints */}
            <div className="p-3 bg-zinc-900/50 border border-[var(--border)] rounded-xl space-y-3">
              <span className="font-semibold text-zinc-300 block">2. Deployed Endpoints & Code Repositories</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Production URL</label>
                  <Input
                    value={productionUrl}
                    onChange={(e) => setProductionUrl(e.target.value)}
                    placeholder="https://app.clientdomain.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Staging / Preview URL</label>
                  <Input
                    value={stagingUrl}
                    onChange={(e) => setStagingUrl(e.target.value)}
                    placeholder="https://staging.clientdomain.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Hosting Platform</label>
                  <Input
                    value={hostingProvider}
                    onChange={(e) => setHostingProvider(e.target.value)}
                    placeholder="Vercel / AWS / DigitalOcean"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Repository URL</label>
                  <Input
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/client/repo"
                  />
                </div>
              </div>
            </div>

            {/* Credentials & Access Transfer Checklist */}
            <div className="p-3 bg-zinc-900/50 border border-[var(--border)] rounded-xl space-y-2">
              <span className="font-semibold text-zinc-300 block">3. Access & Asset Transfer Checklist</span>
              <div className="space-y-1.5">
                {checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 bg-zinc-950/60 border border-[var(--border)] rounded-lg"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={item.transferred}
                        onChange={() => toggleChecklistItem(idx)}
                        className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className={`text-xs ${item.transferred ? "text-zinc-200" : "text-zinc-400 line-through"}`}>
                        {item.item}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Add checklist item..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addChecklistItem}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Warranty & Maintenance */}
            <div className="p-3 bg-zinc-900/50 border border-[var(--border)] rounded-xl space-y-3">
              <span className="font-semibold text-zinc-300 block">4. Warranty & Support Period</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Warranty Days</label>
                  <Input
                    type="number"
                    value={supportPeriodDays}
                    onChange={(e) => setSupportPeriodDays(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Support End Date (Optional)</label>
                  <Input
                    type="date"
                    value={supportEndDate}
                    onChange={(e) => setSupportEndDate(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Maintenance & SLA Notes</label>
                  <Textarea
                    rows={3}
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-zinc-950/40">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview & Print</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="text-xs flex items-center gap-1.5"
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{onSaveToClient ? "Save to Client Record" : "View Document"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Document Viewer for instant preview / print */}
      <DocumentViewerModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Handover Document - ${projectTitle}`}
        type="handover"
        data={currentDocData}
      />
    </>
  );
}


"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import {
  IFreelanceResource,
  FreelanceResourceCategory,
} from "@/types/freelance-resource";
import {
  IFreelanceClient,
  ISowDocumentData,
  IContractDocumentData,
  IHandoverDocumentData,
} from "@/types/freelance-client";
import SowGeneratorModal from "@/components/freelance/documents/sow-generator-modal";
import ContractGeneratorModal from "@/components/freelance/documents/contract-generator-modal";
import HandoverGeneratorModal from "@/components/freelance/documents/handover-generator-modal";
import DocumentViewerModal from "@/components/freelance/documents/document-viewer-modal";
import {
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Pin,
  ClipboardList,
  Edit2,
  Save,
  FileText,
  FileCheck,
  Sparkles,
} from "lucide-react";

const CATEGORIES: Array<FreelanceResourceCategory | "All"> = [
  "All",
  "Requirement Form",
  "Contract & Legal",
  "Scope & SOW",
  "Proposal",
  "Checklist",
  "Other",
];

export default function FreelanceResourcesView() {
  const [resources, setResources] = useState<IFreelanceResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Clients list for document generators
  const [clients, setClients] = useState<IFreelanceClient[]>([]);
  const [selectedClientIdSow, setSelectedClientIdSow] = useState<string>("");
  const [selectedClientIdContract, setSelectedClientIdContract] = useState<string>("");
  const [selectedClientIdHandover, setSelectedClientIdHandover] = useState<string>("");

  // Document Generator Modals
  const [isSowModalOpen, setIsSowModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Viewer Modal
  const [viewerDoc, setViewerDoc] = useState<{
    isOpen: boolean;
    title: string;
    type: "sow" | "contract" | "handover";
    data: ISowDocumentData | IContractDocumentData | IHandoverDocumentData | null;
  }>({
    isOpen: false,
    title: "",
    type: "sow",
    data: null,
  });

  // Google Form specific state
  const [formUrl, setFormUrl] = useState(
    "https://docs.google.com/forms/d/e/1FAIpQLSc-sample-intake-form/viewform"
  );
  const [isEditingFormUrl, setIsEditingFormUrl] = useState(false);
  const [copiedFormUrl, setCopiedFormUrl] = useState(false);

  // New Resource Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState<FreelanceResourceCategory>("Contract & Legal");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [savingResource, setSavingResource] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/freelance/clients");
      const json = await res.json();
      if (json.success && json.data) {
        setClients(json.data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const fetchResources = useCallback(async () => {
    try {
      const url =
        activeCategory && activeCategory !== "All"
          ? `/api/freelance/resources?category=${encodeURIComponent(activeCategory)}`
          : "/api/freelance/resources";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setResources(json.data);
        // Find requirement form resource if present
        const formItem = (json.data as IFreelanceResource[]).find(
          (r) => r.category === "Requirement Form"
        );
        if (formItem) {
          setFormUrl(formItem.url);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleCopyFormUrl = () => {
    navigator.clipboard.writeText(formUrl);
    setCopiedFormUrl(true);
    setTimeout(() => setCopiedFormUrl(false), 2000);
  };

  const handleSaveFormUrl = async () => {
    setIsEditingFormUrl(false);
    // Find requirement form resource to update
    const formItem = resources.find((r) => r.category === "Requirement Form");
    if (formItem && formItem._id) {
      try {
        await fetch(`/api/freelance/resources/${formItem._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formUrl }),
        });
      } catch {
        // silent
      }
    }
  };

  const handleSaveSowToClient = async (data: ISowDocumentData) => {
    if (!selectedClientIdSow) return;
    try {
      await fetch(`/api/freelance/clients/${selectedClientIdSow}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoping: {
            sowData: data,
            budgetEstimate: data.estimatedBudget,
          },
        }),
      });
      setNotification("SOW generated and saved to client record!");
      setTimeout(() => setNotification(null), 3000);
      fetchClients();
    } catch {
      setNotification("Failed to save SOW to client");
    }
  };

  const handleSaveContractToClient = async (data: IContractDocumentData) => {
    if (!selectedClientIdContract) return;
    try {
      await fetch(`/api/freelance/clients/${selectedClientIdContract}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract: {
            contractData: data,
            agreedAmount: data.agreedAmount,
            signedDate: data.effectiveDate,
          },
        }),
      });
      setNotification("Contract generated and saved to client record!");
      setTimeout(() => setNotification(null), 3000);
      fetchClients();
    } catch {
      setNotification("Failed to save contract to client");
    }
  };

  const handleSaveHandoverToClient = async (data: IHandoverDocumentData) => {
    if (!selectedClientIdHandover) return;
    try {
      await fetch(`/api/freelance/clients/${selectedClientIdHandover}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          launch: {
            productionUrl: data.productionUrl,
            deploymentDate: data.handoverDate,
            handoverNotes: data.maintenanceNotes,
            handoverData: data,
          },
        }),
      });
      setNotification("Handover spec generated and saved to client record!");
      setTimeout(() => setNotification(null), 3000);
      fetchClients();
    } catch {
      setNotification("Failed to save handover to client");
    }
  };

  const handleTogglePin = async (resource: IFreelanceResource) => {
    try {
      const res = await fetch(`/api/freelance/resources/${resource._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !resource.isPinned }),
      });
      const json = await res.json();
      if (json.success) {
        setResources((prev) =>
          prev.map((r) =>
            r._id === resource._id ? { ...r, isPinned: !r.isPinned } : r
          )
        );
      }
    } catch {
      // silent
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const res = await fetch(`/api/freelance/resources/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setResources((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      // silent
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    setSavingResource(true);
    try {
      const res = await fetch("/api/freelance/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          url: newUrl,
          category: newCategory,
          description: newDescription,
          isPinned: newIsPinned,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResources((prev) => [json.data, ...prev]);
        setIsNewModalOpen(false);
        setNewTitle("");
        setNewUrl("");
        setNewDescription("");
        setNewIsPinned(false);
      }
    } catch {
      // silent
    } finally {
      setSavingResource(false);
    }
  };

  const selectedClientSow = clients.find((c) => c._id === selectedClientIdSow);
  const selectedClientContract = clients.find((c) => c._id === selectedClientIdContract);
  const selectedClientHandover = clients.find((c) => c._id === selectedClientIdHandover);

  const clientOptions = [
    { value: "", label: "-- Standalone / Unassigned --" },
    ...clients.map((c) => ({
      value: c._id || "",
      label: `${c.companyName} (${c.contactName})`,
    })),
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              Freelance Requirement Form &amp; Resources
            </h1>
            <Badge variant="applied" className="text-[10px] py-0.5 px-2">
              Modules 5 &amp; 6
            </Badge>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Store your client intake forms, legal agreements, SOW scopes, and project resources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource</span>
          </Button>
          <Link href="/freelance">
            <Button variant="ghost" size="sm" className="text-xs">
              Back to Pipeline
            </Button>
          </Link>
        </div>
      </div>

      {/* Document Generator Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
              Document Generators &amp; Templates
            </h2>
          </div>
          <span className="text-[11px] text-[var(--muted)]">
            Generate formal SOWs, contracts &amp; handover specs with printable PDF exports
          </span>
        </div>

        {notification && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Statement of Work (SOW) */}
          <Card className="p-4 border-amber-500/20 bg-amber-500/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  1. Scope &amp; SOW Document
                </span>
                <Badge variant="interview" className="text-[10px]">Scoping</Badge>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Define deliverables, out-of-scope boundaries, payment milestones &amp; timeline. Attached during Scoping stage.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <div>
                <label className="text-[10px] font-semibold text-[var(--muted)] block mb-1">
                  Assign to Client (Optional):
                </label>
                <Select
                  value={selectedClientIdSow}
                  onChange={setSelectedClientIdSow}
                  options={clientOptions}
                  className="text-xs"
                />
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsSowModalOpen(true)}
                className="w-full text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open SOW Generator</span>
              </Button>
            </div>
          </Card>

          {/* Card 2: Freelance Contract Agreement */}
          <Card className="p-4 border-emerald-500/20 bg-emerald-500/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  2. Freelance Contract
                </span>
                <Badge variant="offer" className="text-[10px]">Contract</Badge>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Formal developer agreement covering agreed amount, IP ownership transfer, confidentiality &amp; governing law.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <div>
                <label className="text-[10px] font-semibold text-[var(--muted)] block mb-1">
                  Assign to Client (Optional):
                </label>
                <Select
                  value={selectedClientIdContract}
                  onChange={setSelectedClientIdContract}
                  options={clientOptions}
                  className="text-xs"
                />
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsContractModalOpen(true)}
                className="w-full text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Contract Generator</span>
              </Button>
            </div>
          </Card>

          {/* Card 3: Project Handover Document */}
          <Card className="p-4 border-teal-500/20 bg-teal-500/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  3. Project Handover Spec
                </span>
                <Badge variant="applied" className="text-[10px]">Launch</Badge>
              </div>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Delivery document with credentials checklist, repository endpoints, deployment URLs &amp; 30-day warranty.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <div>
                <label className="text-[10px] font-semibold text-[var(--muted)] block mb-1">
                  Assign to Client (Optional):
                </label>
                <Select
                  value={selectedClientIdHandover}
                  onChange={setSelectedClientIdHandover}
                  options={clientOptions}
                  className="text-xs"
                />
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsHandoverModalOpen(true)}
                className="w-full text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Handover Generator</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Module 5: Client Requirement Form Hub */}
      <Card className="p-5 border-emerald-500/20 bg-emerald-500/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-text)]">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)]">
                Client Requirement Intake Form (Module 5)
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Reusable Google Forms link sent to clients during Scoping to gather full specs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFormUrl}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              {copiedFormUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>Copy Form URL</span>
                </>
              )}
            </button>

            <a href={formUrl} target="_blank" rel="noreferrer">
              <Button variant="primary" size="sm" className="text-xs flex items-center gap-1.5">
                <span>Open Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Current Form URL Bar */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-[var(--muted)] shrink-0">Current Form Link:</span>
          {isEditingFormUrl ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="text-xs"
              />
              <Button variant="primary" size="sm" onClick={handleSaveFormUrl} className="text-xs py-1">
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5">
              <span className="font-mono text-[var(--foreground)] truncate">{formUrl}</span>
              <button
                type="button"
                onClick={() => setIsEditingFormUrl(true)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] text-[11px] ml-2 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Edit URL
              </button>
            </div>
          )}
        </div>

        {/* Form Template Question Guide */}
        <div className="pt-2 border-t border-[var(--border)] space-y-2">
          <span className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider block">
            Recommended Intake Form Sections:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-[var(--muted)]">
            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-1">
              <span className="font-semibold text-[var(--foreground)] block">1. Company &amp; Contact</span>
              <p className="text-[11px] leading-relaxed">
                Company name, industry, primary decision-maker name, email, and billing location.
              </p>
            </div>

            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-1">
              <span className="font-semibold text-[var(--foreground)] block">2. Project Scope &amp; Tech</span>
              <p className="text-[11px] leading-relaxed">
                Problem statement, mandatory MVP features, reference benchmark links, and design assets (Figma).
              </p>
            </div>

            <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-1">
              <span className="font-semibold text-[var(--foreground)] block">3. Budget &amp; Timeline</span>
              <p className="text-[11px] leading-relaxed">
                Budget range (₹ INR), target launch date, and third-party integrations needed (Stripe, Supabase, etc.).
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Module 6: Resource Library & Legal Document Hub */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            Contracts, Proposals &amp; Templates (Module 6)
          </h2>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[var(--accent-light)] text-[var(--accent-text)] border border-[var(--accent-border)] font-bold shadow-xs"
                    : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--muted)]">
            Loading templates...
          </div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--muted)] space-y-2">
            <p>No resources found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <Card
                key={resource._id}
                className="p-4 space-y-3 hover:border-[var(--accent-border)] transition-colors group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="applied" className="text-[10px] py-0.5 px-2">
                      {resource.category}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(resource)}
                        title={resource.isPinned ? "Unpin resource" : "Pin to top"}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          resource.isPinned
                            ? "text-[var(--accent-text)]"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      {!resource.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(resource._id!)}
                          title="Delete resource"
                          className="p-1 rounded-md text-[var(--muted)] hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {resource.title}
                  </h3>

                  {resource.description && (
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {resource.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--muted)] font-mono truncate max-w-[200px]">
                    {resource.url}
                  </span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--accent-text)] hover:underline font-semibold"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Resource Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Add Freelance Document / Template Link
            </h3>

            <form onSubmit={handleCreateResource} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Title *</label>
                <Input
                  placeholder="e.g. Master Service Agreement (MSA)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Document / Resource URL *</label>
                <Input
                  placeholder="https://docs.google.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Category</label>
                <Select
                  value={newCategory}
                  onChange={(val) => setNewCategory(val as FreelanceResourceCategory)}
                  options={CATEGORIES.filter((c) => c !== "All").map((c) => ({
                    value: c,
                    label: c,
                  }))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Description</label>
                <Textarea
                  placeholder="Short notes about what this document covers..."
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="text-xs"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsPinned}
                  onChange={(e) => setNewIsPinned(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                />
                <span className="font-medium text-[var(--foreground)]">Pin to top of list</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={savingResource}
                >
                  Save Resource
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOW Document Generator Modal */}
      <SowGeneratorModal
        isOpen={isSowModalOpen}
        onClose={() => setIsSowModalOpen(false)}
        clientId={selectedClientIdSow || undefined}
        initialData={
          selectedClientSow
            ? {
                clientName: selectedClientSow.contactName,
                companyName: selectedClientSow.companyName,
                projectTitle: `${selectedClientSow.companyName} Web Application`,
                estimatedBudget: selectedClientSow.scoping?.budgetEstimate || 35000,
                currency: "INR",
                ...selectedClientSow.scoping?.sowData,
              }
            : { currency: "INR", estimatedBudget: 35000 }
        }
        onSaveToClient={selectedClientIdSow ? handleSaveSowToClient : undefined}
      />

      {/* Contract Agreement Generator Modal */}
      <ContractGeneratorModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        clientId={selectedClientIdContract || undefined}
        initialData={
          selectedClientContract
            ? {
                clientName: selectedClientContract.contactName,
                companyName: selectedClientContract.companyName,
                projectTitle: `${selectedClientContract.companyName} Web Application`,
                agreedAmount:
                  selectedClientContract.contract?.agreedAmount ||
                  selectedClientContract.scoping?.budgetEstimate ||
                  45000,
                currency: "INR",
                effectiveDate: selectedClientContract.contract?.signedDate,
                ...selectedClientContract.contract?.contractData,
              }
            : { currency: "INR", agreedAmount: 45000 }
        }
        onSaveToClient={selectedClientIdContract ? handleSaveContractToClient : undefined}
      />

      {/* Handover Spec Generator Modal */}
      <HandoverGeneratorModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        clientId={selectedClientIdHandover || undefined}
        initialData={
          selectedClientHandover
            ? {
                clientName: selectedClientHandover.contactName,
                companyName: selectedClientHandover.companyName,
                projectTitle: `${selectedClientHandover.companyName} Web Application`,
                productionUrl: selectedClientHandover.launch?.productionUrl,
                stagingUrl: selectedClientHandover.build?.stagingUrl,
                repositoryUrl: selectedClientHandover.build?.repositoryUrl,
                handoverDate: selectedClientHandover.launch?.deploymentDate,
                maintenanceNotes: selectedClientHandover.launch?.handoverNotes,
                ...selectedClientHandover.launch?.handoverData,
              }
            : undefined
        }
        onSaveToClient={selectedClientIdHandover ? handleSaveHandoverToClient : undefined}
      />

      {/* Universal Document Viewer Modal (Print / Save as PDF) */}
      <DocumentViewerModal
        isOpen={viewerDoc.isOpen}
        onClose={() => setViewerDoc((prev) => ({ ...prev, isOpen: false }))}
        title={viewerDoc.title}
        type={viewerDoc.type}
        data={viewerDoc.data}
      />
    </div>
  );
}

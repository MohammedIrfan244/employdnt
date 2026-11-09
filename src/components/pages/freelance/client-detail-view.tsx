"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useClientDate } from "@/hooks/use-client-date";
import {
  IFreelanceClient,
  FreelanceStage,
  FREELANCE_STAGES,
  ISowDocumentData,
  IContractDocumentData,
  IHandoverDocumentData,
} from "@/types/freelance-client";
import SowGeneratorModal from "@/components/freelance/documents/sow-generator-modal";
import ContractGeneratorModal from "@/components/freelance/documents/contract-generator-modal";
import HandoverGeneratorModal from "@/components/freelance/documents/handover-generator-modal";
import DocumentViewerModal from "@/components/freelance/documents/document-viewer-modal";
import {
  ArrowLeft,
  Building2,
  User,
  Globe,
  Mail,
  Calendar,
  CheckCircle2,
  Trash2,
  Sparkles,
  GitBranch,
  FileText,
  DollarSign,
  Code2,
  CheckSquare,
  Rocket,
  ShieldCheck,
  Clock,
  Upload,
  FileUp,
  FileCheck,
  Eye,
  Download,
} from "lucide-react";

interface ClientDetailViewProps {
  clientId: string;
}

export default function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const router = useRouter();
  const { formatDate } = useClientDate();

  const [client, setClient] = useState<IFreelanceClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [website, setWebsite] = useState("");
  const [currentStage, setCurrentStage] = useState<FreelanceStage>("Outreached");
  const [stageDueDate, setStageDueDate] = useState("");
  const [initialNotes, setInitialNotes] = useState("");

  // Scoping fields
  const [requirementsSummary, setRequirementsSummary] = useState("");
  const [scopeDocUrl, setScopeDocUrl] = useState("");
  const [scopeDocFileName, setScopeDocFileName] = useState("");
  const [sowData, setSowData] = useState<ISowDocumentData | undefined>();
  const [budgetEstimate, setBudgetEstimate] = useState<number | undefined>();
  const [uploadingSow, setUploadingSow] = useState(false);

  // Contract fields
  const [contractDocUrl, setContractDocUrl] = useState("");
  const [contractData, setContractData] = useState<IContractDocumentData | undefined>();
  const [agreedAmount, setAgreedAmount] = useState<number | undefined>();
  const [functionalRequirements, setFunctionalRequirements] = useState("");
  const [signedDate, setSignedDate] = useState("");

  // Build fields
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [stagingUrl, setStagingUrl] = useState("");
  const [developmentNotes, setDevelopmentNotes] = useState("");

  // Test fields
  const [testingUrl, setTestingUrl] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [bugLog, setBugLog] = useState("");

  // Launch fields
  const [productionUrl, setProductionUrl] = useState("");
  const [deploymentDate, setDeploymentDate] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [handoverData, setHandoverData] = useState<IHandoverDocumentData | undefined>();

  // Post-Launch fields
  const [supportPeriodMonths, setSupportPeriodMonths] = useState<number | undefined>();
  const [supportEndDate, setSupportEndDate] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");

  // Document Modals
  const [isSowGenOpen, setIsSowGenOpen] = useState(false);
  const [isContractGenOpen, setIsContractGenOpen] = useState(false);
  const [isHandoverGenOpen, setIsHandoverGenOpen] = useState(false);
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

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/freelance/clients/${clientId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const c: IFreelanceClient = json.data;
        setClient(c);
        setCompanyName(c.companyName || "");
        setContactName(c.contactName || "");
        setLocation(c.location || "");
        setEmail(c.email || "");
        setMobile(c.mobile || "");
        setWebsite(c.website || "");
        setCurrentStage(c.currentStage);
        setStageDueDate(c.stageDueDate || "");
        setInitialNotes(c.initialNotes || "");

        // Scoping
        setRequirementsSummary(c.scoping?.requirementsSummary || "");
        setScopeDocUrl(c.scoping?.scopeDocUrl || "");
        setScopeDocFileName(c.scoping?.scopeDocFileName || "");
        setSowData(c.scoping?.sowData);
        setBudgetEstimate(c.scoping?.budgetEstimate);

        // Contract
        setContractDocUrl(c.contract?.contractDocUrl || "");
        setContractData(c.contract?.contractData);
        setAgreedAmount(c.contract?.agreedAmount);
        setFunctionalRequirements(c.contract?.functionalRequirements || "");
        setSignedDate(c.contract?.signedDate || "");

        // Build
        setRepositoryUrl(c.build?.repositoryUrl || "");
        setStagingUrl(c.build?.stagingUrl || "");
        setDevelopmentNotes(c.build?.developmentNotes || "");

        // Test
        setTestingUrl(c.test?.testingUrl || "");
        setFeedbackNotes(c.test?.feedbackNotes || "");
        setBugLog(c.test?.bugLog || "");

        // Launch
        setProductionUrl(c.launch?.productionUrl || "");
        setDeploymentDate(c.launch?.deploymentDate || "");
        setHandoverNotes(c.launch?.handoverNotes || "");
        setHandoverData(c.launch?.handoverData);

        // Post-Launch
        setSupportPeriodMonths(c.postLaunch?.supportPeriodMonths);
        setSupportEndDate(c.postLaunch?.supportEndDate || "");
        setMaintenanceNotes(c.postLaunch?.maintenanceNotes || "");
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleStageSelect = async (newStage: FreelanceStage) => {
    if (newStage === currentStage) return;
    setCurrentStage(newStage);
  };

  const handleSowFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSow(true);
    setSaveNotice(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setScopeDocUrl(json.url);
        setScopeDocFileName(json.fileName || file.name);
        setSaveNotice("SOW document uploaded successfully");
      } else {
        setSaveNotice(json.error || "Failed to upload document");
      }
    } catch {
      setSaveNotice("Network error during document upload");
    } finally {
      setUploadingSow(false);
      e.target.value = "";
      setTimeout(() => setSaveNotice(null), 3500);
    }
  };

  const handleSaveSow = async (data: ISowDocumentData) => {
    setSowData(data);
    if (data.estimatedBudget) {
      setBudgetEstimate(data.estimatedBudget);
    }
    try {
      const res = await fetch(`/api/freelance/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoping: {
            requirementsSummary,
            scopeDocUrl,
            scopeDocFileName,
            sowData: data,
            budgetEstimate: data.estimatedBudget,
          },
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setClient(json.data);
        setSaveNotice("SOW generated and saved to client record");
      }
    } catch {
      setSaveNotice("Error saving SOW data");
    } finally {
      setTimeout(() => setSaveNotice(null), 3500);
    }
  };

  const handleSaveContract = async (data: IContractDocumentData) => {
    setContractData(data);
    if (data.agreedAmount) {
      setAgreedAmount(data.agreedAmount);
    }
    if (data.effectiveDate) {
      setSignedDate(data.effectiveDate);
    }
    try {
      const res = await fetch(`/api/freelance/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract: {
            contractDocUrl,
            contractData: data,
            agreedAmount: data.agreedAmount,
            functionalRequirements,
            signedDate: data.effectiveDate,
          },
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setClient(json.data);
        setSaveNotice("Contract agreement generated & saved to client record");
      }
    } catch {
      setSaveNotice("Error saving contract data");
    } finally {
      setTimeout(() => setSaveNotice(null), 3500);
    }
  };

  const handleSaveHandover = async (data: IHandoverDocumentData) => {
    setHandoverData(data);
    if (data.productionUrl) {
      setProductionUrl(data.productionUrl);
    }
    if (data.handoverDate) {
      setDeploymentDate(data.handoverDate);
    }
    if (data.maintenanceNotes) {
      setHandoverNotes(data.maintenanceNotes);
    }
    try {
      const res = await fetch(`/api/freelance/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          launch: {
            productionUrl: data.productionUrl || productionUrl,
            deploymentDate: data.handoverDate || deploymentDate,
            handoverNotes: data.maintenanceNotes || handoverNotes,
            handoverData: data,
          },
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setClient(json.data);
        setSaveNotice("Handover document generated & saved to client record");
      }
    } catch {
      setSaveNotice("Error saving handover data");
    } finally {
      setTimeout(() => setSaveNotice(null), 3500);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveNotice(null);

    const payload: Partial<IFreelanceClient> = {
      companyName,
      contactName,
      location,
      email,
      mobile,
      website,
      currentStage,
      stageDueDate: stageDueDate || undefined,
      initialNotes,
      scoping: {
        requirementsSummary,
        scopeDocUrl,
        scopeDocFileName,
        sowData,
        budgetEstimate: budgetEstimate ? Number(budgetEstimate) : undefined,
      },
      contract: {
        contractDocUrl,
        contractData,
        agreedAmount: agreedAmount ? Number(agreedAmount) : undefined,
        functionalRequirements,
        signedDate,
      },
      build: {
        repositoryUrl,
        stagingUrl,
        developmentNotes,
      },
      test: {
        testingUrl,
        feedbackNotes,
        bugLog,
      },
      launch: {
        productionUrl,
        deploymentDate,
        handoverNotes,
        handoverData,
      },
      postLaunch: {
        supportPeriodMonths: supportPeriodMonths ? Number(supportPeriodMonths) : undefined,
        supportEndDate,
        maintenanceNotes,
      },
    };

    try {
      const res = await fetch(`/api/freelance/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setClient(json.data);
        setSaveNotice("Client record saved successfully");
      } else {
        setSaveNotice(json.error || "Failed to save client");
      }
    } catch {
      setSaveNotice("Network error saving changes");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveNotice(null), 3500);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/freelance/clients/${clientId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        router.push("/freelance");
      }
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--muted)]">
        Loading client record...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm font-semibold text-[var(--foreground)]">Client not found</p>
        <Link href="/freelance">
          <Button variant="secondary" size="sm" className="text-xs">
            Return to Pipeline
          </Button>
        </Link>
      </div>
    );
  }

  const currentStageIndex = FREELANCE_STAGES.indexOf(currentStage);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="space-y-1">
          <Link
            href="/freelance"
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Freelance Pipeline</span>
          </Link>

          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
              {client.companyName}
            </h1>
            <Badge variant="applied" className="text-xs py-0.5 px-2.5">
              Stage {currentStageIndex + 1}: {currentStage}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)] pt-0.5">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {client.contactName}
            </span>
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {client.email}
              </a>
            )}
            {client.website && (
              <a
                href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Website
              </a>
            )}
            <span>Source: {client.leadSource}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/freelance/email-studio?company=${encodeURIComponent(
              client.companyName
            )}&recipient=${encodeURIComponent(client.contactName)}`}
          >
            <Button variant="secondary" size="sm" className="text-xs">
              <Mail className="w-3.5 h-3.5 text-[var(--accent-text)]" />
              <span>Compose Email</span>
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 bg-[var(--accent-light)] border border-[var(--accent-border)] rounded-xl text-xs text-[var(--accent-text)] font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Stage Progression Stepper */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[var(--accent-text)]" />
            <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
              Project Stage Progression
            </h2>
          </div>
          <span className="text-[11px] text-[var(--muted)]">
            Click any stage to move the engagement
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
          {FREELANCE_STAGES.map((stage, idx) => {
            const isCurrent = stage === currentStage;
            const isPast = idx < currentStageIndex;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => handleStageSelect(stage)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isCurrent
                    ? "bg-[var(--accent-light)] border-[var(--accent-border)] shadow-xs"
                    : isPast
                    ? "bg-[var(--surface-hover)]/60 border-[var(--border)] text-[var(--foreground)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)] opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-mono text-[var(--muted)]">0{idx + 1}</span>
                  {isPast && <CheckCircle2 className="w-3 h-3 text-[var(--accent-text)]" />}
                </div>
                <p
                  className={`text-xs font-semibold truncate ${
                    isCurrent ? "text-[var(--accent-text)] font-bold" : "text-[var(--foreground)]"
                  }`}
                >
                  {stage}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Form with Evolving Stage-Specific Fields */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Stage Data (2 Columns) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Stage 1: Initial Details & Outreach */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
                <Building2 className="w-4 h-4 text-[var(--accent-text)]" />
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  1. Initial Details &amp; Contact Info
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Company Name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Contact Person</label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Phone / Mobile</label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-[var(--foreground)]">Website</label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs pt-1">
                <label className="font-medium text-[var(--foreground)]">
                  Outreach / Initial Context Notes
                </label>
                <Textarea
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>
            </Card>

            {/* Stage 2: Scoping (Requirements, Scope Doc, Budget) */}
            {currentStageIndex >= 1 && (
              <Card
                className={`p-5 space-y-4 ${
                  sowData || scopeDocUrl || currentStageIndex > 1
                    ? currentStage === "Scoping"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-[var(--border)] bg-[var(--surface)]"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    {sowData || scopeDocUrl || currentStageIndex > 1 ? (
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-400" />
                    )}
                    <h3
                      className={`text-xs font-bold uppercase tracking-wider ${
                        sowData || scopeDocUrl || currentStageIndex > 1 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      2. Scoping Details &amp; SOW
                    </h3>
                  </div>
                  {currentStage === "Scoping" ? (
                    <Badge
                      variant={sowData || scopeDocUrl ? "offer" : "interview"}
                      className="text-[10px]"
                    >
                      Active Stage
                    </Badge>
                  ) : sowData || scopeDocUrl ? (
                    <Badge variant="offer" className="text-[10px]">
                      SOW Attached
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">
                      Project Requirements Summary
                    </label>
                    <Textarea
                      placeholder="Outline core client deliverables, user flows, and tech scope..."
                      value={requirementsSummary}
                      onChange={(e) => setRequirementsSummary(e.target.value)}
                      rows={3}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">
                      Estimated Budget (₹ INR)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={budgetEstimate ?? ""}
                      onChange={(e) =>
                        setBudgetEstimate(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="text-xs"
                    />
                  </div>

                  {/* SOW Document Section: When attached, shows clean single attached card just like Contract */}
                  <div className="pt-2 border-t border-[var(--border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-zinc-200 text-xs">
                          Statement of Work (SOW)
                        </span>
                      </div>
                      {(sowData || scopeDocUrl) && (
                        <Badge variant="offer" className="text-[10px]">
                          {sowData ? "SOW Specification Ready" : "PDF Attached"}
                        </Badge>
                      )}
                    </div>

                    {sowData ? (
                      /* Option 1 Attached: Form-Generated SOW */
                      <div className="p-3 bg-[var(--surface)] border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <span className="text-[10px] text-[var(--muted)] block">Developer</span>
                            <span className="font-medium text-emerald-300">
                              {sowData.developerName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[var(--muted)] block">Client</span>
                            <span className="font-medium text-emerald-300">
                              {sowData.clientName || client?.contactName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[var(--muted)] block">
                              Estimated Budget
                            </span>
                            <span className="font-medium text-emerald-300">
                              ₹{sowData.estimatedBudget?.toLocaleString("en-IN")}{" "}
                              {sowData.currency || "INR"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[var(--muted)] block">Timeline</span>
                            <span className="font-medium text-emerald-300">
                              {sowData.timelineWeeks
                                ? `${sowData.timelineWeeks} Weeks`
                                : "Milestone-based"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                setViewerDoc({
                                  isOpen: true,
                                  title: `SOW - ${companyName || contactName}`,
                                  type: "sow",
                                  data: sowData,
                                })
                              }
                              className="text-xs flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> View &amp; Print SOW (PDF)
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsSowGenOpen(true)}
                              className="text-xs"
                            >
                              Edit SOW Form
                            </Button>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              setSowData(undefined);
                              await fetch(`/api/freelance/clients/${clientId}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  scoping: {
                                    requirementsSummary,
                                    scopeDocUrl,
                                    scopeDocFileName,
                                    sowData: null,
                                    budgetEstimate,
                                  },
                                }),
                              });
                            }}
                            className="text-[11px] text-[var(--muted)] hover:text-red-400 cursor-pointer underline"
                          >
                            Switch / Upload PDF Instead
                          </button>
                        </div>
                      </div>
                    ) : scopeDocUrl ? (
                      /* Option 2 Attached: Uploaded Manual PDF */
                      <div className="p-3 bg-[var(--surface)] border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileUp className="w-4 h-4 text-emerald-400" />
                            <span className="font-medium text-[var(--foreground)]">
                              {scopeDocFileName || "SOW-Document.pdf"}
                            </span>
                            <Badge variant="offer" className="text-[10px]">
                              Attached PDF
                            </Badge>
                          </div>
                          <a
                            href={scopeDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={scopeDocFileName || "SOW-Document.pdf"}
                            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Download / View PDF
                          </a>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[11px]">
                          <label className="text-[var(--muted)] hover:text-white cursor-pointer underline">
                            Replace PDF
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              onChange={handleSowFileUpload}
                              disabled={uploadingSow}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              setScopeDocUrl("");
                              setScopeDocFileName("");
                              await fetch(`/api/freelance/clients/${clientId}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  scoping: {
                                    requirementsSummary,
                                    scopeDocUrl: "",
                                    scopeDocFileName: "",
                                    sowData,
                                    budgetEstimate,
                                  },
                                }),
                              });
                            }}
                            className="text-red-400 hover:underline cursor-pointer"
                          >
                            Remove Document
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Option 3: Neither Attached yet - Show dual choice */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Option A: Manual PDF Upload */}
                        <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2 flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 mb-1">
                              <FileUp className="w-3.5 h-3.5 text-amber-400" />
                              Manual PDF Document
                            </span>
                            <p className="text-[10px] text-[var(--muted)]">
                              Upload your custom SOW proposal as a PDF file.
                            </p>
                          </div>

                          <label className="flex flex-col items-center justify-center p-3 border border-dashed border-zinc-700 hover:border-amber-500/50 rounded-lg cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors">
                            <Upload className="w-4 h-4 text-amber-400 mb-1" />
                            <span className="text-xs text-zinc-300 font-medium">
                              {uploadingSow ? "Uploading PDF..." : "Upload Scope PDF"}
                            </span>
                            <span className="text-[10px] text-[var(--muted)]">
                              Select PDF from computer
                            </span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              onChange={handleSowFileUpload}
                              disabled={uploadingSow}
                            />
                          </label>
                        </div>

                        {/* Option B: Form SOW Generator */}
                        <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2 flex flex-col justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              Generate SOW Form
                            </span>
                            <p className="text-[10px] text-[var(--muted)]">
                              Generate standardized SOW with deliverables, budget &amp; terms.
                            </p>
                          </div>

                          <div className="pt-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setIsSowGenOpen(true)}
                              className="text-xs w-full flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Open SOW Generator</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Stage 3: Contract (Agreement, Amount, Functional Spec) */}
            {currentStageIndex >= 2 && (
              <Card className="p-5 space-y-4 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      3. Contract &amp; Pricing
                    </h3>
                  </div>
                  {currentStage === "Contract" && (
                    <Badge variant="offer" className="text-[10px]">Active Stage</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">Agreed Amount (₹ INR)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 75000"
                      value={agreedAmount ?? ""}
                      onChange={(e) =>
                        setAgreedAmount(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">
                      Signed / Effective Date
                    </label>
                    <Input
                      type="date"
                      value={signedDate}
                      onChange={(e) => setSignedDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-medium text-[var(--foreground)]">
                    Functional Spec &amp; Payment Notes
                  </label>
                  <Input
                    placeholder="e.g. 50% upfront, milestone 2 on staging"
                    value={functionalRequirements}
                    onChange={(e) => setFunctionalRequirements(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Contract Form Generator Section */}
                <div className="pt-2 border-t border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-zinc-200 text-xs">Freelance Contract Agreement</span>
                    </div>
                    {contractData && (
                      <Badge variant="offer" className="text-[10px]">Agreement Ready</Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--muted)]">
                    Standard freelance agreement generated via form with developer name, client name, IP ownership transfer, payment terms &amp; warranty.
                  </p>

                  {contractData ? (
                    <div className="p-3 bg-[var(--surface)] border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] block">Developer</span>
                          <span className="font-medium text-emerald-300">{contractData.developerName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--muted)] block">Client</span>
                          <span className="font-medium text-emerald-300">{contractData.clientName || client?.contactName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--muted)] block">Agreed Amount</span>
                          <span className="font-medium text-emerald-300">₹{contractData.agreedAmount.toLocaleString("en-IN")} {contractData.currency || "INR"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            setViewerDoc({
                              isOpen: true,
                              title: `Contract - ${companyName || contactName}`,
                              type: "contract",
                              data: contractData,
                            })
                          }
                          className="text-xs flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View &amp; Print Contract (PDF)
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsContractGenOpen(true)}
                          className="text-xs"
                        >
                          Edit Terms
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsContractGenOpen(true)}
                        className="text-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Generate Contract Agreement Form
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Stage 4: Build (Repo, Staging, Dev notes) */}
            {currentStageIndex >= 3 && (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      4. Development &amp; Repository
                    </h3>
                  </div>
                  {currentStage === "Build" && (
                    <Badge variant="applied" className="text-[10px]">Active Stage</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">
                      Repository URL
                    </label>
                    <Input
                      placeholder="https://github.com/org/repo"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">Staging URL</label>
                    <Input
                      placeholder="https://staging.client.com"
                      value={stagingUrl}
                      onChange={(e) => setStagingUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-medium text-[var(--foreground)]">Development Notes</label>
                  <Textarea
                    placeholder="Architecture decisions, env secrets location, API keys..."
                    value={developmentNotes}
                    onChange={(e) => setDevelopmentNotes(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </Card>
            )}

            {/* Stage 5: Test (QA link, feedback, bug notes) */}
            {currentStageIndex >= 4 && (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-violet-400" />
                    <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                      5. Testing &amp; Quality Assurance
                    </h3>
                  </div>
                  {currentStage === "Test" && (
                    <Badge variant="interview" className="text-[10px]">Active Stage</Badge>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">
                      QA / Client Review URL
                    </label>
                    <Input
                      placeholder="https://qa.client.com"
                      value={testingUrl}
                      onChange={(e) => setTestingUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-medium text-[var(--foreground)]">Client Feedback</label>
                      <Textarea
                        placeholder="Notes from demo round 1..."
                        value={feedbackNotes}
                        onChange={(e) => setFeedbackNotes(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-[var(--foreground)]">Bug / Issue Log</label>
                      <Textarea
                        placeholder="Issues to address before launch..."
                        value={bugLog}
                        onChange={(e) => setBugLog(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Stage 6: Launch (Production URL, deployment date, handover) */}
            {currentStageIndex >= 5 && (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      6. Production Launch &amp; Handover
                    </h3>
                  </div>
                  {currentStage === "Launch" && (
                    <Badge variant="offer" className="text-[10px]">Active Stage</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">Production URL</label>
                    <Input
                      placeholder="https://clientapp.com"
                      value={productionUrl}
                      onChange={(e) => setProductionUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">Launch Date</label>
                    <Input
                      type="date"
                      value={deploymentDate}
                      onChange={(e) => setDeploymentDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-medium text-[var(--foreground)]">Handover Notes</label>
                  <Textarea
                    placeholder="Domain DNS handover, credentials transfer, final invoice..."
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                {/* Handover Document Form Generator Section */}
                <div className="pt-2 border-t border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-zinc-200 text-xs">Project Handover &amp; Acceptance Spec</span>
                    </div>
                    {handoverData && (
                      <Badge variant="offer" className="text-[10px]">Handover Ready</Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--muted)]">
                    Standard production handover document generated via template with developer name, client name, credentials transfer checklist, deployment URLs &amp; warranty sign-off.
                  </p>

                  {handoverData ? (
                    <div className="p-3 bg-[var(--surface)] border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-[var(--muted)] block">Developer</span>
                          <span className="font-medium text-emerald-300">{handoverData.developerName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--muted)] block">Handover Date</span>
                          <span className="font-medium text-emerald-300">{handoverData.handoverDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--muted)] block">Assets Transferred</span>
                          <span className="font-medium text-emerald-300">
                            {handoverData.credentialsChecklist?.filter((c) => c.transferred).length || 0} /{" "}
                            {handoverData.credentialsChecklist?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            setViewerDoc({
                              isOpen: true,
                              title: `Handover Spec - ${companyName || contactName}`,
                              type: "handover",
                              data: handoverData,
                            })
                          }
                          className="text-xs flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View &amp; Print Handover (PDF)
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsHandoverGenOpen(true)}
                          className="text-xs"
                        >
                          Edit Handover Spec
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsHandoverGenOpen(true)}
                        className="text-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Generate Handover Spec Form
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Stage 7: Post-Launch (Support period, maintenance) */}
            {currentStageIndex >= 6 && (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                      7. Post-Launch &amp; Maintenance
                    </h3>
                  </div>
                  {currentStage === "Post-launch" && (
                    <Badge variant="applied" className="text-[10px]">Completed &amp; Retained</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">
                      Included Support Period (Months)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 3"
                      value={supportPeriodMonths ?? ""}
                      onChange={(e) =>
                        setSupportPeriodMonths(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">Support End Date</label>
                    <Input
                      type="date"
                      value={supportEndDate}
                      onChange={(e) => setSupportEndDate(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-medium text-[var(--foreground)]">Maintenance Notes</label>
                  <Textarea
                    placeholder="Retainer terms, ongoing backup schedule, future phase ideas..."
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/freelance">
                <Button variant="secondary" size="sm" type="button">
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" size="sm" type="submit" loading={saving}>
                Save Client Record
              </Button>
            </div>
          </div>

          {/* Right Rail: Due Date & Stage History Timeline */}
          <div className="space-y-5">
            {/* Stage Due Date Card */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Stage Deadline
                </h3>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--foreground)]">
                  Target Completion Date
                </label>
                <Input
                  type="date"
                  value={stageDueDate}
                  onChange={(e) => setStageDueDate(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[11px] text-[var(--muted)]">
                  Sets the milestone due date shown on your dashboard.
                </p>
              </div>
            </Card>

            {/* Stage History Timeline */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <Clock className="w-4 h-4 text-[var(--accent-text)]" />
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Stage History
                </h3>
              </div>

              <div className="space-y-3 pt-1">
                {client.stageHistory && client.stageHistory.length > 0 ? (
                  client.stageHistory.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-[var(--foreground)] block">
                          {item.stage}
                        </span>
                        <span className="text-[11px] text-[var(--muted)] block">
                          {formatDate(item.enteredAt)}
                          {item.completedAt && ` → ${formatDate(item.completedAt)}`}
                        </span>
                        {item.notes && (
                          <span className="text-[11px] text-[var(--muted)] italic block">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--muted)] italic">No stage changes recorded.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${client.companyName}?`}
        message="This will permanently delete this client record, all stage notes, and its history. This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete Client"}
        variant="danger"
        loading={deleting}
      />

      {/* SOW Document Generator Modal */}
      <SowGeneratorModal
        isOpen={isSowGenOpen}
        onClose={() => setIsSowGenOpen(false)}
        clientId={clientId}
        initialData={{
          clientName: contactName,
          companyName: companyName,
          projectTitle: `${companyName || "Client"} Web Application`,
          estimatedBudget: budgetEstimate || 35000,
          currency: "INR",
          ...sowData,
        }}
        onSaveToClient={handleSaveSow}
      />

      {/* Contract Agreement Generator Modal */}
      <ContractGeneratorModal
        isOpen={isContractGenOpen}
        onClose={() => setIsContractGenOpen(false)}
        clientId={clientId}
        initialData={{
          clientName: contactName,
          companyName: companyName,
          projectTitle: `${companyName || "Client"} Web Application`,
          agreedAmount: agreedAmount || budgetEstimate || 45000,
          currency: "INR",
          effectiveDate: signedDate,
          ...contractData,
        }}
        onSaveToClient={handleSaveContract}
      />

      {/* Handover Spec Generator Modal */}
      <HandoverGeneratorModal
        isOpen={isHandoverGenOpen}
        onClose={() => setIsHandoverGenOpen(false)}
        clientId={clientId}
        initialData={{
          clientName: contactName,
          companyName: companyName,
          projectTitle: `${companyName || "Client"} Web Application`,
          productionUrl: productionUrl,
          stagingUrl: stagingUrl,
          repositoryUrl: repositoryUrl,
          handoverDate: deploymentDate,
          maintenanceNotes: handoverNotes,
          ...handoverData,
        }}
        onSaveToClient={handleSaveHandover}
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

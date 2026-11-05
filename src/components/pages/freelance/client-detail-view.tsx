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
} from "@/types/freelance-client";
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
  const [budgetEstimate, setBudgetEstimate] = useState<number | undefined>();

  // Contract fields
  const [contractDocUrl, setContractDocUrl] = useState("");
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

  // Post-Launch fields
  const [supportPeriodMonths, setSupportPeriodMonths] = useState<number | undefined>();
  const [supportEndDate, setSupportEndDate] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");

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
        setBudgetEstimate(c.scoping?.budgetEstimate);

        // Contract
        setContractDocUrl(c.contract?.contractDocUrl || "");
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
        budgetEstimate: budgetEstimate ? Number(budgetEstimate) : undefined,
      },
      contract: {
        contractDocUrl,
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
              <Card className="p-5 space-y-4 border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      2. Scoping Details
                    </h3>
                  </div>
                  {currentStage === "Scoping" && (
                    <Badge variant="interview" className="text-[10px]">Active Stage</Badge>
                  )}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-medium text-[var(--foreground)]">
                        Scope Document / SOW Link
                      </label>
                      <Input
                        placeholder="https://docs.google.com/document/..."
                        value={scopeDocUrl}
                        onChange={(e) => setScopeDocUrl(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-medium text-[var(--foreground)]">
                        Estimated Budget ($ USD)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 3500"
                        value={budgetEstimate ?? ""}
                        onChange={(e) =>
                          setBudgetEstimate(e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="text-xs"
                      />
                    </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-medium text-[var(--foreground)]">
                      Contract Document URL
                    </label>
                    <Input
                      placeholder="https://drive.google.com/contract..."
                      value={contractDocUrl}
                      onChange={(e) => setContractDocUrl(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">Agreed Amount ($)</label>
                    <Input
                      type="number"
                      placeholder="4000"
                      value={agreedAmount ?? ""}
                      onChange={(e) =>
                        setAgreedAmount(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                  <div className="space-y-1">
                    <label className="font-medium text-[var(--foreground)]">
                      Functional Spec Notes
                    </label>
                    <Input
                      placeholder="e.g. 50% upfront, milestone 2 on staging"
                      value={functionalRequirements}
                      onChange={(e) => setFunctionalRequirements(e.target.value)}
                      className="text-xs"
                    />
                  </div>
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
    </div>
  );
}

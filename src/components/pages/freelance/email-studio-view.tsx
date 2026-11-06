"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import Badge from "@/components/ui/badge";
import { IOutreachTemplate } from "@/types/outreach";
import { compileOutreachDraft } from "@/lib/outreach-utils";
import {
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Mail,
  Building2,
  User,
  Wand2,
} from "lucide-react";

const TEMPLATE_CATEGORIES = ["Cold Pitch", "Website Audit", "Re-engagement", "Custom"] as const;

export default function EmailStudioView() {
  const searchParams = useSearchParams();
  const initialCompany = searchParams?.get("company") || "";
  const initialRecipient = searchParams?.get("recipient") || "";

  const [templates, setTemplates] = useState<IOutreachTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [recipientName, setRecipientName] = useState(initialRecipient);
  const [companyName, setCompanyName] = useState(initialCompany);
  const [serviceOffered, setServiceOffered] = useState("Next.js web application development");
  const [personalizedObservation, setPersonalizedObservation] = useState(
    "Noticed you recently expanded your product offering on LinkedIn and might be revamping your web application."
  );

  // Editable Output
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Copy Feedback
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // New Template Modal state
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<"Cold Pitch" | "Website Audit" | "Re-engagement" | "Custom">("Custom");
  const [newSubjectTemplate, setNewSubjectTemplate] = useState("");
  const [newBodyTemplate, setNewBodyTemplate] = useState("");
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/freelance/outreach");
      const json = await res.json();
      if (json.success && json.data) {
        setTemplates(json.data);
        if (json.data.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(json.data[0]._id);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [selectedTemplateId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const activeTemplate = useMemo(() => {
    return templates.find((t) => t._id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Update compiled output when inputs or active template changes
  useEffect(() => {
    if (activeTemplate) {
      const compiled = compileOutreachDraft(activeTemplate, {
        recipientName,
        companyName,
        serviceOffered,
        personalizedObservation,
      });
      setSubject(compiled.subject);
      setBody(compiled.body);
    }
  }, [activeTemplate, recipientName, companyName, serviceOffered, personalizedObservation]);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !newSubjectTemplate.trim() || !newBodyTemplate.trim()) {
      return;
    }
    setCreatingTemplate(true);
    try {
      const res = await fetch("/api/freelance/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplateName,
          category: newTemplateCategory,
          subjectTemplate: newSubjectTemplate,
          bodyTemplate: newBodyTemplate,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTemplates((prev) => [json.data, ...prev]);
        setSelectedTemplateId(json.data._id);
        setIsNewTemplateOpen(false);
        setNewTemplateName("");
        setNewSubjectTemplate("");
        setNewBodyTemplate("");
      }
    } catch {
      // silent
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/freelance/outreach/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setTemplates((prev) => prev.filter((t) => t._id !== id));
      }
    } catch {
      // silent
    }
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              Cold Outreach Email Studio
            </h1>
            <Badge variant="applied" className="text-[10px] py-0.5 px-2">
              Module 4
            </Badge>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Craft targeted, high-conversion cold emails with custom variables and one-click copy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsNewTemplateOpen(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>New Template</span>
          </Button>
          <Link href="/freelance">
            <Button variant="ghost" size="sm" className="text-xs">
              Back to Pipeline
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Variables & Template Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[var(--accent-text)]" />
                <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Outreach Variables
                </h2>
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-medium text-[var(--foreground)]">Select Template</label>
                {activeTemplate && !activeTemplate.isSystem && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(activeTemplate._id!)}
                    className="text-[11px] text-red-400/80 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Template</span>
                  </button>
                )}
              </div>
              <Select
                value={selectedTemplateId}
                onChange={(val) => setSelectedTemplateId(val)}
                options={templates.map((t) => ({
                  value: t._id!,
                  label: `${t.name} (${t.category})`,
                }))}
              />
              {activeTemplate?.description && (
                <p className="text-[11px] text-[var(--muted)] italic">
                  {activeTemplate.description}
                </p>
              )}
            </div>

            {/* Recipient & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  Recipient Name
                </label>
                <Input
                  placeholder="e.g. Alex"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  Target Company
                </label>
                <Input
                  placeholder="e.g. Supabase"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Service Offered */}
            <div className="space-y-1 text-xs">
              <label className="font-medium text-[var(--foreground)]">
                Proposed Service / Pitch Offer
              </label>
              <Input
                placeholder="e.g. Next.js dashboard development and frontend optimization"
                value={serviceOffered}
                onChange={(e) => setServiceOffered(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Personalized Observation */}
            <div className="space-y-1 text-xs">
              <label className="font-medium text-[var(--foreground)] flex items-center justify-between">
                <span>Personalized Observation</span>
                <span className="text-[10px] text-[var(--muted)]">Highest reply driver</span>
              </label>
              <Textarea
                placeholder="e.g. I saw your post regarding hiring delays for your React migration..."
                rows={4}
                value={personalizedObservation}
                onChange={(e) => setPersonalizedObservation(e.target.value)}
                className="text-xs"
              />
            </div>
          </Card>

          {/* Quick Guidelines Card */}
          <Card className="p-4 bg-[var(--surface-hover)]/30 border-[var(--border)] text-xs space-y-1.5 text-[var(--muted)]">
            <span className="font-semibold text-[var(--foreground)] block">
              Cold Email Rules (Module 4)
            </span>
            <ul className="list-disc list-inside space-y-1 leading-relaxed text-[11px]">
              <li>Never bulk send. Tailor the observation to the recipient.</li>
              <li>Keep it under 100 words whenever possible.</li>
              <li>Offer concrete ideas or low-commitment value upfront.</li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Generated Subject & Body with 1-Click Copy (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Generated Email Draft
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <a href={mailtoHref} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm" className="text-[11px] py-1 px-2.5 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-[var(--accent-text)]" />
                    <span>Launch in Mail Client</span>
                  </Button>
                </a>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-[var(--muted)]">
                Loading templates...
              </div>
            ) : (
              <>
                {/* Subject Line */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-[var(--foreground)]">Subject Line</label>
                    <button
                      type="button"
                      onClick={handleCopySubject}
                      className="flex items-center gap-1 text-[11px] font-medium text-[var(--accent-text)] hover:underline cursor-pointer"
                    >
                      {copiedSubject ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Subject</span>
                        </>
                      )}
                    </button>
                  </div>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="text-xs font-medium"
                  />
                </div>

                {/* Body */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-[var(--foreground)]">Email Body</label>
                    <button
                      type="button"
                      onClick={handleCopyBody}
                      className="flex items-center gap-1 text-[11px] font-medium text-[var(--accent-text)] hover:underline cursor-pointer"
                    >
                      {copiedBody ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Body</span>
                        </>
                      )}
                    </button>
                  </div>
                  <Textarea
                    rows={12}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="text-xs font-mono leading-relaxed bg-[var(--surface-hover)]/20"
                  />
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span className="text-[11px] text-[var(--muted)]">
                    {body.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopySubject}
                      className="text-xs"
                    >
                      {copiedSubject ? "Subject Copied!" : "Copy Subject"}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCopyBody}
                      className="text-xs font-semibold"
                    >
                      {copiedBody ? "Body Copied!" : "Copy Body"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* New Template Modal */}
      {isNewTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Create Reusable Outreach Template
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Use tokens: <code className="text-[var(--accent-text)]">&#123;&#123;companyName&#125;&#125;</code>,{" "}
              <code className="text-[var(--accent-text)]">&#123;&#123;recipientName&#125;&#125;</code>,{" "}
              <code className="text-[var(--accent-text)]">&#123;&#123;serviceOffered&#125;&#125;</code>,{" "}
              <code className="text-[var(--accent-text)]">&#123;&#123;personalizedObservation&#125;&#125;</code>.
            </p>

            <form onSubmit={handleCreateTemplate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Template Name</label>
                <Input
                  placeholder="e.g. Quick Audit Follow-Up"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Category</label>
                <Select
                  value={newTemplateCategory}
                  onChange={(val) =>
                    setNewTemplateCategory(
                      val as "Cold Pitch" | "Website Audit" | "Re-engagement" | "Custom"
                    )
                  }
                  options={TEMPLATE_CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Subject Template</label>
                <Input
                  placeholder="Ideas for {{companyName}}'s product"
                  value={newSubjectTemplate}
                  onChange={(e) => setNewSubjectTemplate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--foreground)]">Body Template</label>
                <Textarea
                  placeholder="Hi {{recipientName}}, ..."
                  rows={6}
                  value={newBodyTemplate}
                  onChange={(e) => setNewBodyTemplate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsNewTemplateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={creatingTemplate}
                >
                  Save Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

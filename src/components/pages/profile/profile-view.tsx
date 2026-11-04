"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { IUser } from "@/types/user";
import { IResume } from "@/types/resume";
import {
  User as UserIcon,
  FileText,
  Plus,
  ExternalLink,
  Trash2,
  Check,
  Star,
  Globe,
  Code2,
  Share2,
  X,
  Sparkles,
} from "lucide-react";

export default function ProfileView() {
  const [activeTab, setActiveTab] = useState<"profile" | "resumes">("profile");
  const [profile, setProfile] = useState<IUser | null>(null);
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Resume Modal State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeCategory, setResumeCategory] = useState("");
  const [resumeIsDefault, setResumeIsDefault] = useState(false);
  const [resumeNotes, setResumeNotes] = useState("");
  const [savingResume, setSavingResume] = useState(false);

  // Skill Tag Input State
  const [skillInput, setSkillInput] = useState("");

  const fetchData = async () => {
    try {
      const [profRes, resRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/resumes"),
      ]);
      const [profData, resData] = await Promise.all([profRes.json(), resRes.json()]);

      if (profData.success && profData.data) {
        setProfile(profData.data);
      }
      if (resData.success && Array.isArray(resData.data)) {
        setResumes(resData.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setFeedbackNotice(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setFeedbackNotice("Profile saved successfully");
      } else {
        setFeedbackNotice(json.error || "Failed to update profile");
      }
    } catch {
      setFeedbackNotice("Network error while saving");
    } finally {
      setSavingProfile(false);
      setTimeout(() => setFeedbackNotice(null), 3500);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.replace(/,/g, "").trim();
      if (newSkill && profile) {
        const currentSkills = profile.skills || [];
        if (!currentSkills.includes(newSkill)) {
          setProfile({ ...profile, skills: [...currentSkills, newSkill] });
        }
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      skills: (profile.skills || []).filter((s) => s !== skillToRemove),
    });
  };

  const toggleWorkArrangement = (val: string) => {
    if (!profile) return;
    const current = profile.workArrangement || [];
    const updated = current.includes(val)
      ? current.filter((x) => x !== val)
      : [...current, val];
    setProfile({ ...profile, workArrangement: updated });
  };

  const handleCreateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeTitle.trim() || !resumeUrl.trim()) return;

    setSavingResume(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resumeTitle,
          fileUrl: resumeUrl,
          category: resumeCategory || undefined,
          isDefault: resumeIsDefault,
          notes: resumeNotes || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsResumeModalOpen(false);
        setResumeTitle("");
        setResumeUrl("");
        setResumeCategory("");
        setResumeIsDefault(false);
        setResumeNotes("");
        await fetchData();
      }
    } catch {
      // silent
    } finally {
      setSavingResume(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to remove this resume record?")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setResumes((prev) => prev.filter((r) => r._id?.toString() !== id));
      }
    } catch {
      // silent
    }
  };

  const handleSetDefaultResume = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setDefault" }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchData();
      }
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[var(--muted)]">Loading candidate profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Profile Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-xl font-bold text-[var(--accent-text)] shadow-sm">
            {profile?.name ? profile.name.slice(0, 2).toUpperCase() : <UserIcon className="w-6 h-6" />}
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              {profile?.name || "Candidate Profile"}
            </h1>
            <p className="text-xs text-[var(--muted)]">{profile?.email}</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)] self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-[var(--surface)] text-[var(--foreground)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resumes")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "resumes"
                ? "bg-[var(--surface)] text-[var(--foreground)] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resumes ({resumes.length})</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3 bg-[var(--accent-light)] border border-[var(--accent-border)] rounded-xl text-xs text-[var(--accent-text)] font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Tab 1: Profile Details Form */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <Card className="space-y-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2.5">
              Personal &amp; Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Full Name</label>
                <Input
                  value={profile?.name || ""}
                  onChange={(e) => setProfile({ ...profile!, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Target Headline</label>
                <Input
                  value={profile?.headline || ""}
                  onChange={(e) => setProfile({ ...profile!, headline: e.target.value })}
                  placeholder="e.g. Senior Fullstack Engineer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Phone Number</label>
                <Input
                  value={profile?.phone || ""}
                  onChange={(e) => setProfile({ ...profile!, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)]">Location</label>
                <Input
                  value={profile?.location || ""}
                  onChange={(e) => setProfile({ ...profile!, location: e.target.value })}
                  placeholder="San Francisco, CA or Remote"
                />
              </div>
            </div>

            {/* Work Arrangements */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-medium text-[var(--muted)] block">
                Preferred Work Arrangements
              </label>
              <div className="flex items-center gap-2">
                {["Remote", "Hybrid", "On-site"].map((type) => {
                  const isSelected = (profile?.workArrangement || []).includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleWorkArrangement(type)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--accent-text)] font-semibold"
                          : "bg-[var(--surface-hover)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-medium text-[var(--muted)]">Professional Bio &amp; Pitch</label>
              <Textarea
                rows={3}
                value={profile?.bio || ""}
                onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                placeholder="Brief summary of your expertise, stack, and what you are looking for..."
              />
            </div>
          </Card>

          {/* Skills & Expertise */}
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2.5">
              Skills &amp; Technologies
            </h2>
            <div className="space-y-2.5">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill (e.g. React, TypeScript, Node.js) and press Enter"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(profile?.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[var(--muted)] hover:text-red-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(profile?.skills || []).length === 0 && (
                  <p className="text-xs text-[var(--muted)] italic">No skills added yet.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Links & Portfolio */}
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2.5">
              Links &amp; Online Presence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  Portfolio Website
                </label>
                <Input
                  value={profile?.portfolioUrl || ""}
                  onChange={(e) => setProfile({ ...profile!, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.dev"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  GitHub Profile
                </label>
                <Input
                  value={profile?.githubUrl || ""}
                  onChange={(e) => setProfile({ ...profile!, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--muted)] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  LinkedIn Profile
                </label>
                <Input
                  value={profile?.linkedinUrl || ""}
                  onChange={(e) => setProfile({ ...profile!, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving Profile..." : "Save Profile Details"}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Resumes & Documents */}
      {activeTab === "resumes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Resume Versions</h2>
              <p className="text-xs text-[var(--muted)]">
                Manage tailored versions of your CV to associate with applications.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsResumeModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resume</span>
            </Button>
          </div>

          {resumes.length === 0 ? (
            <Card className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] mx-auto flex items-center justify-center text-[var(--muted)]">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">No resumes added yet</p>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                  Add links to your hosted PDFs (Google Drive, Dropbox, Notion, etc.) to quickly track which resume version was sent.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsResumeModalOpen(true)}
                className="text-xs"
              >
                + Add your first resume
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.map((res) => (
                <Card
                  key={res._id?.toString()}
                  className="p-4 space-y-3 border border-[var(--border)] hover:border-[var(--muted)] transition-colors relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--foreground)] truncate">
                          {res.name}
                        </span>
                        {res.isDefault && (
                          <Badge variant="offer" className="text-[10px] py-0 px-1.5">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)] truncate">{res.fileName}</p>
                    </div>

                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[var(--surface-hover)] text-[var(--accent-text)] hover:bg-[var(--surface)] transition-colors"
                      title="Open resume link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {res.notes && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2 italic bg-[var(--background)]/50 p-2 rounded-lg">
                      &quot;{res.notes}&quot;
                    </p>
                  )}

                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[var(--muted)]">
                      {res.category ? `Category: ${res.category}` : "General"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!res.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultResume(res._id!.toString())}
                          className="text-[11px] text-[var(--muted)] hover:text-emerald-400 px-2 py-1 rounded hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          <span>Set Primary</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteResume(res._id!.toString())}
                        className="text-[11px] text-[var(--muted)] hover:text-red-400 p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Resume Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">Add Resume Version</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResume} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">Resume Title *</label>
                <Input
                  required
                  placeholder="e.g. Senior Frontend Resume (2026)"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">Document Link (URL) *</label>
                <Input
                  required
                  placeholder="https://drive.google.com/file/... or hosted URL"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">Target Role / Category</label>
                <Input
                  placeholder="e.g. Frontend, DevOps, Management"
                  value={resumeCategory}
                  onChange={(e) => setResumeCategory(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">Notes (Optional)</label>
                <Input
                  placeholder="e.g. Tailored for React 19 and Next.js roles"
                  value={resumeNotes}
                  onChange={(e) => setResumeNotes(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={resumeIsDefault}
                  onChange={(e) => setResumeIsDefault(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                />
                <span className="text-xs text-[var(--muted)]">Set as primary default resume</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={savingResume}>
                  {savingResume ? "Saving..." : "Save Resume"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


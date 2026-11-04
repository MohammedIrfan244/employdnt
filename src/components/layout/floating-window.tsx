"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { IDetectedEmail } from "@/types/detected-email";
import {
  Mail,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Inbox,
  Sparkles,
  ShieldCheck,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface FloatingWindowProps {
  onOpenQuickAdd?: () => void;
}

interface GmailStatus {
  connected: boolean;
  gmailEmail: string | null;
  lastSyncedAt: string | null;
}

export default function FloatingWindow({ onOpenQuickAdd }: FloatingWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [emails, setEmails] = useState<IDetectedEmail[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed">("pending");
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [expandedSnippetId, setExpandedSnippetId] = useState<string | null>(null);

  // Fetch connection status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/status");
      const json = await res.json();
      if (json.success) {
        setStatus(json.data);
      }
    } catch {
      // silent
    }
  }, []);

  // Fetch detected emails based on tab
  const fetchEmails = useCallback(async (tabStatus: "pending" | "confirmed") => {
    try {
      const res = await fetch(`/api/gmail/emails?status=${tabStatus}&limit=50`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEmails(json.data);
      }
    } catch {
      // silent
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStatus();
      await fetchEmails("pending");
      setLoading(false);
    };
    init();
  }, [fetchStatus, fetchEmails]);

  // Tab change
  const handleTabChange = (tab: "pending" | "confirmed") => {
    setActiveTab(tab);
    fetchEmails(tab);
  };

  // Sync Gmail
  const handleSync = async (maxResults = 50) => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxResults }),
      });
      const json = await res.json();
      if (json.success) {
        const found = json.data?.newDetected ?? 0;
        setSyncNotice(found > 0 ? `+${found} new emails found` : "Inbox up to date");
        await fetchStatus();
        await fetchEmails(activeTab);
      } else {
        setSyncNotice(json.error || "Sync failed");
      }
    } catch {
      setSyncNotice("Sync failed");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  // Confirm match and optionally transition application status
  const handleConfirm = async (emailId: string, applySuggestedStatus: boolean) => {
    setActioningId(emailId);
    try {
      const res = await fetch(`/api/gmail/emails/${emailId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applySuggestedStatus }),
      });
      const json = await res.json();
      if (json.success) {
        // Remove from current list if looking at pending
        setEmails((prev) => prev.filter((e) => e._id?.toString() !== emailId));
      }
    } catch {
      // silent
    } finally {
      setActioningId(null);
    }
  };

  // Dismiss detected email
  const handleDismiss = async (emailId: string) => {
    setActioningId(emailId);
    try {
      const res = await fetch(`/api/gmail/emails/${emailId}/dismiss`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setEmails((prev) => prev.filter((e) => e._id?.toString() !== emailId));
      }
    } catch {
      // silent
    } finally {
      setActioningId(null);
    }
  };

  // Connect Gmail
  const handleConnectGmail = () => {
    signIn("google-gmail", {
      callbackUrl: typeof window !== "undefined" ? window.location.pathname : "/today",
    });
  };

  const pendingCount = activeTab === "pending" ? emails.length : undefined;

  // Render Category Badge
  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case "offer":
        return <Badge variant="offer">OFFER</Badge>;
      case "interview":
        return <Badge variant="progress">INTERVIEW</Badge>;
      case "rejection":
        return <Badge variant="rejected">REJECTED</Badge>;
      case "acknowledgment":
        return <Badge variant="applied">ACK</Badge>;
      default:
        return <Badge variant="default">{category.toUpperCase()}</Badge>;
    }
  };

  // Format relative or date string
  const formatReceivedDate = (dateVal?: string | Date) => {
    if (!dateVal) return "";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ${
        isMinimized
          ? "w-14 h-auto self-start"
          : "w-80 xl:w-[340px] h-[calc(100vh-6.5rem)] sticky top-20 mb-8"
      }`}
    >
      <div className="flex-1 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
        {/* Minimized Bar */}
        {isMinimized ? (
          <div className="p-3 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--foreground)] transition-colors relative"
              title="Expand Recruiter Signals"
            >
              <Mail className="w-4 h-4 text-[var(--accent-text)]" />
              {emails.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-[10px] font-bold text-[var(--background)] flex items-center justify-center">
                  {emails.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
              title="Expand"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Expanded Header & Body */
          <>
            {/* Header */}
            <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--surface-elevated)]/40">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    status?.connected
                      ? "bg-[var(--accent)] animate-pulse"
                      : "bg-[var(--muted-light)]"
                  }`}
                />
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  <span className="text-xs font-semibold text-[var(--foreground)] tracking-tight">
                    Recruiter Signals
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {status?.connected && (
                  <button
                    type="button"
                    onClick={() => handleSync(50)}
                    disabled={isSyncing}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
                    title="Scan Gmail inbox"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[var(--accent-text)]" : ""}`}
                    />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                  title="Minimize side window"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sync Notice Alert */}
            {syncNotice && (
              <div className="px-3.5 py-1.5 bg-[var(--accent-light)] border-b border-[var(--accent-border)] text-[11px] text-[var(--accent-text)] font-medium flex items-center justify-between">
                <span>{syncNotice}</span>
                <button
                  onClick={() => setSyncNotice(null)}
                  className="text-[var(--accent-text)] hover:opacity-75"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[var(--muted)]">Loading signals...</p>
                </div>
              ) : !status?.connected ? (
                /* Disconnected / Connect Prompt */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-text)] shadow-inner">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Connect Gmail
                    </p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed max-w-[240px]">
                      Detect interviews, offers, and recruiter responses automatically.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConnectGmail}
                    className="w-full text-xs font-semibold py-2 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Connect Google Account</span>
                  </Button>

                  <div className="pt-2 flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Read-only • No emails sent • Full privacy</span>
                  </div>
                </div>
              ) : (
                /* Connected View */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Account Info & Tabs Header */}
                  <div className="px-3.5 pt-2.5 pb-2 border-b border-[var(--border)] space-y-2 bg-[var(--background)]/30 shrink-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--muted)] truncate max-w-[170px]" title={status.gmailEmail || ""}>
                        {status.gmailEmail}
                      </span>
                      {status.lastSyncedAt && (
                        <span className="text-[10px] text-[var(--muted-light)]">
                          Synced {new Date(status.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 p-0.5 bg-[var(--surface-hover)] rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => handleTabChange("pending")}
                        className={`flex-1 py-1 rounded-md text-center font-medium transition-colors text-[11px] flex items-center justify-center gap-1.5 ${
                          activeTab === "pending"
                            ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <span>Unresolved</span>
                        {pendingCount !== undefined && pendingCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-[var(--background)] font-bold text-[9px] flex items-center justify-center">
                            {pendingCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabChange("confirmed")}
                        className={`flex-1 py-1 rounded-md text-center font-medium transition-colors text-[11px] ${
                          activeTab === "confirmed"
                            ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        Resolved
                      </button>
                    </div>
                  </div>

                  {/* Scrollable List of Detected Emails */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {emails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)]">
                          <Inbox className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-[var(--foreground)]">
                            {activeTab === "pending" ? "All caught up!" : "No resolved emails yet"}
                          </p>
                          <p className="text-[11px] text-[var(--muted)] max-w-[200px]">
                            {activeTab === "pending"
                              ? "No unconfirmed recruiter emails found in recent scans."
                              : "Emails you confirm will appear here for reference."}
                          </p>
                        </div>
                        {activeTab === "pending" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isSyncing}
                            onClick={() => handleSync(50)}
                            className="text-xs mt-1"
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
                            <span>Scan inbox now</span>
                          </Button>
                        )}
                      </div>
                    ) : (
                      emails.map((email) => {
                        const isActing = actioningId === email._id?.toString();
                        const matchedApp =
                          typeof email.matchedApplicationId === "object" &&
                          email.matchedApplicationId !== null
                            ? (email.matchedApplicationId as {
                                _id: string;
                                company: string;
                                role: string;
                                status: string;
                              })
                            : null;
                        const company =
                          matchedApp?.company || email.matchedCompany || "Unknown Company";
                        const role = matchedApp?.role || email.matchedRole || "";
                        const isSnippetExpanded =
                          expandedSnippetId === email._id?.toString();
                        const gmailUrl = `https://mail.google.com/mail/u/${encodeURIComponent(
                          email.userEmail || ""
                        )}/#all/${email.threadId || email.messageId}`;

                        return (
                          <div
                            key={email._id?.toString()}
                            className="p-3 bg-[var(--surface-hover)]/70 hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl space-y-2 text-xs transition-colors shadow-xs"
                          >
                            {/* Card Header: Company, Date & Category */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {matchedApp?._id ? (
                                    <Link
                                      href={`/applications/${matchedApp._id}`}
                                      className="font-bold text-[var(--foreground)] hover:text-[var(--accent-text)] transition-colors truncate flex items-center gap-0.5"
                                    >
                                      <span>{company}</span>
                                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </Link>
                                  ) : (
                                    <span className="font-bold text-[var(--foreground)] truncate">
                                      {company}
                                    </span>
                                  )}
                                  {role && (
                                    <span className="text-[11px] text-[var(--muted)] truncate">
                                      • {role}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[var(--muted-light)]">
                                  {formatReceivedDate(email.receivedAt)} • {email.senderName || email.senderEmail}
                                </p>
                              </div>

                              <div className="shrink-0">
                                {renderCategoryBadge(email.category)}
                              </div>
                            </div>

                            {/* Subject Line (Clickable directly to open email in Gmail) */}
                            <a
                              href={gmailUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[var(--foreground)] font-medium hover:text-[var(--accent-text)] transition-colors truncate flex items-center gap-1 group"
                              title="Open email in Gmail (new tab)"
                            >
                              <span className="truncate">{email.subject}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 text-[var(--accent-text)]" />
                            </a>

                            {/* Snippet Preview */}
                            <div className="relative">
                              <p
                                className={`text-[11px] text-[var(--muted)] italic leading-relaxed ${
                                  isSnippetExpanded ? "" : "line-clamp-2"
                                }`}
                              >
                                &ldquo;{email.snippet}&rdquo;
                              </p>
                              {email.snippet && email.snippet.length > 90 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedSnippetId(
                                      isSnippetExpanded ? null : email._id!.toString()
                                    )
                                  }
                                  className="text-[10px] text-[var(--accent-text)] hover:underline mt-0.5 flex items-center gap-0.5"
                                >
                                  {isSnippetExpanded ? (
                                    <>
                                      <span>Less</span>
                                      <ChevronUp className="w-2.5 h-2.5" />
                                    </>
                                  ) : (
                                    <>
                                      <span>More</span>
                                      <ChevronDown className="w-2.5 h-2.5" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Suggested Status Alert if applicable */}
                            {email.suggestedStatus && activeTab === "pending" && (
                              <div className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--accent-border)] flex items-center gap-1.5 text-[11px]">
                                <Sparkles className="w-3 h-3 text-[var(--accent-text)] shrink-0" />
                                <span className="text-[var(--foreground)]">
                                  Suggests status:{" "}
                                  <strong className="text-[var(--accent-text)] font-semibold">
                                    {email.suggestedStatus}
                                  </strong>
                                </span>
                              </div>
                            )}

                            {/* Match Reason Footer, Open in Gmail & Action Buttons */}
                            <div className="pt-1.5 border-t border-[var(--border)] flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="text-[10px] text-[var(--muted)] truncate max-w-[85px]"
                                  title={email.matchReason || undefined}
                                >
                                  {email.matchReason || `${email.matchConfidence} confidence`}
                                </span>

                                <a
                                  href={gmailUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[var(--accent-text)] hover:underline flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded hover:bg-[var(--surface)] transition-colors"
                                  title="Open in Gmail (new tab)"
                                >
                                  <span>Open</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>

                              {activeTab === "pending" ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isActing}
                                    onClick={() => handleDismiss(email._id!.toString())}
                                    className="text-[10px] py-0.5 px-1.5 h-6 text-[var(--muted)] hover:text-red-400"
                                    title="Dismiss notification"
                                  >
                                    Dismiss
                                  </Button>

                                  {email.suggestedStatus ? (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      disabled={isActing}
                                      onClick={() =>
                                        handleConfirm(email._id!.toString(), true)
                                      }
                                      className="text-[10px] py-0.5 px-2 h-6 font-semibold shadow-xs flex items-center gap-1"
                                      title={`Apply status "${email.suggestedStatus}" and link`}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Set {email.suggestedStatus}</span>
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      disabled={isActing}
                                      onClick={() =>
                                        handleConfirm(email._id!.toString(), false)
                                      }
                                      className="text-[10px] py-0.5 px-2 h-6 font-semibold"
                                      title="Confirm match and link to application timeline"
                                    >
                                      <Check className="w-3 h-3 mr-0.5" />
                                      <span>Link</span>
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
                                  <Check className="w-3 h-3" />
                                  Confirmed
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Floating Window Footer: Log application */}
            {onOpenQuickAdd && (
              <div className="p-3 border-t border-[var(--border)] shrink-0 bg-[var(--surface-elevated)]/40">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs justify-center py-1.5"
                  onClick={onOpenQuickAdd}
                >
                  <span className="font-bold mr-1">+</span>
                  <span>Log application</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
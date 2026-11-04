"use client";

import React, { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useClientDate } from "@/hooks/use-client-date";
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Power,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";

interface GmailStatus {
  connected: boolean;
  gmailEmail: string | null;
  lastSyncedAt: string | null;
}

interface UserPreferences {
  defaultFollowUpDays: number;
  notifyEmailDetected: boolean;
  notifyFollowUpDue: boolean;
  targetDailyApplications: number;
}

export default function SettingsView() {
  const { formatDate, formatTime } = useClientDate();

  const [status, setStatus] = useState<GmailStatus>({
    connected: false,
    gmailEmail: null,
    lastSyncedAt: null,
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultFollowUpDays: 7,
    notifyEmailDetected: true,
    notifyFollowUpDue: true,
    targetDailyApplications: 10,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [prefNotice, setPrefNotice] = useState<string | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, prefRes] = await Promise.all([
        fetch("/api/gmail/status"),
        fetch("/api/user/preferences"),
      ]);
      const [statusData, prefData] = await Promise.all([
        statusRes.json(),
        prefRes.json(),
      ]);

      if (statusData.success && statusData.data) {
        setStatus(statusData.data);
      }
      if (prefData.success && prefData.data) {
        setPreferences(prefData.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefNotice(null);

    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      const json = await res.json();
      if (json.success) {
        setPreferences(json.data);
        setPrefNotice("Preferences saved successfully");
      } else {
        setPrefNotice(json.error || "Failed to update preferences");
      }
    } catch {
      setPrefNotice("Network error saving preferences");
    } finally {
      setSavingPrefs(false);
      setTimeout(() => setPrefNotice(null), 3500);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxResults: 50 }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const { scanned, newDetected } = json.data;
        setSyncMessage(
          newDetected > 0
            ? `Found ${newDetected} new recruitment email${newDetected > 1 ? "s" : ""}!`
            : `Scanned ${scanned} recent emails. All caught up!`
        );
        fetchData();
      } else {
        setSyncMessage(json.error || "Failed to scan emails.");
      }
    } catch {
      setSyncMessage("Error connecting to Gmail.");
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectGmail = () => {
    signIn("google-gmail", { callbackUrl: "/settings" });
  };

  const handleDisconnectConfirm = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setStatus({
          connected: false,
          gmailEmail: null,
          lastSyncedAt: null,
        });
        setSyncMessage("Gmail account disconnected.");
        setIsDisconnectModalOpen(false);
      }
    } catch {
      setSyncMessage("Failed to disconnect Gmail.");
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[var(--muted)]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
          Application Preferences &amp; Settings
        </h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Manage follow-up timing, notification behavior, and connected Gmail accounts.
        </p>
      </div>

      {prefNotice && (
        <div className="p-3 bg-[var(--accent-light)] border border-[var(--accent-border)] rounded-xl text-xs text-[var(--accent-text)] font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{prefNotice}</span>
        </div>
      )}

      {/* Cadence & Preferences Form */}
      <form onSubmit={handleSavePreferences} className="space-y-5">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Follow-Up Cadence (Module 2)
            </h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--foreground)] block">
              Default Days After Application Before Follow-Up Reminder
            </label>
            <p className="text-xs text-[var(--muted)]">
              When logging an application, a follow-up reminder is automatically scheduled for this many days out.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {[3, 5, 7, 10, 14].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() =>
                    setPreferences({ ...preferences, defaultFollowUpDays: days })
                  }
                  className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    preferences.defaultFollowUpDays === days
                      ? "bg-[var(--accent-light)] text-[var(--accent-text)] border-[var(--accent-border)] font-bold shadow-xs"
                      : "bg-[var(--surface-hover)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Milestone Target & Notifications */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Target className="w-4 h-4 text-[var(--accent-text)]" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Daily Target Baseline &amp; Alerts (Modules 1 &amp; 8)
            </h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--foreground)] block">
                Default Daily Application Target
              </label>
              <div className="w-40">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={preferences.targetDailyApplications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      targetDailyApplications: Number(e.target.value) || 10,
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs">
              <label className="flex items-start gap-3 p-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifyFollowUpDue}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifyFollowUpDue: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-[var(--foreground)] block">
                    Follow-Up Reminders in Needs Attention
                  </span>
                  <span className="text-[var(--muted)]">
                    Highlight applications that are due for follow-up on your Today dashboard and top rail.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifyEmailDetected}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifyEmailDetected: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-[var(--foreground)] block">
                    Recruitment Email Signal Alerts
                  </span>
                  <span className="text-[var(--muted)]">
                    Surface interview, offer, and rejection signals in the persistent floating assistant.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" type="submit" disabled={savingPrefs}>
              {savingPrefs ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </Card>
      </form>

      {/* Gmail Integration Section (Module 4) */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--accent-text)]" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Google Recruitment Scanner (Module 4)
            </h2>
          </div>
          {status.connected && (
            <Badge variant="applied" className="text-[11px] py-0.5 px-2">
              Connected
            </Badge>
          )}
        </div>

        {status.connected ? (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  {status.gmailEmail}
                </p>
                <p className="text-[11px] text-[var(--muted)] flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last scanned:{" "}
                    {status.lastSyncedAt
                      ? `${formatDate(status.lastSyncedAt)} at ${formatTime(status.lastSyncedAt)}`
                      : "Never"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
                  <span>{syncing ? "Scanning..." : "Sync Now"}</span>
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="text-xs"
                >
                  <Power className="w-3.5 h-3.5 mr-1" />
                  <span>Disconnect</span>
                </Button>
              </div>
            </div>

            {syncMessage && (
              <div className="p-3 bg-[var(--accent-light)] border border-[var(--accent-border)] rounded-xl text-xs text-[var(--accent-text)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncMessage}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Connect your Gmail account to automatically identify recruiter emails, schedule interview updates, and log application responses into your timeline.
            </p>
            <Button variant="primary" size="sm" onClick={handleConnectGmail} className="text-xs">
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              <span>Connect Google Account</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Privacy Safeguards */}
      <Card className="p-5 space-y-3 bg-[var(--surface-elevated)]/30 border border-[var(--border)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-[var(--foreground)]">
            Privacy &amp; Data Safeguards (Module 4.6 &amp; 11)
          </h3>
        </div>
        <ul className="text-xs text-[var(--muted)] space-y-1.5 list-disc list-inside leading-relaxed">
          <li>Read-only access: Employdnt never sends, modifies, or deletes your emails.</li>
          <li>Targeted queries: Only recruitment-related emails are scanned.</li>
          <li>Multi-tenant isolation: All your applications and notes are strictly private to your account.</li>
        </ul>
      </Card>

      {/* Disconnect Modal */}
      <ConfirmModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleDisconnectConfirm}
        title="Disconnect Gmail Integration?"
        message="Employdnt will stop scanning for recruiter emails. Your existing recorded applications and timeline events will be preserved."
        confirmText={disconnecting ? "Disconnecting..." : "Disconnect"}
        variant="danger"
        loading={disconnecting}
      />
    </div>
  );
}

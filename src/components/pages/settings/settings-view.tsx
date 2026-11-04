"use client";

import React, { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useClientDate } from "@/hooks/use-client-date";
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Power,
  Clock,
} from "lucide-react";

interface GmailStatus {
  connected: boolean;
  gmailEmail: string | null;
  lastSyncedAt: string | null;
}

export default function SettingsView() {
  const { formatDate, formatTime } = useClientDate();

  const [status, setStatus] = useState<GmailStatus>({
    connected: false,
    gmailEmail: null,
    lastSyncedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/gmail/status");
      const json = await res.json();
      if (json.success && json.data) {
        setStatus(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/gmail/sync", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        const { scanned, newDetected } = json.data;
        setSyncMessage(
          newDetected > 0
            ? `Found ${newDetected} new recruitment email${newDetected > 1 ? "s" : ""}!`
            : `Scanned ${scanned} recent emails. All caught up!`
        );
        fetchStatus();
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
      // silent
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">
          Manage your integrations, email connectivity, and personal preferences
        </p>
      </div>

      {/* Gmail Integration Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">Gmail Integration</h2>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    status.connected
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-[var(--surface-hover)] border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    Google Recruitment Scanner
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {status.connected && status.gmailEmail
                      ? `Connected as ${status.gmailEmail}`
                      : "Automatically detects interview invitations and status updates"}
                  </p>
                </div>
              </div>

              {status.connected && status.lastSyncedAt && (
                <p className="text-xs text-[var(--muted)] flex items-center gap-1.5 pl-1">
                  <Clock className="w-3.5 h-3.5" />
                  Last scanned: {formatDate(status.lastSyncedAt)} at {formatTime(status.lastSyncedAt)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {loading ? (
                <div className="text-xs text-[var(--muted)] animate-pulse">Loading status...</div>
              ) : status.connected ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={syncing}
                    onClick={handleSyncNow}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                    Sync Now
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsDisconnectModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs"
                    title="Disconnect Gmail integration"
                  >
                    <Power className="w-3.5 h-3.5" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConnectGmail}
                  className="flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Connect Gmail
                </Button>
              )}
            </div>
          </div>

          {/* Sync Result Feedback */}
          {syncMessage && (
            <div className="p-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Privacy & Scope Card */}
          <div className="p-4 bg-[var(--surface-hover)]/60 rounded-xl border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
              <span>Privacy &amp; Data Safeguards (Module 4.6)</span>
            </div>
            <ul className="text-xs text-[var(--muted)] space-y-1 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-[var(--foreground)]">Read-only access:</strong> Employdnt cannot send, delete, or modify your emails.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Targeted queries:</strong> Only recruitment-related emails (interviews, acknowledgments, rejections) are scanned.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">No mailbox dumps:</strong> We only store relevant email headers and short snippets for matching, never your personal inbox.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">User in control:</strong> All detected matches and suggested status transitions require your explicit confirmation.
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal for Disconnecting */}
      <ConfirmModal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        onConfirm={handleDisconnectConfirm}
        title="Disconnect Gmail Account"
        message="Are you sure you want to disconnect Gmail? You can reconnect anytime. Your existing applications and previously linked timeline events will remain preserved."
        confirmText="Disconnect"
        cancelText="Cancel"
        variant="danger"
        loading={disconnecting}
      />
    </div>
  );
}


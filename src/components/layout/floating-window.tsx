"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button";

interface FloatingWindowProps {
  onOpenQuickAdd?: () => void;
}

export default function FloatingWindow({ onOpenQuickAdd }: FloatingWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col w-72 shrink-0 transition-all duration-300 ${
        isMinimized ? "h-auto self-start" : "h-[calc(100vh-7rem)] sticky top-20 mb-8"
      }`}
    >
      <div className="flex-1 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-lg overflow-hidden">
        {/* Floating Window Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--foreground)] tracking-tight">
              Floating Window
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-0.5 rounded border border-[var(--border)] hover:border-[var(--muted)] transition-colors"
          >
            {isMinimized ? "Expand" : "Minimize"}
          </button>
        </div>

        {/* Floating Window Full-Height Body */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col justify-between pt-4 overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/60 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-sm text-[var(--muted)] font-mono shadow-xs">
                ⌘
              </div>
              <p className="text-xs font-semibold text-[var(--foreground)]">Workspace Window</p>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed max-w-[200px]">
                Reserved space for upcoming widgets &amp; tools.
              </p>
            </div>

            {onOpenQuickAdd && (
              <div className="pt-4 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs justify-center"
                  onClick={onOpenQuickAdd}
                >
                  <span className="font-bold mr-1">+</span>
                  <span>Log application</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

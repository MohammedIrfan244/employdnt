"use client";

import React, { useState, useRef, useEffect } from "react";
import { APPLICATION_STATUSES, ApplicationStatus } from "@/lib/constants";

interface StatusSelectProps {
  value: ApplicationStatus;
  onChange: (newStatus: ApplicationStatus) => void;
  className?: string;
  disabled?: boolean;
}

const statusColors: Record<ApplicationStatus, string> = {
  "Applied": "bg-emerald-400",
  "Follow-up Needed": "bg-amber-400",
  "In Progress": "bg-blue-400",
  "Interview": "bg-sky-400",
  "Offer": "bg-emerald-300",
  "Rejected": "bg-zinc-500",
  "Withdrawn": "bg-zinc-500",
};

export default function StatusSelect({
  value,
  onChange,
  className = "",
  disabled = false,
}: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 280px below, flip upward
      setOpenUpward(spaceBelow < 280);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative inline-block ${isOpen ? "z-[60]" : "z-10"} ${className}`}
      ref={containerRef}
    >
      {/* Interactive Status Pill */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`
          inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border
          transition-all duration-150 cursor-pointer disabled:opacity-50
          bg-[var(--surface)] hover:bg-[var(--surface-hover)] border-[var(--border)]
          hover:border-[var(--muted-light)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30
        `}
      >
        <span className={`w-2 h-2 rounded-full ${statusColors[value] || "bg-zinc-400"}`} />
        <span className="text-[var(--foreground)]">{value}</span>
        <svg
          className={`w-3 h-3 text-[var(--muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Status Menu with auto-flip and high z-index */}
      {isOpen && (
        <div
          className={`
            absolute right-0 z-[100] w-48 bg-[var(--surface-elevated)] border border-[var(--border)]
            rounded-xl shadow-2xl p-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100
            ${openUpward ? "bottom-full mb-1.5 origin-bottom-right" : "top-full mt-1.5 origin-top-right"}
          `}
        >
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] border-b border-[var(--border)] mb-1">
            Update Status
          </div>
          {APPLICATION_STATUSES.map((st) => {
            const isSelected = st === value;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  onChange(st);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-2.5 py-1.5 text-xs rounded-lg text-left flex items-center justify-between
                  transition-colors cursor-pointer
                  ${
                    isSelected
                      ? "bg-[var(--accent-light)] text-[var(--accent-text)] font-semibold"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                  }
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${statusColors[st] || "bg-zinc-400"}`} />
                  <span className="truncate">{st}</span>
                </div>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

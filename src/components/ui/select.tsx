"use client";

import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  error,
  className = "",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
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
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-[var(--muted)]">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3.5 py-2 text-sm rounded-xl text-left
          bg-[var(--surface)] border border-[var(--border)]
          text-[var(--foreground)] flex items-center justify-between
          hover:border-[var(--muted-light)] hover:bg-[var(--surface-hover)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]
          transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500/60 focus:ring-red-500/20" : ""}
          ${isOpen ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20" : ""}
        `}
      >
        <span className={selectedOption ? "text-[var(--foreground)]" : "text-[var(--muted-light)]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--accent-text)]" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Custom Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-2xl p-1.5 max-h-60 overflow-y-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          {options.length === 0 ? (
            <div className="p-3 text-center text-xs text-[var(--muted)]">No options</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-3 py-2 text-sm rounded-lg text-left flex items-center justify-between
                    transition-colors cursor-pointer
                    ${
                      isSelected
                        ? "bg-[var(--accent-light)] text-[var(--accent-text)] font-semibold"
                        : "text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:text-white"
                    }
                  `}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-[var(--accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[var(--muted)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3.5 py-2 text-sm rounded-xl
          bg-[var(--surface)] border border-[var(--border)]
          text-[var(--foreground)] placeholder:text-[var(--muted-light)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]
          hover:border-[var(--muted-light)] transition-all
          ${error ? "border-red-500/60 focus:ring-red-500/20" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

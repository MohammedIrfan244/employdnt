import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5
        ${hover ? "hover:border-[var(--muted-light)] hover:bg-[var(--surface-hover)] transition-all duration-150" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

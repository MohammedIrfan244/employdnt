"use client";

import React from "react";
import Image from "next/image";

export type BrandBadgeSize = "sm" | "md" | "lg" | "xl" | "responsive" | number;
export type BrandBadgeMargin = "none" | "sm" | "md" | "lg" | string;

export interface BrandBadgeProps {
  /**
   * Sizing for the badge, maintaining the 2:1 width-to-height ratio.
   * - "responsive": w-24 h-12 on mobile, w-32 h-16 on desktop (kinda smaller in mobile)
   * - "sm": 96x48 (w-24 h-12) - compact
   * - "md": 128x64 (w-32 h-16) - default, navbar desktop standard
   * - "lg": 192x96 (w-48 h-24) - expanded, great for login
   * - "xl": 224x112 (w-56 h-28)
   * - number: width in px, height will automatically be width / 2
   */
  size?: BrandBadgeSize;
  /**
   * Margin around the badge.
   * Can be a preset ("none", "sm", "md", "lg") or any Tailwind margin string (e.g. "m-1.5", "m-2", "mb-4 mx-auto").
   */
  margin?: BrandBadgeMargin;
  /**
   * Optional custom class name for the wrapper.
   */
  className?: string;
  /**
   * Accessible alt text for the badge logo.
   */
  alt?: string;
  /**
   * Whether to prioritize loading (default: true for navbar/login branding).
   */
  priority?: boolean;
}

const sizeClasses: Record<"sm" | "md" | "lg" | "xl" | "responsive", { wrapper: string; width: number; height: number }> = {
  sm: { wrapper: "w-24 h-12", width: 96, height: 48 },
  md: { wrapper: "w-32 h-16", width: 128, height: 64 },
  lg: { wrapper: "w-48 h-24", width: 192, height: 96 },
  xl: { wrapper: "w-56 h-28", width: 224, height: 112 },
  responsive: { wrapper: "w-24 h-12 sm:w-32 sm:h-16", width: 128, height: 64 },
};

const marginPresets: Record<string, string> = {
  none: "m-0",
  sm: "m-1.5",
  md: "m-2.5",
  lg: "m-4",
};

export default function BrandBadge({
  size = "md",
  margin = "none",
  className = "",
  alt = "employdnt badge",
  priority = true,
}: BrandBadgeProps) {
  let wrapperSizeClass = "";
  let inlineStyle: React.CSSProperties | undefined = undefined;
  let imageWidth = 128;
  let imageHeight = 64;

  if (typeof size === "number") {
    // Single number adjusts sizing while preserving 2:1 ratio
    const width = Math.round(size);
    const height = Math.round(size / 2);
    inlineStyle = { width: `${width}px`, height: `${height}px` };
    imageWidth = width;
    imageHeight = height;
  } else if (size in sizeClasses) {
    const config = sizeClasses[size as keyof typeof sizeClasses];
    wrapperSizeClass = config.wrapper;
    imageWidth = config.width;
    imageHeight = config.height;
  } else {
    wrapperSizeClass = sizeClasses.md.wrapper;
  }

  const marginClass = marginPresets[margin] || margin;

  return (
    <div
      style={inlineStyle}
      className={`rounded-xl overflow-hidden bg-black border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent-border)] transition-colors shadow-xs shrink-0 ${wrapperSizeClass} ${marginClass} ${className}`.trim()}
    >
      <Image
        src="/svg/employdnt.svg"
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        className="w-full h-full object-contain p-1"
        priority={priority}
      />
    </div>
  );
}

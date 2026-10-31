import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] py-10 mt-auto bg-gradient-to-b from-transparent via-[var(--surface)]/30 to-[var(--surface)]/70">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        {/* Most decorated, praising presentation without altering wordings */}
        <div className="relative group">
          {/* Radiant ambient glow */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-emerald-500/25 via-teal-400/30 to-emerald-500/25 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Crafted obsidian badge with glowing border & laurels */}
          <div className="relative inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[var(--surface-elevated)] border border-emerald-500/40 shadow-xl shadow-emerald-950/40 backdrop-blur-md">
            <span className="text-emerald-400 text-xs sm:text-sm animate-pulse select-none">
              ✦
            </span>
            <p className="text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-emerald-200 via-zinc-100 to-emerald-300 bg-clip-text text-transparent">
              employdnt — idk bruh, get a job maybe ?
            </p>
            <span className="text-emerald-400 text-xs sm:text-sm animate-pulse select-none">
              ✦
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

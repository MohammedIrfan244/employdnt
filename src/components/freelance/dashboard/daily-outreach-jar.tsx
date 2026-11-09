"use client";

import React from "react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Sparkles, Plus, Check, Flame, Trophy, Send } from "lucide-react";
import Link from "next/link";

interface DailyOutreachJarProps {
  todayCount: number;
  target?: number;
  onOpenQuickAddLead?: () => void;
}

export default function DailyOutreachJar({
  todayCount,
  target = 5,
  onOpenQuickAddLead,
}: DailyOutreachJarProps) {
  const count = Math.max(0, todayCount);
  const isReached = count >= target;
  const overflowCount = Math.max(0, count - target);
  const remaining = Math.max(0, target - count);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-emerald-950/25 p-5 shadow-xs">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
      {overflowCount > 0 && (
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />
      )}

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Side: Header & Context */}
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Daily Outreach Jar
            </h2>
            <Badge
              variant={isReached ? "offer" : count > 0 ? "applied" : "default"}
              className="text-[10px] py-0.5"
            >
              Target: {target} / day
            </Badge>
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Aim for {target} client outreaches a day to maintain sales momentum. Overflow and unfinished days are totally fine — it&apos;s just for tracking.
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="font-mono text-xl font-black text-white">
              {count}
            </span>
            <span className="text-[var(--muted)] font-mono text-sm">/ {target}</span>

            {overflowCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30 animate-pulse">
                <Flame className="w-3 h-3 text-amber-400" />
                +{overflowCount} Overflow!
              </span>
            ) : isReached ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                <Trophy className="w-3 h-3 text-emerald-400" />
                Daily Target Reached!
              </span>
            ) : count > 0 ? (
              <span className="text-[11px] text-[var(--muted)]">
                ({remaining} more to hit baseline)
              </span>
            ) : (
              <span className="text-[11px] text-[var(--muted)] italic">
                (Nothing logged yet today)
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Visual Jar of 5 with Overflow Orbs & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Glass Jar Container */}
          <div className="p-3 bg-zinc-950/70 border border-emerald-500/20 rounded-2xl backdrop-blur-xs flex items-center gap-2.5 shadow-inner">
            {/* The 5 standard baseline jar slots */}
            {Array.from({ length: target }).map((_, idx) => {
              const isFilled = idx < count;
              return (
                <div
                  key={idx}
                  title={`Outreach slot ${idx + 1} of ${target}`}
                  className={`relative flex items-center justify-center w-10 h-11 rounded-xl transition-all duration-300 ${
                    isFilled
                      ? "bg-emerald-500/20 border-2 border-emerald-400/80 text-emerald-300 shadow-md shadow-emerald-500/20 scale-100"
                      : "bg-zinc-900/60 border border-zinc-700/60 text-zinc-600"
                  }`}
                >
                  {isFilled ? (
                    <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-200">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      <span className="text-[9px] font-mono font-bold text-emerald-400/80">
                        0{idx + 1}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono font-medium opacity-50">
                      0{idx + 1}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Overflow orbs if count > target */}
            {overflowCount > 0 && (
              <div
                title={`${overflowCount} overflow outreaches logged today`}
                className="relative flex items-center justify-center px-2.5 h-11 rounded-xl bg-amber-500/20 border-2 border-amber-400/80 text-amber-300 shadow-md shadow-amber-500/20 animate-in zoom-in-50"
              >
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-mono font-black text-amber-300">
                    +{overflowCount}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
            {onOpenQuickAddLead && (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenQuickAddLead}
                className="text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Outreach</span>
              </Button>
            )}
            <Link href="/freelance/email-studio">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center gap-1.5 text-[var(--muted)] hover:text-white"
              >
                <Send className="w-3 h-3 text-emerald-400" />
                <span>Email Studio</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


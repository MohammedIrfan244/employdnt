"use client";

import React from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Today", href: "/today", match: ["/", "/today"] },
    { label: "Applications", href: "/applications", match: ["/applications"] },
    { label: "Follow-up", href: "/follow-up", match: ["/follow-up"] },
    { label: "Settings", href: "/settings", match: ["/settings"] },
  ];

  const isActive = (itemMatch: string[]) => {
    return itemMatch.some((path) =>
      path === "/" ? pathname === "/" || pathname === "/today" : pathname.startsWith(path)
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-6">
          <NextLink href="/today" className="flex items-center gap-2 font-bold text-lg text-zinc-900 tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              E
            </span>
            <span>Employdnt</span>
          </NextLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.match);
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  {item.label}
                </NextLink>
              );
            })}
          </nav>
        </div>

        {/* Right side quick status / tag */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            Personal Tracker
          </span>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <nav className="md:hidden flex items-center justify-around border-t border-zinc-100 px-2 py-1.5 bg-white">
        {navItems.map((item) => {
          const active = isActive(item.match);
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`px-3 py-1 text-xs font-medium rounded ${
                active ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-zinc-500"
              }`}
            >
              {item.label}
            </NextLink>
          );
        })}
      </nav>
    </header>
  );
}

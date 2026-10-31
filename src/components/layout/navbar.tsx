"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { signOut } from "next-auth/react";
import Button from "@/components/ui/button";
import BrandBadge from "@/components/ui/brand-badge";

interface NavbarProps {
  onOpenQuickAdd?: () => void;
}

const navItems = [
  { label: "Today", href: "/today", match: ["/", "/today"] },
  { label: "Applications", href: "/applications", match: ["/applications"] },
  { label: "Follow-up", href: "/follow-up", match: ["/follow-up"] },
  { label: "Settings", href: "/settings", match: ["/settings"] },
];

function DesktopNavLinks() {
  const pathname = usePathname();

  const isActive = (itemMatch: string[]) => {
    return itemMatch.some((path) =>
      path === "/" ? pathname === "/" || pathname === "/today" : pathname.startsWith(path)
    );
  };

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const active = isActive(item.match);
        return (
          <NextLink
            key={item.href}
            href={item.href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "text-[var(--accent)] bg-[var(--accent-light)] font-semibold"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {item.label}
          </NextLink>
        );
      })}
    </nav>
  );
}

function MobileNavLinks() {
  const pathname = usePathname();

  const isActive = (itemMatch: string[]) => {
    return itemMatch.some((path) =>
      path === "/" ? pathname === "/" || pathname === "/today" : pathname.startsWith(path)
    );
  };

  return (
    <nav className="md:hidden flex items-center justify-around border-t border-[var(--border)] px-3 py-2 bg-[var(--surface)]">
      {navItems.map((item) => {
        const active = isActive(item.match);
        return (
          <NextLink
            key={item.href}
            href={item.href}
            className={`px-3 py-1 text-xs font-medium rounded-md ${
              active
                ? "text-[var(--accent)] bg-[var(--accent-light)] font-semibold"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {item.label}
          </NextLink>
        );
      })}
    </nav>
  );
}

export default function Navbar({ onOpenQuickAdd }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Badge */}
        <div className="flex items-center gap-8">
          <NextLink href="/today" className="flex items-center group" aria-label="employdnt home">
            <BrandBadge size="responsive" margin="m-1.5 sm:m-2" />
          </NextLink>

          {/* Desktop Navigation wrapped in Suspense for prerendering safety */}
          <Suspense
            fallback={
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--muted)]"
                  >
                    {item.label}
                  </NextLink>
                ))}
              </nav>
            }
          >
            <DesktopNavLinks />
          </Suspense>
        </div>

        {/* Right Actions: Quick Add & Log out */}
        <div className="flex items-center gap-3">
          {onOpenQuickAdd && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenQuickAdd}
              className="text-xs font-semibold py-1.5 px-3.5 shadow-xs"
            >
              <span className="font-bold mr-1">+</span>
              <span>Log application</span>
            </Button>
          )}

          <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-[var(--border)]">
            <NextLink
              href="/settings"
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Preferences
            </NextLink>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-red-400/80 hover:text-red-400 transition-colors font-medium cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation wrapped in Suspense for prerendering safety */}
      <Suspense fallback={<div className="h-10 md:hidden" />}>
        <MobileNavLinks />
      </Suspense>
    </header>
  );
}

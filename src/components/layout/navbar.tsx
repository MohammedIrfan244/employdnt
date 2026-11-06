"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { signOut } from "next-auth/react";
import Button from "@/components/ui/button";
import BrandBadge from "@/components/ui/brand-badge";
import { Plus, Briefcase, Rocket } from "lucide-react";

interface NavbarProps {
  onOpenQuickAdd?: () => void;
  onOpenQuickAddLead?: () => void;
}

const jobNavItems = [
  { label: "Today", href: "/today", match: ["/", "/today"] },
  { label: "Applications", href: "/applications", match: ["/applications"] },
  { label: "Follow-up", href: "/follow-up", match: ["/follow-up"] },
  { label: "Resources", href: "/resources", match: ["/resources"] },
  { label: "Profile", href: "/profile", match: ["/profile"] },
  { label: "Settings", href: "/settings", match: ["/settings"] },
];

const freelanceNavItems = [
  { label: "Pipeline", href: "/freelance", match: ["/freelance"] },
  { label: "Email Studio", href: "/freelance/email-studio", match: ["/freelance/email-studio"] },
  { label: "Resources & Form", href: "/freelance/resources", match: ["/freelance/resources"] },
];

function DesktopNavLinks() {
  const pathname = usePathname();
  const isFreelance = pathname.startsWith("/freelance");
  const items = isFreelance ? freelanceNavItems : jobNavItems;

  const isActive = (itemMatch: string[], href: string) => {
    if (href === "/freelance") {
      return pathname === "/freelance";
    }
    return itemMatch.some((path) =>
      path === "/" ? pathname === "/" || pathname === "/today" : pathname.startsWith(path)
    );
  };

  return (
    <div className="hidden md:flex items-center gap-6">
      {/* Portal Switcher Pill */}
      <div className="flex items-center p-0.5 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs font-semibold">
        <NextLink
          href="/today"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            !isFreelance
              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-bold"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-[var(--accent-text)]" />
          <span>Job Hunt</span>
        </NextLink>

        <NextLink
          href="/freelance"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            isFreelance
              ? "bg-[var(--accent-light)] text-[var(--accent-text)] border border-[var(--accent-border)] font-bold shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Rocket className="w-3.5 h-3.5 text-[var(--accent-text)]" />
          <span>Freelance CRM</span>
        </NextLink>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-1">
        {items.map((item) => {
          const active = isActive(item.match, item.href);
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
    </div>
  );
}

function MobileNavLinks() {
  const pathname = usePathname();
  const isFreelance = pathname.startsWith("/freelance");
  const items = isFreelance ? freelanceNavItems : jobNavItems;

  const isActive = (itemMatch: string[], href: string) => {
    if (href === "/freelance") {
      return pathname === "/freelance";
    }
    return itemMatch.some((path) =>
      path === "/" ? pathname === "/" || pathname === "/today" : pathname.startsWith(path)
    );
  };

  return (
    <div className="md:hidden flex flex-col border-t border-[var(--border)] bg-[var(--surface)]">
      {/* Mobile Portal Switcher */}
      <div className="flex items-center justify-around px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface-hover)]/30 text-xs">
        <NextLink
          href="/today"
          className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium ${
            !isFreelance ? "text-[var(--accent-text)] font-bold" : "text-[var(--muted)]"
          }`}
        >
          <Briefcase className="w-3 h-3" />
          <span>Job Hunt</span>
        </NextLink>
        <div className="h-3 w-px bg-[var(--border)]" />
        <NextLink
          href="/freelance"
          className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium ${
            isFreelance ? "text-[var(--accent-text)] font-bold" : "text-[var(--muted)]"
          }`}
        >
          <Rocket className="w-3 h-3" />
          <span>Freelance CRM</span>
        </NextLink>
      </div>

      <nav className="flex items-center justify-around px-2 py-2 overflow-x-auto">
        {items.map((item) => {
          const active = isActive(item.match, item.href);
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
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
    </div>
  );
}

export default function Navbar({ onOpenQuickAdd, onOpenQuickAddLead }: NavbarProps) {
  const pathname = usePathname();
  const isFreelance = pathname.startsWith("/freelance");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Badge */}
        <div className="flex items-center gap-8">
          <NextLink href={isFreelance ? "/freelance" : "/today"} className="flex items-center group" aria-label="employdnt home">
            <BrandBadge size="responsive" margin="m-1.5 sm:m-2" />
          </NextLink>

          {/* Desktop Navigation */}
          <Suspense fallback={<div className="h-10 hidden md:block w-48" />}>
            <DesktopNavLinks />
          </Suspense>
        </div>

        {/* Right Actions: Quick Add & Log out */}
        <div className="flex items-center gap-3">
          {isFreelance ? (
            onOpenQuickAddLead && (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenQuickAddLead}
                className="text-xs font-semibold py-1.5 px-3.5 shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Lead</span>
              </Button>
            )
          ) : (
            onOpenQuickAdd && (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenQuickAdd}
                className="text-xs font-semibold py-1.5 px-3.5 shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log application</span>
              </Button>
            )
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

      {/* Mobile Navigation */}
      <Suspense fallback={<div className="h-10 md:hidden" />}>
        <MobileNavLinks />
      </Suspense>
    </header>
  );
}

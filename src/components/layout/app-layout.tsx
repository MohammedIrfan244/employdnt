"use client";

import React, { useState, Suspense } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import FloatingWindow from "./floating-window";
import QuickAddModal from "@/components/shared/quick-add-modal";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Top Navbar */}
      <Suspense fallback={<div className="h-16 border-b border-[var(--border)] bg-[var(--background)]/90" />}>
        <Navbar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />
      </Suspense>

      {/* Main Container with Floating Window on Side & Content */}
      <div className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 items-start">
        {/* Floating window in place of the sidebar */}
        <FloatingWindow onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* Main Page View */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Bottom Footer */}
      <Footer />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useClientDate } from "@/hooks/use-client-date";
import QuickAddModal from "@/components/shared/quick-add-modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import StatusSelect from "@/components/ui/status-select";
import Card from "@/components/ui/card";
import { APPLICATION_STATUSES, ApplicationStatus } from "@/lib/constants";
import { IApplication } from "@/types/application";
import { ICategory } from "@/types/category";

export default function Applications() {
  const { formatDate } = useClientDate();

  const [applications, setApplications] = useState<IApplication[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch {
        // silent
      }
    }
    loadCats();
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (selectedStatus) params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/applications?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setApplications(json.data.applications || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch {
      // silent
    }
  };

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({
      value: c._id?.toString() || "",
      label: c.name,
    })),
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    ...APPLICATION_STATUSES.map((st) => ({
      value: st,
      label: st,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Applications</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Everything you have sent out, kept organized in one calm place
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setIsQuickAddOpen(true)}
          className="self-start sm:self-auto"
        >
          <span>+</span> Log application
        </Button>
      </div>

      {/* Filter Row with Custom Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by company or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val)}
          options={categoryOptions}
        />
        <Select
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val)}
          options={statusOptions}
        />
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--muted)] animate-pulse">
          Loading your applications...
        </div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-12 space-y-2">
          <p className="text-sm font-medium text-[var(--foreground)]">No applications found</p>
          <p className="text-xs text-[var(--muted)]">Try adjusting your filters or record a new application.</p>
        </Card>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)] shadow-xs relative">
          {applications.map((app) => {
            const catName =
              typeof app.categoryId === "object" && app.categoryId !== null && "name" in app.categoryId
                ? (app.categoryId as { name: string }).name
                : "Category";

            return (
              <div
                key={app._id?.toString()}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-hover)] transition-colors relative first:rounded-t-2xl last:rounded-b-2xl focus-within:z-30 hover:z-20"
              >
                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/applications/${app._id}`}
                      className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent-text)] transition-colors"
                    >
                      {app.company}
                    </Link>
                    <span className="text-xs text-[var(--muted)]">• {app.role}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)]">
                      {catName}
                    </span>
                    <span>Applied on {formatDate(app.appliedDate)}</span>
                    {app.salary && <span>• {app.salary}</span>}
                  </div>
                </div>

                {/* Custom Status Select & View Details */}
                <div className="flex items-center gap-3">
                  <StatusSelect
                    value={app.status}
                    onChange={(newStatus) => handleStatusChange(app._id!.toString(), newStatus)}
                  />

                  <Link href={`/applications/${app._id}`}>
                    <Button variant="ghost" size="sm">
                      Details →
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          fetchApplications();
        }}
      />
    </div>
  );
}

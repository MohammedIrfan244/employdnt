"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useClientDate } from "@/hooks/use-client-date";
import QuickAddModal from "@/components/shared/quick-add-modal";
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

  // Load categories
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

  // Fetch applications
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

  // Handle status update
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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Follow-up Needed":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "In Progress":
      case "Interview":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Offer":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Rejected":
      case "Withdrawn":
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Applications</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage and track all your recorded job applications
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="text-sm leading-none">+</span> Add Application
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white text-zinc-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id?.toString()} value={c._id?.toString()}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white text-zinc-700"
          >
            <option value="">All Statuses</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 border border-zinc-100 rounded-xl bg-zinc-50 text-center text-xs text-zinc-400 animate-pulse">
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-xl border border-dashed border-zinc-200 bg-white text-center space-y-2">
          <p className="text-sm font-medium text-zinc-700">No applications match your filter</p>
          <p className="text-xs text-zinc-400">Try adjusting your search criteria or add a new application.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200/80 rounded-xl divide-y divide-zinc-100 overflow-hidden shadow-xs">
          {applications.map((app) => {
            const catName =
              typeof app.categoryId === "object" && app.categoryId !== null && "name" in app.categoryId
                ? (app.categoryId as { name: string }).name
                : "Category";

            return (
              <div
                key={app._id?.toString()}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
              >
                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/applications/${app._id}`}
                      className="text-sm font-bold text-zinc-900 hover:text-emerald-700 transition-colors"
                    >
                      {app.company}
                    </Link>
                    <span className="text-xs text-zinc-500">• {app.role}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                      {catName}
                    </span>
                    <span>Applied on {formatDate(app.appliedDate)}</span>
                    {app.salary && <span>• {app.salary}</span>}
                  </div>
                </div>

                {/* Status selector & Details */}
                <div className="flex items-center gap-3">
                  <select
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(app._id!.toString(), e.target.value as ApplicationStatus)
                    }
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${getStatusBadgeStyle(
                      app.status
                    )}`}
                  >
                    {APPLICATION_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <Link
                    href={`/applications/${app._id}`}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
                  >
                    View →
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

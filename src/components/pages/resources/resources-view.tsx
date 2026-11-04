"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { IResource, ResourceCategory } from "@/types/resource";
import {
  Bookmark,
  ExternalLink,
  Plus,
  Search,
  Pin,
  Trash2,
  X,
  FolderOpen,
} from "lucide-react";

const CATEGORIES: Array<"All" | ResourceCategory> = [
  "All",
  "Job Boards",
  "Company Portals",
  "Interview Prep",
  "Recruiter Contacts",
  "Portfolio & Docs",
  "Other",
];

export default function ResourcesView() {
  const [resources, setResources] = useState<IResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<"All" | ResourceCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("Job Boards");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setResources(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setCategory("Job Boards");
    setDescription("");
    setTagsInput("");
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: IResource) => {
    setEditingId(res._id ? res._id.toString() : null);
    setTitle(res.title);
    setUrl(res.url);
    setCategory(res.category);
    setDescription(res.description || "");
    setTagsInput((res.tags || []).join(", "));
    setIsPinned(Boolean(res.isPinned));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setSaving(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingId) {
        const res = await fetch(`/api/resources/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, url, category, description, tags, isPinned }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          await fetchResources();
        }
      } else {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, url, category, description, tags, isPinned }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          await fetchResources();
        }
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this resource bookmark?")) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setResources((prev) => prev.filter((r) => r._id?.toString() !== id));
      }
    } catch {
      // silent
    }
  };

  const handleTogglePin = async (res: IResource) => {
    try {
      const newPinned = !res.isPinned;
      const resId = res._id!.toString();
      const patchRes = await fetch(`/api/resources/${resId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: newPinned }),
      });
      const json = await patchRes.json();
      if (json.success) {
        setResources((prev) =>
          prev.map((r) => (r._id?.toString() === resId ? { ...r, isPinned: newPinned } : r))
        );
      }
    } catch {
      // silent
    }
  };

  const filteredResources = resources.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
            Resource Library
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Keep essential job boards, interview prep sites, and company portals organized.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Resource</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[var(--accent-light)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      {/* Grid of Resources */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--muted)]">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] mx-auto flex items-center justify-center text-[var(--muted)]">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">No resources found</p>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              {searchQuery
                ? `No bookmarks matching "${searchQuery}".`
                : "Add your favorite job boards, interview links, or recruiter portals."}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleOpenAdd} className="text-xs">
            + Add new resource
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => (
            <Card
              key={res._id?.toString()}
              className={`p-4 space-y-3 border transition-colors flex flex-col justify-between ${
                res.isPinned
                  ? "border-[var(--accent-border)] bg-[var(--surface-elevated)]/30"
                  : "border-[var(--border)] hover:border-[var(--muted)]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider block">
                      {res.category}
                    </span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sm text-[var(--foreground)] hover:text-[var(--accent-text)] transition-colors truncate flex items-center gap-1.5 group"
                    >
                      <span className="truncate">{res.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePin(res)}
                    className={`p-1 rounded transition-colors ${
                      res.isPinned
                        ? "text-[var(--accent-text)] hover:opacity-75"
                        : "text-[var(--muted-light)] hover:text-[var(--foreground)]"
                    }`}
                    title={res.isPinned ? "Unpin resource" : "Pin resource to top"}
                  >
                    <Pin className={`w-3.5 h-3.5 ${res.isPinned ? "fill-current" : ""}`} />
                  </button>
                </div>

                {res.description && (
                  <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
                {res.tags && res.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {res.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--muted)] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-[var(--accent-text)] hover:underline flex items-center gap-1"
                  >
                    <span>Visit site</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(res)}
                      className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] px-1.5 py-0.5 rounded hover:bg-[var(--surface-hover)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(res._id!.toString())}
                      className="text-[11px] text-[var(--muted)] hover:text-red-400 p-1 rounded hover:bg-[var(--surface-hover)]"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[var(--accent-text)]" />
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  {editingId ? "Edit Resource" : "Add New Resource"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">Resource Title *</label>
                <Input
                  required
                  placeholder="e.g. Levels.fyi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">URL *</label>
                <Input
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                  className="w-full h-9 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">Description (Optional)</label>
                <Textarea
                  rows={2}
                  placeholder="Brief note on what this resource is used for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[var(--muted)]">Tags (comma-separated)</label>
                <Input
                  placeholder="salary, remote, tech"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                />
                <span className="text-xs text-[var(--muted)]">Pin to top of library</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Resource"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


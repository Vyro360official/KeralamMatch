"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Edit3, Trash2, X, CheckCircle2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BlogItem {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  status: "Published" | "Draft";
  publishedOn: string;
}

const INITIAL_BLOGS: BlogItem[] = [
  { id: "bl-1", title: "How Arjun and Priya Found Each Other Across Continents", category: "Success Stories", excerpt: "A story of true love spanning from Trivandrum to London.", status: "Published", publishedOn: "12 May 2024" },
  { id: "bl-2", title: "10 Safety Tips Every Bride Should Know Before Sharing Contact", category: "Tips & Safety", excerpt: "Essential privacy practices for modern Malayali matrimony.", status: "Published", publishedOn: "09 May 2024" },
  { id: "bl-3", title: "The Rise of Privacy-First Matrimony in Kerala", category: "Community", excerpt: "Why ephemeral 24-hour contact reveals are transforming matchmaking.", status: "Draft", publishedOn: "—" },
  { id: "bl-4", title: "Nair Community Weddings: Traditions and Modern Matches", category: "Culture", excerpt: "Exploring customary rituals and contemporary lifestyle compatibility.", status: "Published", publishedOn: "05 May 2024" },
  { id: "bl-5", title: "How We Verify Every Profile on KeralamMatch", category: "Platform Updates", excerpt: "Our dual-tier AI selfie match and government ID verification process.", status: "Published", publishedOn: "03 May 2024" },
];

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>(INITIAL_BLOGS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // New Blog form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Tips & Safety");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newStatus, setNewStatus] = useState<"Published" | "Draft">("Published");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const created: BlogItem = {
      id: "bl-" + Date.now().toString().slice(-4),
      title: newTitle,
      category: newCategory,
      excerpt: newExcerpt || newTitle,
      status: newStatus,
      publishedOn: newStatus === "Published" ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
    };
    setBlogs([created, ...blogs]);
    showToast(`Article "${newTitle}" created successfully.`);
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewExcerpt("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    setBlogs((prev) => prev.map((b) => (b.id === editingBlog.id ? editingBlog : b)));
    showToast(`Article "${editingBlog.title}" updated.`);
    setEditingBlog(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const target = blogs.find((b) => b.id === id);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    showToast(`Article "${target?.title || id}" deleted.`);
  };

  return (
    <div className="space-y-6 text-[#1C1C1E]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F44]">Blog & Content CMS</h1>
          <p className="text-xs text-[#636366]">Create, edit and manage articles and success stories</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Article</span>
        </button>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 border border-[rgba(28,28,30,0.08)] shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(28,28,30,0.08)] text-[#8E8E93] uppercase text-[10px] font-bold">
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Published On</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(28,28,30,0.06)]">
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-[#FCFBF7] transition-colors">
                  <td className="py-3.5 font-bold text-[#0A1F44] max-w-xs truncate">
                    <div>{b.title}</div>
                    <div className="text-[10px] text-[#8E8E93] font-normal truncate">{b.excerpt}</div>
                  </td>
                  <td className="py-3.5 text-[#636366]">{b.category}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      b.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-[#8E8E93]">{b.publishedOn}</td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => setEditingBlog(b)}
                      className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD ARTICLE MODAL ────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Publish New Article</h3>
                <p className="text-xs text-[#636366]">Write content for the public matrimony blog</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Article Title *</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 5 Questions to Ask in First Family Meeting"
                  className="rounded-full h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Success Stories">Success Stories</option>
                    <option value="Tips & Safety">Tips & Safety</option>
                    <option value="Community">Community</option>
                    <option value="Culture">Culture</option>
                    <option value="Platform Updates">Platform Updates</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Excerpt Summary</label>
                <textarea
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  placeholder="Short introductory summary for card preview..."
                  rows={3}
                  className="w-full rounded-2xl border border-[rgba(28,28,30,0.12)] p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[rgba(28,28,30,0.08)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT ARTICLE MODAL ───────────────────────────────────────────── */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[rgba(28,28,30,0.12)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0A1F44]">Edit Article</h3>
                <p className="text-xs text-[#636366]">Article ID: {editingBlog.id}</p>
              </div>
              <button onClick={() => setEditingBlog(null)} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Article Title</label>
                <Input
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  className="rounded-full h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Category</label>
                  <select
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Success Stories">Success Stories</option>
                    <option value="Tips & Safety">Tips & Safety</option>
                    <option value="Community">Community</option>
                    <option value="Culture">Culture</option>
                    <option value="Platform Updates">Platform Updates</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Status</label>
                  <select
                    value={editingBlog.status}
                    onChange={(e) => setEditingBlog({ ...editingBlog, status: e.target.value as any })}
                    className="w-full h-10 rounded-full border border-[rgba(28,28,30,0.12)] px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#636366] mb-1.5">Excerpt Summary</label>
                <textarea
                  value={editingBlog.excerpt}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  rows={3}
                  className="w-full rounded-2xl border border-[rgba(28,28,30,0.12)] p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[rgba(28,28,30,0.08)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 rounded-full border border-[rgba(28,28,30,0.12)] text-xs font-bold text-[#636366]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#C81D45] hover:bg-[#A51436] text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

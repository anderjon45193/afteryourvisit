"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Trash2, X, Loader2 } from "lucide-react";

interface Snippet {
  id: string;
  label: string;
  text: string;
  category: string | null;
  createdAt: string;
}

const categories = [
  { value: "all", label: "All" },
  { value: "aftercare", label: "Aftercare" },
  { value: "scheduling", label: "Scheduling" },
  { value: "general", label: "General" },
];

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [newSnippet, setNewSnippet] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addAttempted, setAddAttempted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/snippets")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        setSnippets(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? snippets : snippets.filter((s) => s.category === filter);

  const handleAdd = async () => {
    setAddAttempted(true);
    if (!newSnippet.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newSnippet.trim(),
          text: newSnippet.trim(),
          category: newCategory,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setSnippets([created, ...snippets]);
        setNewSnippet("");
        setAddAttempted(false);
        setShowAdd(false);
      }
    } catch {
      // Create failed
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSnippets(snippets.filter((s) => s.id !== id));
      }
    } catch {
      // Delete failed
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-warm-900">Snippets</h1>
          <p className="text-sm text-warm-400 mt-1">
            Quick-insert text for follow-up notes
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Snippet
        </Button>
      </div>

      {/* Add snippet form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-teal-200 shadow-sm p-4 mb-6"
        >
          <div className="flex gap-3 mb-3">
            <Input
              placeholder="Enter snippet text..."
              value={newSnippet}
              onChange={(e) => { setNewSnippet(e.target.value); setAddAttempted(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className={`flex-1 ${addAttempted && !newSnippet.trim() ? "border-red-300 focus-visible:ring-red-300" : ""}`}
              autoFocus
            />
            <Button onClick={handleAdd} disabled={adding} className="bg-teal-600 hover:bg-teal-700 text-white">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {addAttempted && !newSnippet.trim() && (
            <p className="text-xs text-red-500 mb-2">Snippet text is required</p>
          )}
          <div className="flex gap-2">
            {categories
              .filter((c) => c.value !== "all")
              .map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setNewCategory(cat.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    newCategory === cat.value
                      ? "bg-teal-600 text-white"
                      : "bg-warm-100 text-warm-500 hover:bg-warm-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
          </div>
        </motion.div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === cat.value
                ? "bg-teal-600 text-white"
                : "bg-warm-100 text-warm-500 hover:bg-warm-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-warm-100 px-4 py-3 animate-pulse">
              <div className="h-4 bg-warm-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Snippets list */}
      {!loading && (
        <div className="space-y-2">
          {filtered.map((snippet, i) => (
            <motion.div
              key={snippet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="flex items-center justify-between bg-white rounded-lg border border-warm-100 px-4 py-3 hover:border-warm-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-warm-300" />
                <span className="text-sm text-warm-700">{snippet.label}</span>
                <Badge variant="secondary" className="bg-warm-50 text-warm-400 text-[10px]">
                  {snippet.category || "general"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(snippet.id)}
                disabled={deletingId === snippet.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-warm-300 hover:text-red-500 h-8 w-8"
              >
                {deletingId === snippet.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-8 h-8 text-warm-200 mx-auto mb-3" />
          <p className="text-warm-400 mb-3">
            {snippets.length === 0
              ? "Snippets are reusable text you can quickly insert into follow-up notes."
              : "No snippets match this filter."}
          </p>
          {snippets.length === 0 && (
            <Button
              onClick={() => setShowAdd(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Snippet
            </Button>
          )}
        </div>
      )}
    </>
  );
}

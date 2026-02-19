"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Trash2, X } from "lucide-react";

const initialSnippets = [
  { id: "1", label: "Take ibuprofen as needed for 3 days", category: "aftercare" },
  { id: "2", label: "Soft foods only for 24 hours", category: "aftercare" },
  { id: "3", label: "Call if pain persists beyond 48 hours", category: "aftercare" },
  { id: "4", label: "Avoid hot/cold foods today", category: "aftercare" },
  { id: "5", label: "Floss gently around the treated area", category: "aftercare" },
  { id: "6", label: "Rinse with warm salt water tonight", category: "aftercare" },
  { id: "7", label: "Schedule next visit in 6 months", category: "scheduling" },
  { id: "8", label: "Wear retainer every night", category: "aftercare" },
  { id: "9", label: "Use prescribed mouthwash twice daily", category: "aftercare" },
];

const categories = [
  { value: "all", label: "All" },
  { value: "aftercare", label: "Aftercare" },
  { value: "scheduling", label: "Scheduling" },
  { value: "general", label: "General" },
];

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState(initialSnippets);
  const [filter, setFilter] = useState("all");
  const [newSnippet, setNewSnippet] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered =
    filter === "all" ? snippets : snippets.filter((s) => s.category === filter);

  const handleAdd = () => {
    if (!newSnippet.trim()) return;
    setSnippets([
      ...snippets,
      {
        id: String(Date.now()),
        label: newSnippet.trim(),
        category: "general",
      },
    ]);
    setNewSnippet("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setSnippets(snippets.filter((s) => s.id !== id));
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
          <div className="flex gap-3">
            <Input
              placeholder="Enter snippet text..."
              value={newSnippet}
              onChange={(e) => setNewSnippet(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-700 text-white">
              Add
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
              <X className="w-4 h-4" />
            </Button>
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

      {/* Snippets list */}
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
                {snippet.category}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(snippet.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-warm-300 hover:text-red-500 h-8 w-8"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-8 h-8 text-warm-200 mx-auto mb-3" />
          <p className="text-warm-400">No snippets found.</p>
        </div>
      )}
    </>
  );
}

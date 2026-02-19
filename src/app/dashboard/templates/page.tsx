"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FileText,
  Edit,
  Copy,
  Trash2,
  MessageSquare,
  Layers,
  X,
  GripVertical,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────

interface Section {
  type: "notes" | "checklist" | "links" | "text";
  title: string;
  content?: string;
  items?: string[];
  links?: { label: string; url: string }[];
}

interface Template {
  id: string;
  name: string;
  smsMessage: string;
  pageHeading: string;
  pageSubheading: string | null;
  sections: Section[];
  showReviewCta: boolean;
  showBookingCta: boolean;
  isDefault: boolean;
  isSystemTemplate: boolean;
  businessId: string | null;
  createdAt: string;
  updatedAt: string;
}

type EditorMode = "create" | "edit" | "duplicate";

interface EditorState {
  name: string;
  smsMessage: string;
  pageHeading: string;
  pageSubheading: string;
  sections: Section[];
  showReviewCta: boolean;
  showBookingCta: boolean;
}

const EMPTY_EDITOR: EditorState = {
  name: "",
  smsMessage:
    "Hi {{firstName}}! Thanks for visiting {{businessName}} today. Here's your visit summary: {{link}}",
  pageHeading: "Thanks for visiting, {{firstName}}!",
  pageSubheading: "",
  sections: [
    { type: "notes", title: "Your Visit Notes", content: "{{customNotes}}" },
  ],
  showReviewCta: true,
  showBookingCta: true,
};

// ─── Section Editor ─────────────────────────────────────

function SectionEditor({
  section,
  index,
  onChange,
  onRemove,
}: {
  section: Section;
  index: number;
  onChange: (index: number, section: Section) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="border border-warm-100 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <GripVertical className="w-3.5 h-3.5 text-warm-300 shrink-0" />
        <Select
          value={section.type}
          onValueChange={(val) =>
            onChange(index, {
              ...section,
              type: val as Section["type"],
              content:
                val === "notes"
                  ? "{{customNotes}}"
                  : val === "text"
                    ? section.content || ""
                    : undefined,
              items: val === "checklist" ? section.items || [""] : undefined,
              links:
                val === "links"
                  ? section.links || [{ label: "", url: "" }]
                  : undefined,
            })
          }
        >
          <SelectTrigger className="h-8 text-xs w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="notes">Notes</SelectItem>
            <SelectItem value="checklist">Checklist</SelectItem>
            <SelectItem value="links">Links</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={section.title}
          onChange={(e) =>
            onChange(index, { ...section, title: e.target.value })
          }
          placeholder="Section title"
          className="h-8 text-xs flex-1"
        />
        <button
          onClick={() => onRemove(index)}
          className="text-warm-300 hover:text-red-500 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section-type-specific content */}
      {section.type === "notes" && (
        <p className="text-[11px] text-warm-400 pl-6">
          Auto-filled with custom notes from each follow-up
        </p>
      )}

      {section.type === "text" && (
        <Textarea
          value={section.content || ""}
          onChange={(e) =>
            onChange(index, { ...section, content: e.target.value })
          }
          placeholder="Enter text content..."
          className="text-xs min-h-[60px] ml-6"
        />
      )}

      {section.type === "checklist" && (
        <div className="space-y-1.5 pl-6">
          {(section.items || []).map((item, itemIdx) => (
            <div key={itemIdx} className="flex items-center gap-1.5">
              <span className="text-warm-300 text-xs">•</span>
              <Input
                value={item}
                onChange={(e) => {
                  const newItems = [...(section.items || [])];
                  newItems[itemIdx] = e.target.value;
                  onChange(index, { ...section, items: newItems });
                }}
                placeholder="Checklist item"
                className="h-7 text-xs flex-1"
              />
              <button
                onClick={() => {
                  const newItems = (section.items || []).filter(
                    (_, i) => i !== itemIdx
                  );
                  onChange(index, {
                    ...section,
                    items: newItems.length ? newItems : [""],
                  });
                }}
                className="text-warm-300 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              onChange(index, {
                ...section,
                items: [...(section.items || []), ""],
              })
            }
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            + Add item
          </button>
        </div>
      )}

      {section.type === "links" && (
        <div className="space-y-1.5 pl-6">
          {(section.links || []).map((link, linkIdx) => (
            <div key={linkIdx} className="flex items-center gap-1.5">
              <Input
                value={link.label}
                onChange={(e) => {
                  const newLinks = [...(section.links || [])];
                  newLinks[linkIdx] = { ...link, label: e.target.value };
                  onChange(index, { ...section, links: newLinks });
                }}
                placeholder="Label"
                className="h-7 text-xs flex-1"
              />
              <Input
                value={link.url}
                onChange={(e) => {
                  const newLinks = [...(section.links || [])];
                  newLinks[linkIdx] = { ...link, url: e.target.value };
                  onChange(index, { ...section, links: newLinks });
                }}
                placeholder="URL"
                className="h-7 text-xs flex-1"
              />
              <button
                onClick={() => {
                  const newLinks = (section.links || []).filter(
                    (_, i) => i !== linkIdx
                  );
                  onChange(index, {
                    ...section,
                    links: newLinks.length
                      ? newLinks
                      : [{ label: "", url: "" }],
                  });
                }}
                className="text-warm-300 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              onChange(index, {
                ...section,
                links: [...(section.links || []), { label: "", url: "" }],
              })
            }
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            + Add link
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Sheet / editor state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ ...EMPTY_EDITOR });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ─── Fetch templates ─────────────────────────────────
  const fetchTemplates = useCallback(() => {
    setLoading(true);
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // ─── Editor helpers ──────────────────────────────────

  function openCreate() {
    setEditorMode("create");
    setEditingId(null);
    setEditor({ ...EMPTY_EDITOR });
    setSheetOpen(true);
  }

  function openEdit(tpl: Template) {
    setEditorMode("edit");
    setEditingId(tpl.id);
    setEditor({
      name: tpl.name,
      smsMessage: tpl.smsMessage,
      pageHeading: tpl.pageHeading,
      pageSubheading: tpl.pageSubheading || "",
      sections: JSON.parse(JSON.stringify(tpl.sections)),
      showReviewCta: tpl.showReviewCta,
      showBookingCta: tpl.showBookingCta,
    });
    setSheetOpen(true);
  }

  function openDuplicate(tpl: Template) {
    setEditorMode("duplicate");
    setEditingId(null);
    setEditor({
      name: `${tpl.name} (Copy)`,
      smsMessage: tpl.smsMessage,
      pageHeading: tpl.pageHeading,
      pageSubheading: tpl.pageSubheading || "",
      sections: JSON.parse(JSON.stringify(tpl.sections)),
      showReviewCta: tpl.showReviewCta,
      showBookingCta: tpl.showBookingCta,
    });
    setSheetOpen(true);
  }

  function updateSection(index: number, section: Section) {
    const next = [...editor.sections];
    next[index] = section;
    setEditor({ ...editor, sections: next });
  }

  function removeSection(index: number) {
    setEditor({
      ...editor,
      sections: editor.sections.filter((_, i) => i !== index),
    });
  }

  function addSection() {
    setEditor({
      ...editor,
      sections: [
        ...editor.sections,
        { type: "text", title: "New Section", content: "" },
      ],
    });
  }

  // ─── Save (create or update) ─────────────────────────

  async function handleSave() {
    if (!editor.name.trim() || !editor.smsMessage.trim() || !editor.pageHeading.trim()) return;

    setSaving(true);
    try {
      const body = {
        name: editor.name,
        smsMessage: editor.smsMessage,
        pageHeading: editor.pageHeading,
        pageSubheading: editor.pageSubheading || null,
        sections: editor.sections,
        showReviewCta: editor.showReviewCta,
        showBookingCta: editor.showBookingCta,
      };

      if (editorMode === "edit" && editingId) {
        const res = await fetch(`/api/templates/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
      }

      setSheetOpen(false);
      fetchTemplates();
    } catch {
      // Error silently handled — could add toast in the future
    } finally {
      setSaving(false);
    }
  }

  // ─── Delete ──────────────────────────────────────────

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteConfirm(null);
      fetchTemplates();
    } catch {
      // Could add toast
    }
  }

  // ─── Derived data ────────────────────────────────────

  function usageCount(templateId: string) {
    // placeholder — would come from API in production
    return 0;
  }

  const canSave =
    editor.name.trim() &&
    editor.smsMessage.trim() &&
    editor.pageHeading.trim();

  const sheetTitle =
    editorMode === "edit"
      ? "Edit Template"
      : editorMode === "duplicate"
        ? "Duplicate Template"
        : "Create Template";

  // ─── Render ──────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-warm-900">Templates</h1>
          <p className="text-sm text-warm-400 mt-1">
            Manage your follow-up message templates
          </p>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-warm-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading templates...
        </div>
      )}

      {/* Empty state */}
      {!loading && templates.length === 0 && (
        <div className="text-center py-20">
          <FileText className="w-10 h-10 text-warm-200 mx-auto mb-3" />
          <p className="text-warm-500 mb-1">No templates yet</p>
          <p className="text-sm text-warm-400 mb-4">
            Create your first follow-up template to get started.
          </p>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}

      {/* Template grid */}
      {!loading && templates.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {templates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="bg-white rounded-xl border border-warm-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-warm-800">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {template.isDefault && (
                        <Badge
                          variant="secondary"
                          className="bg-teal-50 text-teal-700 text-[10px]"
                        >
                          Default
                        </Badge>
                      )}
                      {template.isSystemTemplate && (
                        <Badge
                          variant="secondary"
                          className="bg-warm-50 text-warm-500 text-[10px]"
                        >
                          Built-in
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-warm-400 leading-relaxed mb-4 line-clamp-2">
                {template.smsMessage}
              </p>

              <div className="flex items-center gap-4 text-xs text-warm-400 mb-4">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {template.sections.length} sections
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {usageCount(template.id)} uses
                </span>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => openEdit(template)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => openDuplicate(template)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Duplicate
                </Button>
                {!template.isSystemTemplate && (
                  <>
                    {deleteConfirm === template.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleDelete(template.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 text-red-500 hover:text-red-600 hover:border-red-200"
                        onClick={() => setDeleteConfirm(template.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Template Editor Sheet ──────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-warm-900">{sheetTitle}</SheetTitle>
            <SheetDescription>
              {editorMode === "edit"
                ? "Update this template's settings and content."
                : "Set up your template's SMS message, page content, and sections."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4 pb-24">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-warm-700 mb-1.5 block">
                Template Name
              </label>
              <Input
                value={editor.name}
                onChange={(e) =>
                  setEditor({ ...editor, name: e.target.value })
                }
                placeholder="e.g. Standard Cleaning"
                className="text-sm"
              />
            </div>

            {/* SMS Message */}
            <div>
              <label className="text-xs font-medium text-warm-700 mb-1.5 block">
                SMS Message
              </label>
              <Textarea
                value={editor.smsMessage}
                onChange={(e) =>
                  setEditor({ ...editor, smsMessage: e.target.value })
                }
                placeholder="Hi {{firstName}}! ..."
                className="text-sm min-h-[80px]"
              />
              <p className="text-[11px] text-warm-400 mt-1">
                Variables: {"{{firstName}}"}, {"{{businessName}}"},{" "}
                {"{{link}}"}
              </p>
            </div>

            {/* Page Heading */}
            <div>
              <label className="text-xs font-medium text-warm-700 mb-1.5 block">
                Page Heading
              </label>
              <Input
                value={editor.pageHeading}
                onChange={(e) =>
                  setEditor({ ...editor, pageHeading: e.target.value })
                }
                placeholder="Thanks for visiting, {{firstName}}!"
                className="text-sm"
              />
            </div>

            {/* Page Subheading */}
            <div>
              <label className="text-xs font-medium text-warm-700 mb-1.5 block">
                Page Subheading{" "}
                <span className="text-warm-400 font-normal">(optional)</span>
              </label>
              <Input
                value={editor.pageSubheading}
                onChange={(e) =>
                  setEditor({ ...editor, pageSubheading: e.target.value })
                }
                placeholder="Please review these instructions carefully"
                className="text-sm"
              />
            </div>

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-warm-700">
                  Sections
                </label>
                <button
                  onClick={addSection}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add section
                </button>
              </div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {editor.sections.map((section, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SectionEditor
                        section={section}
                        index={idx}
                        onChange={updateSection}
                        onRemove={removeSection}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {editor.sections.length === 0 && (
                  <p className="text-xs text-warm-400 text-center py-4 border border-dashed border-warm-200 rounded-lg">
                    No sections yet. Add one above.
                  </p>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-warm-700">
                  Show Google Review CTA
                </label>
                <Switch
                  checked={editor.showReviewCta}
                  onCheckedChange={(val) =>
                    setEditor({ ...editor, showReviewCta: val })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-warm-700">
                  Show Booking CTA
                </label>
                <Switch
                  checked={editor.showBookingCta}
                  onCheckedChange={(val) =>
                    setEditor({ ...editor, showBookingCta: val })
                  }
                />
              </div>
            </div>
          </div>

          {/* Fixed bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-warm-100 bg-white p-4 flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              disabled={!canSave || saving}
              onClick={handleSave}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editorMode === "edit" ? (
                "Save Changes"
              ) : (
                "Create Template"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

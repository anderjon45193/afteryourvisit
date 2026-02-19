"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Upload,
  Users,
  Trash2,
  Send,
  Star,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Pencil,
} from "lucide-react";
import Link from "next/link";

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string | null;
  tags: string[];
  source: string;
  totalFollowUps: number;
  lastFollowUpAt: string | null;
  hasLeftReview: boolean;
  notes: string | null;
  optedOut: boolean;
  createdAt: string;
}

interface FollowUpHistory {
  id: string;
  templateName: string;
  status: string;
  createdAt: string;
}

interface ContactDetail extends Contact {
  followUps: FollowUpHistory[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function relativeDate(dateStr: string | null) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getInitials(firstName: string, lastName: string | null) {
  return `${firstName[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

// Simple CSV parser
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(parseCSVLine);
  return { headers, rows };
}

const filterOptions = [
  { value: "all", label: "All" },
  { value: "has_review", label: "Has Review" },
  { value: "no_review", label: "No Review" },
  { value: "opted_out", label: "Opted Out" },
];

const mappableFields = [
  { value: "skip", label: "Skip" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "tags", label: "Tag" },
];

function autoDetectMapping(header: string): string {
  const h = header.toLowerCase().replace(/[_\s-]/g, "");
  if (h.includes("firstname") || h === "first" || h === "name") return "firstName";
  if (h.includes("lastname") || h === "last" || h === "surname") return "lastName";
  if (h.includes("phone") || h.includes("mobile") || h.includes("cell") || h.includes("tel")) return "phone";
  if (h.includes("email") || h.includes("mail")) return "email";
  if (h.includes("tag") || h.includes("group") || h.includes("category")) return "tags";
  return "skip";
}

export default function ContactsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6 text-warm-400">Loading contacts...</div>}>
      <ContactsPage />
    </Suspense>
  );
}

function ContactsPage() {
  const searchParams = useSearchParams();

  // Main state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sortField] = useState("createdAt");
  const [sortDir] = useState("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sheets
  const [detailContact, setDetailContact] = useState<ContactDetail | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showImportSheet, setShowImportSheet] = useState(false);

  // Detail edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", phone: "", email: "", notes: "" });

  // Add contact form
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", phone: "", email: "", notes: "" });
  const [addError, setAddError] = useState("");

  // Import state
  const [importStep, setImportStep] = useState(1);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ importedCount: number; skippedCount: number; errorCount: number } | null>(null);
  const [importing, setImporting] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Open import sheet from query param
  useEffect(() => {
    if (searchParams.get("import") === "true") {
      setShowImportSheet(true);
    }
  }, [searchParams]);

  const fetchContacts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        sort: sortField,
        sortDir,
      });
      if (search) params.set("search", search);
      if (filter && filter !== "all") params.set("filter", filter);

      const res = await fetch(`/api/contacts?${params}`);
      const data = await res.json();
      setContacts(data.data);
      setPagination(data.pagination);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, filter, sortField, sortDir]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchContacts(), 300);
  };

  // Contact detail
  const openDetail = async (contactId: string) => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`);
      const data = await res.json();
      setDetailContact(data);
      setEditing(false);
    } catch {
      // ignore
    }
  };

  const startEditing = () => {
    if (!detailContact) return;
    setEditForm({
      firstName: detailContact.firstName,
      lastName: detailContact.lastName || "",
      phone: detailContact.phone,
      email: detailContact.email || "",
      notes: detailContact.notes || "",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!detailContact) return;
    try {
      const res = await fetch(`/api/contacts/${detailContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName || null,
          phone: editForm.phone,
          email: editForm.email || null,
          notes: editForm.notes || null,
        }),
      });
      const updated = await res.json();
      setDetailContact({ ...detailContact, ...updated });
      setEditing(false);
      fetchContacts();
    } catch {
      // ignore
    }
  };

  // Add contact
  const handleAdd = async () => {
    setAddError("");
    if (!addForm.firstName.trim() || !addForm.phone.trim()) {
      setAddError("First name and phone are required");
      return;
    }
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: addForm.firstName.trim(),
          lastName: addForm.lastName.trim() || null,
          phone: addForm.phone.trim(),
          email: addForm.email.trim() || null,
          notes: addForm.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || "Failed to add contact");
        return;
      }
      setShowAddSheet(false);
      setAddForm({ firstName: "", lastName: "", phone: "", email: "", notes: "" });
      fetchContacts();
    } catch {
      setAddError("Something went wrong");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await fetch("/api/contacts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", contactIds: ids }),
      });
      setSelectedIds(new Set());
      fetchContacts();
    } catch {
      // ignore
    }
  };

  // CSV Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      setCsvHeaders(headers);
      setCsvRows(rows);
      setColumnMapping(headers.map(autoDetectMapping));
      setImportStep(2);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    const mappedRows = csvRows.map((row) => {
      const obj: Record<string, string> = {};
      columnMapping.forEach((field, i) => {
        if (field !== "skip" && row[i]) {
          obj[field] = row[i];
        }
      });
      return obj;
    }).filter((r) => r.firstName || r.phone);

    try {
      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: mappedRows, fileName: csvFileName }),
      });
      const data = await res.json();
      setImportResult(data);
      setImportStep(4);
    } catch {
      // ignore
    } finally {
      setImporting(false);
    }
  };

  const closeImport = () => {
    setShowImportSheet(false);
    setImportStep(1);
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMapping([]);
    setImportResult(null);
    setCsvFileName("");
    fetchContacts();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c) => c.id)));
    }
  };

  // Empty state
  if (!loading && contacts.length === 0 && !search && filter === "all") {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-warm-400" />
          </div>
          <h2 className="text-xl font-semibold text-warm-800 mb-2">No contacts yet</h2>
          <p className="text-sm text-warm-400 max-w-sm mb-6">
            Import your existing clients or add them manually. Contacts are automatically created when you send follow-ups.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowImportSheet(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={() => setShowAddSheet(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>
        {renderAddSheet()}
        {renderImportSheet()}
      </>
    );
  }

  function renderAddSheet() {
    return (
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Contact</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {addError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">{addError}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">First Name *</label>
              <Input value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} placeholder="Sarah" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Last Name</label>
              <Input value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} placeholder="Johnson" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Phone *</label>
              <Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
              <Input value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="sarah@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Notes</label>
              <Textarea value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} placeholder="Any notes about this contact..." className="resize-none" />
            </div>
            <Button onClick={handleAdd} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              Save Contact
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  function renderImportSheet() {
    return (
      <Sheet open={showImportSheet} onOpenChange={(open) => { if (!open) closeImport(); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Import Contacts</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {importStep === 1 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-warm-200 rounded-xl p-8 text-center">
                  <FileSpreadsheet className="w-10 h-10 text-warm-300 mx-auto mb-3" />
                  <p className="text-sm text-warm-500 mb-3">Upload a CSV file with your contacts</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Choose File
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-warm-400">
                  CSV should include columns for: First Name, Last Name, Phone, Email (optional)
                </p>
              </div>
            )}

            {importStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-warm-600">
                  Map your CSV columns to contact fields. We auto-detected some mappings.
                </p>
                <div className="space-y-3">
                  {csvHeaders.map((header, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-warm-600 w-32 truncate flex-shrink-0">{header}</span>
                      <Select value={columnMapping[i]} onValueChange={(val) => {
                        const next = [...columnMapping];
                        next[i] = val;
                        setColumnMapping(next);
                      }}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mappableFields.map((f) => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                {csvRows.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-warm-400 mb-2">Preview (first 3 rows)</p>
                    <div className="bg-warm-50 rounded-lg p-3 space-y-2 text-xs text-warm-600 overflow-x-auto">
                      {csvRows.slice(0, 3).map((row, i) => (
                        <div key={i} className="flex gap-2">
                          {row.map((cell, j) => (
                            <span key={j} className="bg-white px-2 py-1 rounded border border-warm-100 truncate max-w-[120px]">
                              {cell || <span className="text-warm-300">empty</span>}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setImportStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => { setImportStep(3); handleImport(); }}
                    disabled={!columnMapping.includes("firstName") || !columnMapping.includes("phone")}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Import {csvRows.length} Contacts
                  </Button>
                </div>
              </div>
            )}

            {importStep === 3 && (
              <div className="flex flex-col items-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-3 border-teal-200 border-t-teal-600 rounded-full mb-4"
                  style={{ borderWidth: 3 }}
                />
                <p className="text-sm text-warm-600">Importing contacts...</p>
              </div>
            )}

            {importStep === 4 && importResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">Import Complete</p>
                    <p className="text-sm text-green-600">
                      {importResult.importedCount} imported, {importResult.skippedCount} skipped, {importResult.errorCount} errors
                    </p>
                  </div>
                </div>
                {importResult.errorCount > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      Some rows were skipped due to missing data or duplicate phone numbers.
                    </p>
                  </div>
                )}
                <Button onClick={closeImport} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  View Contacts
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  function renderDetailSheet() {
    return (
      <Sheet open={!!detailContact} onOpenChange={(open) => { if (!open) setDetailContact(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {detailContact && (
            <>
              <SheetHeader>
                <SheetTitle className="sr-only">Contact Details</SheetTitle>
              </SheetHeader>
              <div className="mt-2">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-semibold text-teal-700">
                      {getInitials(detailContact.firstName, detailContact.lastName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {!editing ? (
                      <>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-warm-800">
                            {detailContact.firstName} {detailContact.lastName || ""}
                          </h3>
                          <button onClick={startEditing} className="text-warm-300 hover:text-teal-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-warm-500 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          {detailContact.phone}
                        </div>
                        {detailContact.email && (
                          <div className="flex items-center gap-1.5 text-sm text-warm-500 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                            {detailContact.email}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {detailContact.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] bg-teal-50 text-teal-700 border-teal-200">
                              {tag}
                            </Badge>
                          ))}
                          {detailContact.optedOut && (
                            <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 border-red-200">
                              Opted Out
                            </Badge>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} placeholder="First Name" />
                        <Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} placeholder="Last Name" />
                        <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Phone" />
                        <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" />
                        <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Notes" className="resize-none" />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                          <Button size="sm" onClick={saveEdit} className="bg-teal-600 hover:bg-teal-700 text-white">Save</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {!editing && detailContact.notes && (
                  <div className="mb-6 p-3 bg-warm-50 rounded-lg">
                    <p className="text-xs font-medium text-warm-400 mb-1">Notes</p>
                    <p className="text-sm text-warm-600">{detailContact.notes}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-warm-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-warm-800">{detailContact.totalFollowUps}</p>
                    <p className="text-xs text-warm-400">Follow-ups</p>
                  </div>
                  <div className="bg-warm-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-warm-800">
                      {detailContact.hasLeftReview ? (
                        <Star className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : (
                        <span className="text-warm-300">--</span>
                      )}
                    </p>
                    <p className="text-xs text-warm-400">Review</p>
                  </div>
                </div>

                {/* Follow-up History */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-warm-700 mb-3">Follow-Up History</h4>
                  {detailContact.followUps.length === 0 ? (
                    <p className="text-sm text-warm-400">No follow-ups yet</p>
                  ) : (
                    <div className="space-y-3">
                      {detailContact.followUps.map((fu) => (
                        <div key={fu.id} className="flex items-center gap-3 p-3 bg-warm-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-warm-700">{fu.templateName}</p>
                            <p className="text-xs text-warm-400">{relativeDate(fu.createdAt)}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${
                              fu.status === "reviewed"
                                ? "bg-green-50 text-green-700"
                                : fu.status === "opened"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-warm-100 text-warm-500"
                            }`}
                          >
                            {fu.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action */}
                <Link href={`/dashboard/send?contactId=${detailContact.id}`}>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Send Follow-Up
                  </Button>
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-warm-900">Contacts</h1>
          <p className="text-sm text-warm-400 mt-1">
            {pagination.total} contact{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowImportSheet(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={() => setShowAddSheet(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-300" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.value
                  ? "bg-teal-600 text-white"
                  : "bg-warm-50 text-warm-500 hover:bg-warm-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-xl border border-warm-100 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-warm-100">
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === contacts.length && contacts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-warm-300"
                />
              </th>
              <th className="text-left text-xs font-medium text-warm-400 p-3 uppercase tracking-wider">Name</th>
              <th className="text-left text-xs font-medium text-warm-400 p-3 uppercase tracking-wider">Phone</th>
              <th className="text-left text-xs font-medium text-warm-400 p-3 uppercase tracking-wider hidden lg:table-cell">Email</th>
              <th className="text-center text-xs font-medium text-warm-400 p-3 uppercase tracking-wider">Follow-ups</th>
              <th className="text-left text-xs font-medium text-warm-400 p-3 uppercase tracking-wider hidden xl:table-cell">Last Follow-up</th>
              <th className="text-center text-xs font-medium text-warm-400 p-3 uppercase tracking-wider">Review</th>
              <th className="text-left text-xs font-medium text-warm-400 p-3 uppercase tracking-wider hidden xl:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-sm text-warm-400">Loading...</td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-sm text-warm-400">No contacts found</td></tr>
            ) : (
              contacts.map((contact, i) => (
                <motion.tr
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => openDetail(contact.id)}
                  className="border-b border-warm-50 hover:bg-warm-50/50 cursor-pointer transition-colors"
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="rounded border-warm-300"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-teal-700">
                          {getInitials(contact.firstName, contact.lastName)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-warm-800">
                          {contact.firstName} {contact.lastName || ""}
                        </p>
                        {contact.optedOut && (
                          <span className="text-[10px] text-red-500">Opted out</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-warm-600">{contact.phone}</td>
                  <td className="p-3 text-sm text-warm-600 hidden lg:table-cell">{contact.email || "--"}</td>
                  <td className="p-3 text-sm text-warm-600 text-center">{contact.totalFollowUps}</td>
                  <td className="p-3 text-sm text-warm-400 hidden xl:table-cell">{relativeDate(contact.lastFollowUpAt)}</td>
                  <td className="p-3 text-center">
                    {contact.hasLeftReview ? (
                      <Star className="w-4 h-4 text-amber-500 mx-auto" />
                    ) : (
                      <span className="text-warm-200">--</span>
                    )}
                  </td>
                  <td className="p-3 hidden xl:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] bg-warm-50 text-warm-500">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {loading ? (
          <p className="text-center text-sm text-warm-400 py-8">Loading...</p>
        ) : contacts.length === 0 ? (
          <p className="text-center text-sm text-warm-400 py-8">No contacts found</p>
        ) : (
          contacts.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => openDetail(contact.id)}
              className="bg-white rounded-xl border border-warm-100 p-4 flex items-center gap-3 cursor-pointer active:bg-warm-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-teal-700">
                  {getInitials(contact.firstName, contact.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-800 truncate">
                  {contact.firstName} {contact.lastName || ""}
                </p>
                <p className="text-xs text-warm-400">{contact.phone}</p>
              </div>
              {contact.hasLeftReview && (
                <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-warm-400">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchContacts(pagination.page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchContacts(pagination.page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-warm-800 text-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-4 z-50"
          >
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBulkDelete}
              className="text-red-300 hover:text-red-100 hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
            <button onClick={() => setSelectedIds(new Set())} className="text-warm-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {renderAddSheet()}
      {renderImportSheet()}
      {renderDetailSheet()}
    </>
  );
}

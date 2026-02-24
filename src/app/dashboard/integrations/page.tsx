"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Users,
  Zap,
  CalendarCheck,
  Building2,
  ArrowRight,
  Upload,
  X,
  Check,
  Loader2,
} from "lucide-react";

const integrations = [
  {
    name: "CSV Import",
    description: "Upload a CSV file to bulk-import contacts into your account.",
    icon: FileSpreadsheet,
    active: true,
  },
  {
    name: "Google Contacts",
    description: "Sync contacts directly from your Google account.",
    icon: Users,
    active: false,
  },
  {
    name: "Zapier",
    description: "Connect AfterYourVisit with 5,000+ apps via Zapier automations.",
    icon: Zap,
    active: false,
  },
  {
    name: "Square Appointments",
    description: "Auto-send follow-ups after Square appointments complete.",
    icon: CalendarCheck,
    active: false,
  },
  {
    name: "Practice Management",
    description: "Integrate with dental, vet, and medical practice management systems.",
    icon: Building2,
    active: false,
  },
];

export default function IntegrationsPage() {
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: number } | null>(null);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      setCsvFile(file);
      setImportError("");
    } else {
      setImportError("Please select a CSV file.");
    }
  };

  const handleImport = async () => {
    if (!csvFile) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await fetch("/api/contacts/import", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Import failed");
      }
      const data = await res.json();
      setImportResult({
        imported: data.importedCount || 0,
        skipped: data.skippedCount || 0,
        errors: data.errorCount || 0,
      });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const resetCsvImport = () => {
    setCsvFile(null);
    setImportResult(null);
    setImportError("");
    setShowCsvImport(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl text-warm-900">Integrations</h1>
        <p className="text-sm text-warm-400 mt-1">
          Connect your tools to streamline your workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration, i) => (
          <motion.div
            key={integration.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-xl border border-warm-100 shadow-card p-6 ${
              !integration.active ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <integration.icon className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-warm-800">
                    {integration.name}
                  </h3>
                  {!integration.active && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-warm-100 text-warm-500"
                    >
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-warm-400 mb-4">
                  {integration.description}
                </p>
                {integration.active ? (
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => { setShowCsvImport(true); setImportResult(null); setImportError(""); setCsvFile(null); }}
                  >
                    Import Contacts
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    Coming Soon
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Inline CSV Import Panel */}
      {showCsvImport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white rounded-xl border border-warm-100 shadow-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-warm-900">Import CSV</h2>
            <button onClick={resetCsvImport} className="text-warm-400 hover:text-warm-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {importResult ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-warm-900 mb-2">Import Complete</h3>
              <div className="space-y-1 text-sm text-warm-600">
                <p>{importResult.imported} contacts imported</p>
                {importResult.skipped > 0 && <p>{importResult.skipped} duplicates skipped</p>}
                {importResult.errors > 0 && <p>{importResult.errors} rows had errors</p>}
              </div>
              <Button
                className="mt-4 bg-teal-600 hover:bg-teal-700 text-white"
                onClick={resetCsvImport}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-warm-500 mb-4">
                Upload a CSV file with columns for name, phone, and optionally email. We&apos;ll auto-map common column names.
              </p>

              {importError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                  {importError}
                </div>
              )}

              <div className="border-2 border-dashed border-warm-200 rounded-xl p-8 text-center hover:border-teal-300 transition-colors">
                <Upload className="w-8 h-8 text-warm-300 mx-auto mb-3" />
                {csvFile ? (
                  <div>
                    <p className="text-sm font-medium text-warm-700">{csvFile.name}</p>
                    <p className="text-xs text-warm-400 mt-1">{(csvFile.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={() => { setCsvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-xs text-red-500 hover:text-red-700 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-warm-500 mb-2">Drag and drop a CSV file, or click to browse</p>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  aria-label="Choose CSV file to import"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={resetCsvImport}>Cancel</Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={!csvFile || importing}
                  onClick={handleImport}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </>
  );
}

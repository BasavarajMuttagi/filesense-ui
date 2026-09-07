import React, { useState } from "react";
import type { DocumentItem } from "../../types";
import { FileText, Database, HardDrive, Calendar, Trash2, Layers, X, Loader2 } from "lucide-react";

interface DocumentInspectorProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDeleteDocument: (docId: string) => Promise<void>;
}

export const DocumentInspector: React.FC<DocumentInspectorProps> = ({
  document,
  onClose,
  onDeleteDocument,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!document) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (raw: string | number) => {
    try {
      const d = typeof raw === "number" ? new Date(raw * 1000) : new Date(raw);
      return d.toLocaleString();
    } catch {
      return String(raw);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteDocument(document.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="size-9 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="size-4" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-slate-900 truncate" title={document.fileName}>
                {document.fileName}
              </h3>
              <p className="text-[11px] text-slate-400 uppercase font-mono">{document.mimeType}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                document.status === "processed"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : document.status === "processing"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : document.status === "error"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {document.status}
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 bg-[#F8FAFC]">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1 shadow-2xs">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <HardDrive className="size-3.5 text-[#0052FF]" /> File Size
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {formatBytes(document.fileSize)}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1 shadow-2xs">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Layers className="size-3.5 text-[#0052FF]" /> Vector Chunks
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {document.chunkCount ?? 0} indexed
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1 col-span-2 shadow-2xs">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Database className="size-3.5 text-[#0052FF]" /> Document UUID
              </span>
              <span className="text-xs font-mono select-all break-all text-slate-700">
                {document.id}
              </span>
            </div>

            {document.storageUrl && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1 col-span-2 shadow-2xs">
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Database className="size-3.5 text-[#0052FF]" /> Storage Endpoint
                </span>
                <span className="text-xs font-mono select-all break-all text-slate-500 truncate">
                  {document.storageUrl}
                </span>
              </div>
            )}

            <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1 col-span-2 shadow-2xs">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-[#0052FF]" /> Indexed At
              </span>
              <span className="text-xs text-slate-800 font-mono">
                {formatDate(document.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200 shadow-2xs"
            >
              <Trash2 className="size-3.5" />
              <span>Delete Document</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="size-3 animate-spin text-white" />}
                <span>Confirm Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

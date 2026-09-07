import React, { useState } from "react";
import type { DocumentItem, Project } from "../../types";
import {
  FileText,
  Download,
  Trash2,
  X,
  Code,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  FolderOpen,
  Loader2,
  HardDrive,
} from "lucide-react";
import { DocumentListSkeleton } from "../common/SwissSkeleton";

interface ArtifactsPanelProps {
  activeProject: Project | null;
  documents: DocumentItem[];
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onDocumentUploaded: () => void;
  onDeleteDocument: (docId: string) => Promise<void>;
  onInspectDocument: (docItem: DocumentItem) => void;
  onOpenNewProjectModal: () => void;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({
  activeProject,
  documents,
  isOpen,
  loading = false,
  onClose,
  onDeleteDocument,
  onInspectDocument,
  onOpenNewProjectModal,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string, mimeType: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    if (["ts", "tsx", "js", "jsx", "py"].includes(ext)) {
      return (
        <div className="size-7 rounded-md bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100">
          <Code className="size-3.5" />
        </div>
      );
    }
    if (["prisma", "json", "sql", "yaml", "yml"].includes(ext)) {
      return (
        <div className="size-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
          <FileCode className="size-3.5" />
        </div>
      );
    }
    if (["csv", "xlsx", "xls"].includes(ext)) {
      return (
        <div className="size-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <FileSpreadsheet className="size-3.5" />
        </div>
      );
    }
    if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) {
      return (
        <div className="size-7 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
          <ImageIcon className="size-3.5" />
        </div>
      );
    }
    // Default document (PDF, MD, TXT, DOCX)
    return (
      <div className="size-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
        <FileText className="size-3.5" />
      </div>
    );
  };

  const getFileTypeLabel = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";
    if (["TS", "TSX", "JS", "JSX", "PY"].includes(ext)) return `Code · ${ext}`;
    if (["PRISMA", "SQL", "JSON", "YAML"].includes(ext)) return `Schema · ${ext}`;
    if (["MD", "TXT", "DOCX"].includes(ext)) return `Doc · ${ext}`;
    if (ext === "PDF") return "PDF";
    return ext;
  };

  const handleDelete = async (docId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingId(docId);
    try {
      await onDeleteDocument(docId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (doc: DocumentItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (doc.storageUrl) {
      window.open(doc.storageUrl, "_blank");
    } else {
      onInspectDocument(doc);
    }
  };

  return (
    <aside className="w-72 lg:w-80 h-screen bg-white border-l border-slate-200 flex flex-col shrink-0 z-30 font-sans select-none">
      {/* Panel Header */}
      <div className="h-11 px-3.5 flex items-center justify-between border-b border-slate-200/80 bg-white">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-3.5 text-slate-500" />
          <h3 className="font-semibold text-xs text-slate-900">
            Files
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {documents.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="size-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Main Files List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-[#F8FAFC]">
        {loading ? (
          <DocumentListSkeleton count={5} />
        ) : !activeProject ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <FolderOpen className="size-7 text-slate-300 mb-2" />
            <p className="text-xs font-medium mb-3 text-slate-600">No project selected</p>
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Select Project
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-white">
            <FileText className="size-7 text-slate-300 mb-2" />
            <h4 className="text-xs font-semibold text-slate-900 mb-1">
              No files in this project
            </h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Drop documents into chat or click Attach to index files.
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onInspectDocument(doc)}
              className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs gap-2.5"
            >
              {/* Left: Icon & Details */}
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(doc.fileName, doc.mimeType)}

                <div className="flex flex-col min-w-0">
                  <span
                    className="text-xs font-medium text-slate-900 truncate max-w-[130px]"
                    title={doc.fileName}
                  >
                    {doc.fileName}
                  </span>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                    <span className="text-slate-500">{getFileTypeLabel(doc.fileName)}</span>
                    <span>·</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {doc.status === "processing" ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-mono font-semibold border border-amber-200">
                    <Loader2 className="size-2.5 animate-spin" />
                    <span>Indexing</span>
                  </span>
                ) : (
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 group-hover:hidden" />
                )}

                {/* Hover Action Buttons */}
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(doc, e)}
                    aria-label="Download file"
                    title="Download / Open file"
                    className="size-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="size-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectDocument(doc);
                    }}
                    aria-label="Inspect file"
                    title="Inspect metadata"
                    className="size-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Eye className="size-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(doc.id, e)}
                    disabled={deletingId === doc.id}
                    aria-label="Delete file"
                    title="Delete file"
                    className="size-6 flex items-center justify-center rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="h-9 px-3 border-t border-slate-200/80 bg-white text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1.5">
          <HardDrive className="size-3 text-slate-400" />
          Tigris Storage
        </span>
        <span className="text-slate-500 font-semibold">
          Ready
        </span>
      </div>
    </aside>
  );
};

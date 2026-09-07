import React, { useState } from "react";
import type { DocumentItem, Project } from "../../types";
import { DocumentDropzone } from "./DocumentDropzone";
import {
  FileText,
  Download,
  Trash2,
  Plus,
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

interface ArtifactsPanelProps {
  activeProject: Project | null;
  documents: DocumentItem[];
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded: () => void;
  onDeleteDocument: (docId: string) => Promise<void>;
  onInspectDocument: (doc: DocumentItem) => void;
  onOpenNewProjectModal: () => void;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({
  activeProject,
  documents,
  isOpen,
  onClose,
  onDocumentUploaded,
  onDeleteDocument,
  onInspectDocument,
  onOpenNewProjectModal,
}) => {
  const [showUploadZone, setShowUploadZone] = useState(false);
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
        <div className="size-8 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100">
          <Code className="size-4" />
        </div>
      );
    }
    if (["prisma", "json", "sql", "yaml", "yml"].includes(ext)) {
      return (
        <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
          <FileCode className="size-4" />
        </div>
      );
    }
    if (["csv", "xlsx", "xls"].includes(ext)) {
      return (
        <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <FileSpreadsheet className="size-4" />
        </div>
      );
    }
    if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) {
      return (
        <div className="size-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
          <ImageIcon className="size-4" />
        </div>
      );
    }
    // Default document (PDF, MD, TXT, DOCX)
    return (
      <div className="size-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
        <FileText className="size-4" />
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
    <aside className="w-80 lg:w-96 h-screen bg-white border-l border-slate-200 flex flex-col shrink-0 z-30 font-sans shadow-xs select-none">
      {/* Panel Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-[#0052FF]" />
          <h3 className="font-bold text-sm text-slate-900">
            Corpus Artifacts
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold">
            {documents.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {activeProject && (
            <button
              type="button"
              onClick={() => setShowUploadZone(!showUploadZone)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                showUploadZone
                  ? "bg-[#0052FF] text-white border-[#0052FF] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              <Plus className="size-3.5" />
              <span>Upload</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Upload Zone Drawer */}
      {showUploadZone && activeProject && (
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <DocumentDropzone
            projectId={activeProject.id}
            onUploadSuccess={() => {
              onDocumentUploaded();
              setShowUploadZone(false);
            }}
          />
        </div>
      )}

      {/* Main Artifacts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#F8FAFC]">
        {!activeProject ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <FolderOpen className="size-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium mb-3 text-slate-600">No project selected</p>
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0052FF] text-white hover:bg-[#0045D8] transition-colors cursor-pointer shadow-xs"
            >
              Select Project
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <FileText className="size-8 text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              No Documents Ingested
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Upload technical documents, PDFs, or code to index embeddings into vector search.
            </p>
            <button
              type="button"
              onClick={() => setShowUploadZone(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0052FF] text-white hover:bg-[#0045D8] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Upload Document</span>
            </button>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onInspectDocument(doc)}
              className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs gap-3"
            >
              {/* Left: Icon & Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(doc.fileName, doc.mimeType)}

                <div className="flex flex-col min-w-0">
                  <span
                    className="text-xs font-semibold text-slate-900 truncate max-w-[145px]"
                    title={doc.fileName}
                  >
                    {doc.fileName}
                  </span>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                    <span className="font-semibold text-slate-600">{getFileTypeLabel(doc.fileName)}</span>
                    <span>·</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                    {typeof doc.chunkCount === "number" && doc.chunkCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{doc.chunkCount} chk</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {doc.status === "processing" ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono font-semibold border border-amber-200">
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
                    aria-label="Download document"
                    title="Download / Open file"
                    className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                  >
                    <Download className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectDocument(doc);
                    }}
                    aria-label="Inspect document"
                    title="Inspect metadata & vector chunks"
                    className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(doc.id, e)}
                    disabled={deletingId === doc.id}
                    aria-label="Delete document"
                    title="Delete document"
                    className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-white text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1.5">
          <HardDrive className="size-3.5 text-[#0052FF]" />
          Tigris Cloud Storage
        </span>
        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
          READY
        </span>
      </div>
    </aside>
  );
};

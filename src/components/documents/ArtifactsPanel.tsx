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
        <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/50">
          <Code className="size-4" />
        </div>
      );
    }
    if (["prisma", "json", "sql"].includes(ext)) {
      return (
        <div className="size-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-200/50">
          <FileCode className="size-4" />
        </div>
      );
    }
    if (["csv", "xlsx", "xls"].includes(ext)) {
      return (
        <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/50">
          <FileSpreadsheet className="size-4" />
        </div>
      );
    }
    if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) {
      return (
        <div className="size-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200/50">
          <ImageIcon className="size-4" />
        </div>
      );
    }
    // Default document (PDF, MD, TXT, DOCX)
    return (
      <div className="size-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/50">
        <FileText className="size-4" />
      </div>
    );
  };

  const getFileTypeLabel = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";
    if (["TS", "TSX", "JS", "JSX", "PY"].includes(ext)) return `Code · ${ext}`;
    if (["PRISMA", "SQL", "JSON"].includes(ext)) return `Schema · ${ext}`;
    if (["MD", "TXT", "DOCX"].includes(ext)) return `Doc · ${ext}`;
    if (ext === "PDF") return "Doc · PDF";
    return `File · ${ext}`;
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
    <aside className="w-80 lg:w-96 h-screen bg-white border-l border-zinc-200 flex flex-col shrink-0 z-30 font-sans shadow-sm select-none">
      {/* Panel Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-zinc-200/80">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-zinc-700" />
          <h3 className="font-semibold text-sm text-zinc-900">
            Artifacts & Documents
          </h3>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600 font-medium">
            {documents.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {activeProject && (
            <button
              type="button"
              onClick={() => setShowUploadZone(!showUploadZone)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                showUploadZone
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 shadow-2xs"
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
            className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Optional Upload Zone */}
      {showUploadZone && activeProject && (
        <div className="p-3 bg-zinc-50 border-b border-zinc-200/80">
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
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!activeProject ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <FolderOpen className="size-8 text-zinc-300 mb-2" />
            <p className="text-xs font-medium mb-3 text-zinc-600">No project selected</p>
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
            >
              Select Project
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
            <FileText className="size-8 text-zinc-300 mb-2" />
            <h4 className="text-xs font-semibold text-zinc-900 mb-1">
              No Artifacts Yet
            </h4>
            <p className="text-xs text-zinc-500 max-w-xs mb-4">
              Attach files to give vector search & document intelligence context.
            </p>
            <button
              type="button"
              onClick={() => setShowUploadZone(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-2xs"
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
              className="group flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 hover:border-zinc-300 bg-white hover:bg-zinc-50 transition-all cursor-pointer shadow-2xs gap-3"
            >
              {/* Left: Icon & Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(doc.fileName, doc.mimeType)}

                <div className="flex flex-col min-w-0">
                  <span
                    className="text-xs font-semibold text-zinc-900 truncate max-w-[150px]"
                    title={doc.fileName}
                  >
                    {doc.fileName}
                  </span>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400">
                    <span>{getFileTypeLabel(doc.fileName)}</span>
                    <span>•</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {doc.status === "processing" ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200/60">
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
                    className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/70 transition-colors cursor-pointer"
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
                    className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200/70 transition-colors cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(doc.id, e)}
                    disabled={deletingId === doc.id}
                    aria-label="Delete document"
                    title="Delete document"
                    className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
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
      <div className="p-3 border-t border-zinc-200/80 bg-zinc-50 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
        <span>Tigris Cloud Storage</span>
        <span className="text-zinc-500 font-medium">Ready</span>
      </div>
    </aside>
  );
};

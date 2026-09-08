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
        <div className="size-8 rounded-xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shrink-0">
          <Code className="size-4" />
        </div>
      );
    }
    if (["prisma", "json", "sql", "yaml", "yml"].includes(ext)) {
      return (
        <div className="size-8 rounded-xl bg-[#FFF0B3] text-[#B88700] flex items-center justify-center shrink-0">
          <FileCode className="size-4" />
        </div>
      );
    }
    if (["csv", "xlsx", "xls"].includes(ext)) {
      return (
        <div className="size-8 rounded-xl bg-[#D8F3E5] text-[#136C40] flex items-center justify-center shrink-0">
          <FileSpreadsheet className="size-4" />
        </div>
      );
    }
    if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) {
      return (
        <div className="size-8 rounded-xl bg-[#FFD3C4] text-[#DD5930] flex items-center justify-center shrink-0">
          <ImageIcon className="size-4" />
        </div>
      );
    }
    // Default document (PDF, MD, TXT, DOCX)
    return (
      <div className="size-8 rounded-xl bg-[#EFECE6] text-[#161613] flex items-center justify-center shrink-0">
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
    <aside className="w-72 lg:w-80 h-screen bg-[#F8F7F3] border-l border-[#16161312] flex flex-col shrink-0 z-30 font-sans select-none">
      {/* Panel Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#16161310] bg-[#F8F7F3]">
        <div className="flex items-center gap-2.5">
          <FolderOpen className="size-4 text-[#7C5CFC]" />
          <h3 className="font-serif font-bold text-sm text-[#161613]">
            Files
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="size-7 flex items-center justify-center rounded-full text-[#16161380] hover:bg-[#1616130d] hover:text-[#161613] transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Main Files List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FAF9F6] scrollbar-thin">
        {loading ? (
          <DocumentListSkeleton count={5} />
        ) : !activeProject ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#16161366]">
            <FolderOpen className="size-8 text-[#16161333] mb-2" />
            <p className="text-xs font-medium mb-3 text-[#16161399]">No project selected</p>
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[#161613] text-white hover:bg-[#282824] transition-all cursor-pointer shadow-xs"
            >
              + Create Project
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-[#1616130f] rounded-3xl bg-white shadow-2xs">
            <div className="size-11 rounded-2xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center mb-3 shadow-2xs">
              <FileText className="size-5" />
            </div>
            <h4 className="font-serif text-sm font-semibold text-[#161613] mb-1">
              No files in this project
            </h4>
            <p className="text-xs text-[#16161380] max-w-xs leading-relaxed">
              Click Attach in chat to upload and index documents.
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onInspectDocument(doc)}
              className="group flex items-center justify-between p-3 rounded-2xl border border-[#16161310] hover:border-[#7C5CFC40] bg-white hover:bg-[#FAF9F6] transition-all cursor-pointer shadow-2xs gap-2.5"
            >
              {/* Left: Icon & Details */}
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(doc.fileName, doc.mimeType)}

                <div className="flex flex-col min-w-0">
                  <span
                    className="text-xs font-medium text-[#161613] truncate max-w-[130px]"
                    title={doc.fileName}
                  >
                    {doc.fileName}
                  </span>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#16161366] font-mono">
                    <span className="text-[#16161399]">{getFileTypeLabel(doc.fileName)}</span>
                    <span>·</span>
                    <span>{formatBytes(doc.fileSize)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {doc.status === "processing" || doc.status === "created" ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF0B3] text-[#B88700] text-[10px] font-mono font-semibold">
                    <Loader2 className="size-2.5 animate-spin" />
                    <span>Indexing</span>
                  </span>
                ) : (
                  <CheckCircle2 className="size-4 text-[#136C40] shrink-0 group-hover:hidden" />
                )}

                {/* Hover Action Buttons */}
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(doc, e)}
                    aria-label="Download file"
                    title="Download / Open file"
                    className="size-6.5 flex items-center justify-center rounded-full text-[#16161380] hover:text-[#161613] hover:bg-[#1616130d] transition-colors cursor-pointer"
                  >
                    <Download className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectDocument(doc);
                    }}
                    aria-label="Inspect file"
                    title="Inspect metadata"
                    className="size-6.5 flex items-center justify-center rounded-full text-[#16161380] hover:text-[#161613] hover:bg-[#1616130d] transition-colors cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(doc.id, e)}
                    disabled={deletingId === doc.id}
                    aria-label="Delete file"
                    title="Delete file"
                    className="size-6.5 flex items-center justify-center rounded-full text-[#16161380] hover:text-rose-600 hover:bg-[#FFF0ED] transition-colors cursor-pointer disabled:opacity-50"
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
      <div className="h-10 px-4 border-t border-[#16161310] bg-[#F8F7F3] text-[10px] text-[#16161380] flex items-center justify-between font-mono">
        <span className="flex items-center gap-1.5">
          <HardDrive className="size-3 text-[#7C5CFC]" />
          Document Storage
        </span>
        <span className="text-[#136C40] font-semibold flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-[#136C40]" />
          Ready
        </span>
      </div>
    </aside>
  );
};

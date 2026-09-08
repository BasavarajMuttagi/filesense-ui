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
    <div className="fixed inset-0 bg-[#161613]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl border border-[#16161314] shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1616130d] bg-white">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="size-9 rounded-2xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="size-4.5" />
            </div>
            <div className="truncate">
              <h3 className="font-serif text-base font-bold text-[#161613] truncate" title={document.fileName}>
                {document.fileName}
              </h3>
              <p className="text-[11px] text-[#16161366] uppercase font-mono">{document.mimeType}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                document.status === "processed"
                  ? "bg-[#D8F3E5] text-[#136C40]"
                  : document.status === "processing"
                  ? "bg-[#FFF0B3] text-[#B88700]"
                  : document.status === "error"
                  ? "bg-[#FFF0ED] text-[#C53030]"
                  : "bg-[#EFECE6] text-[#161613]"
              }`}
            >
              {document.status}
            </span>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              className="size-8 flex items-center justify-center rounded-full text-[#16161380] hover:bg-[#1616130d] hover:text-[#161613] transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 bg-[#FAF9F6]">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white border border-[#16161310] rounded-2xl flex flex-col gap-1 shadow-2xs">
              <span className="text-xs text-[#16161380] flex items-center gap-1.5 font-medium">
                <HardDrive className="size-3.5 text-[#7C5CFC]" /> File Size
              </span>
              <span className="text-sm font-bold text-[#161613] font-mono">
                {formatBytes(document.fileSize)}
              </span>
            </div>

            <div className="p-4 bg-white border border-[#16161310] rounded-2xl flex flex-col gap-1 shadow-2xs">
              <span className="text-xs text-[#16161380] flex items-center gap-1.5 font-medium">
                <Layers className="size-3.5 text-[#7C5CFC]" /> Vector Chunks
              </span>
              <span className="text-sm font-bold text-[#161613] font-mono">
                {document.chunkCount ?? 0} indexed
              </span>
            </div>

            <div className="p-4 bg-white border border-[#16161310] rounded-2xl flex flex-col gap-1 col-span-2 shadow-2xs">
              <span className="text-xs text-[#16161380] flex items-center gap-1.5 font-medium">
                <Database className="size-3.5 text-[#7C5CFC]" /> Document UUID
              </span>
              <span className="text-xs font-mono select-all break-all text-[#161613cc]">
                {document.id}
              </span>
            </div>

            {document.storageUrl && (
              <div className="p-4 bg-white border border-[#16161310] rounded-2xl flex flex-col gap-1 col-span-2 shadow-2xs">
                <span className="text-xs text-[#16161380] flex items-center gap-1.5 font-medium">
                  <Database className="size-3.5 text-[#7C5CFC]" /> Storage Endpoint
                </span>
                <span className="text-xs font-mono select-all break-all text-[#16161366] truncate">
                  {document.storageUrl}
                </span>
              </div>
            )}

            <div className="p-4 bg-white border border-[#16161310] rounded-2xl flex flex-col gap-1 col-span-2 shadow-2xs">
              <span className="text-xs text-[#16161380] flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-[#7C5CFC]" /> Indexed At
              </span>
              <span className="text-xs text-[#161613] font-mono">
                {formatDate(document.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1616130d] bg-white">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#C53030] hover:bg-[#FFF0ED] rounded-full transition-colors cursor-pointer border border-[#FFD3C4] shadow-2xs"
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
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-[#C53030] hover:bg-rose-700 text-white rounded-full transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="size-3 animate-spin text-white" />}
                <span>Confirm Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-xs font-medium bg-white hover:bg-[#FAF9F6] text-[#161613] border border-[#16161314] rounded-full transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-[#161613] hover:bg-[#282824] text-white rounded-full transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

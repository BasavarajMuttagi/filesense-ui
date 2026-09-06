import React, { useState } from "react";
import type { DocumentItem } from "../../types";
import { SwissModal } from "../common/SwissModal";
import { SwissBadge } from "../common/SwissBadge";
import { SwissButton } from "../common/SwissButton";
import { FileText, Database, HardDrive, Calendar, Trash2, Layers } from "lucide-react";

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
    <SwissModal
      isOpen={Boolean(document)}
      onClose={onClose}
      title="Document Details"
      maxWidth="lg"
      footer={
        <div className="w-full flex items-center justify-between">
          {!confirmDelete ? (
            <SwissButton
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3 h-3" />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete Document
            </SwissButton>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-red-600 font-bold">Confirm purge?</span>
              <SwissButton
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={isDeleting}
              >
                Yes, Purge
              </SwissButton>
              <SwissButton
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </SwissButton>
            </div>
          )}
          <SwissButton variant="outline" size="sm" onClick={onClose}>
            Close
          </SwissButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Header summary */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-slate-300 bg-slate-50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#E11D48]" />
            </div>
            <div>
              <h4 className="text-sm font-mono font-bold text-slate-900 break-all">
                {document.fileName}
              </h4>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                {document.mimeType}
              </span>
            </div>
          </div>
          <SwissBadge
            variant={
              document.status === "processed"
                ? "processed"
                : document.status === "processing"
                ? "processing"
                : document.status === "error"
                ? "error"
                : "created"
            }
            pulse={document.status === "processing"}
          >
            {document.status}
          </SwissBadge>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-50 border border-slate-200 p-2.5 flex flex-col gap-1">
            <span className="text-[10px] uppercase text-slate-600 font-semibold flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Size
            </span>
            <span className="text-slate-900 font-bold">
              {formatBytes(document.fileSize)}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 flex flex-col gap-1">
            <span className="text-[10px] uppercase text-slate-600 font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3" /> Vector Chunks
            </span>
            <span className="text-slate-900 font-bold">
              {document.chunkCount ?? 0} indexed
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 flex flex-col gap-1 col-span-2">
            <span className="text-[10px] uppercase text-slate-600 font-semibold flex items-center gap-1">
              <Database className="w-3 h-3" /> Document UUID
            </span>
            <span className="text-slate-900 font-mono text-[11px] select-all break-all">
              {document.id}
            </span>
          </div>

          {document.storageUrl && (
            <div className="bg-slate-50 border border-slate-200 p-2.5 flex flex-col gap-1 col-span-2">
              <span className="text-[10px] uppercase text-slate-600 font-semibold flex items-center gap-1">
                <Database className="w-3 h-3" /> Tigris Storage Path
              </span>
              <span className="text-slate-700 font-mono text-[11px] select-all break-all">
                {document.storageUrl}
              </span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 p-2.5 flex flex-col gap-1 col-span-2">
            <span className="text-[10px] uppercase text-slate-600 font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Ingestion Timestamp
            </span>
            <span className="text-slate-700 font-mono text-[11px]">
              {formatDate(document.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </SwissModal>
  );
};

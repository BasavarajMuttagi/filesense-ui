import React, { useState } from "react";
import type { DocumentItem, Project } from "../../types";
import { SwissBadge } from "../common/SwissBadge";
import { SwissButton } from "../common/SwissButton";
import { DocumentDropzone } from "./DocumentDropzone";
import { DocumentInspector } from "./DocumentInspector";
import { EmptyState } from "../common/EmptyState";
import {
  FileText,
  RefreshCw,
  Trash2,
  Eye,
  Plus,
  X,
} from "lucide-react";

interface DocumentTableProps {
  project: Project | null;
  documents: DocumentItem[];
  loading: boolean;
  onRefresh: () => void;
  onDeleteDocument: (docId: string) => Promise<void>;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  project,
  documents,
  loading,
  onRefresh,
  onDeleteDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [showUploader, setShowUploader] = useState(documents.length === 0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (raw: string | number) => {
    try {
      const d = typeof raw === "number" ? new Date(raw * 1000) : new Date(raw);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(raw);
    }
  };

  if (!project) {
    return (
      <div className="flex flex-col h-full bg-white border border-slate-200">
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="No Project Selected"
            description="Select a project from the dashboard to manage documents."
          />
        </div>
      </div>
    );
  }

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-bold text-slate-900 font-sans">
            Documents
          </h2>
          <span className="text-xs text-slate-400 font-sans">
            {documents.length} {documents.length === 1 ? "file" : "files"} · {totalChunks} chunks indexed
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SwissButton
            variant={showUploader ? "outline" : "vermilion"}
            size="sm"
            onClick={() => setShowUploader(!showUploader)}
            icon={showUploader ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {showUploader ? "Close Upload" : "Upload File"}
          </SwissButton>

          <SwissButton
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            loading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            title="Refresh documents"
          >
            Refresh
          </SwissButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Upload Zone */}
        {showUploader && (
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <DocumentDropzone
              projectId={project.id}
              onUploadSuccess={onRefresh}
            />
          </div>
        )}

        {/* Documents Table View */}
        <div className="flex-1">
          {documents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No documents yet"
                description="Upload PDFs or text files to index their content for semantic search."
                action={
                  !showUploader ? (
                    <SwissButton
                      variant="vermilion"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setShowUploader(true)}
                    >
                      Upload First File
                    </SwissButton>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">File Name</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Chunks</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Size</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2 max-w-[280px]">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-900 transition-colors" />
                          <span className="font-medium text-slate-900 truncate" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <SwissBadge
                          variant={
                            doc.status === "processed"
                              ? "processed"
                              : doc.status === "processing"
                              ? "processing"
                              : doc.status === "error"
                              ? "error"
                              : "default"
                          }
                          pulse={doc.status === "processing"}
                        >
                          {doc.status}
                        </SwissBadge>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {doc.chunkCount ?? 0}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {formatBytes(doc.fileSize)}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 font-sans">
                        {formatDate(doc.createdAt)}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedDoc(doc)}
                            className="p-1 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer rounded-xs"
                            title="Inspect details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded-xs"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inspector Modal */}
      <DocumentInspector
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDeleteDocument={onDeleteDocument}
      />
    </div>
  );
};

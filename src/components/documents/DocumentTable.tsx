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
  UploadCloud,
  ChevronDown,
  ChevronUp,
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
  const [showUploader, setShowUploader] = useState(true);

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
      <div className="flex flex-col h-full bg-white border border-slate-900 swiss-shadow">
        <div className="p-3.5 border-b border-slate-900 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-[#0F172A] text-white px-1.5 py-0.5">
              02
            </span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              DOCUMENTS // PIPELINE
            </h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="No Active Project Selected"
            description="Select a project repository on the left or create a new one to manage documents and ingest data."
            code="NO_PROJECT_SELECTED"
          />
        </div>
      </div>
    );
  }

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-900 swiss-shadow">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-900 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-[#0F172A] text-white px-1.5 py-0.5">
            02
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              {project.title}
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              ({documents.length} FILES // {totalChunks} CHUNKS)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SwissButton
            variant="outline"
            size="sm"
            onClick={() => setShowUploader(!showUploader)}
            icon={showUploader ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          >
            {showUploader ? "HIDE UPLOADER" : "UPLOAD FILES"}
          </SwissButton>

          <SwissButton
            variant="outline"
            size="sm"
            onClick={onRefresh}
            loading={loading}
            icon={<RefreshCw className="w-3 h-3" />}
            title="Refresh documents list"
          >
            REFRESH
          </SwissButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Tigris Direct S3 Upload Zone */}
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
                title="No Documents Uploaded"
                description="Upload PDFs, text, or documentation into this repository. Files are uploaded directly to Tigris storage and indexed into Upstash Vector."
                code="DOCS_EMPTY"
                icon={<UploadCloud className="w-5 h-5 text-slate-500" />}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">File Name</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Chunks</th>
                    <th className="py-2.5 px-3 text-right">Size</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 max-w-[240px]">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-[#E11D48] transition-colors" />
                          <span className="font-bold text-slate-900 truncate" title={doc.fileName}>
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
                              : "created"
                          }
                          pulse={doc.status === "processing"}
                        >
                          {doc.status}
                        </SwissBadge>
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {doc.chunkCount ?? 0}
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {formatBytes(doc.fileSize)}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {formatDate(doc.createdAt)}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedDoc(doc)}
                            className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Inspect metadata"
                            aria-label={`Inspect ${doc.fileName}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete document"
                            aria-label={`Delete ${doc.fileName}`}
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

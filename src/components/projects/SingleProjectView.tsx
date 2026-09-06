import React, { useState } from "react";
import type { Project, DocumentItem, QueryRecord } from "../../types";
import { DocumentTable } from "../documents/DocumentTable";
import { QueryTerminal } from "../queries/QueryTerminal";
import { SwissButton } from "../common/SwissButton";
import { SwissModal } from "../common/SwissModal";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Columns,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface SingleProjectViewProps {
  project: Project;
  allProjects: Project[];
  documents: DocumentItem[];
  queries: QueryRecord[];
  loadingDocuments: boolean;
  onBackToDashboard: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onRefreshDocuments: () => void;
  onDeleteDocument: (docId: string) => Promise<void>;
  onOpenHistory: () => void;
  onQueryCompleted: (record: QueryRecord) => void;
}

export const SingleProjectView: React.FC<SingleProjectViewProps> = ({
  project,
  allProjects,
  documents,
  queries,
  loadingDocuments,
  onBackToDashboard,
  onSelectProject,
  onDeleteProject,
  onRefreshDocuments,
  onDeleteDocument,
  onOpenHistory,
  onQueryCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<"documents" | "rag" | "split">("documents");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteProject(project.id);
      setDeleteModalOpen(false);
      onBackToDashboard();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-6xl mx-auto py-2">
      {/* Project Navigation & Context Banner */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 flex flex-col gap-4">
        {/* Top Row: Back button & Quick Switcher */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 flex-wrap">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>All Projects</span>
          </button>

          {/* Quick Switch Dropdown & Delete */}
          <div className="flex items-center gap-3">
            {allProjects.length > 1 && (
              <div className="relative flex items-center">
                <span className="text-xs text-slate-400 mr-2 hidden sm:inline">
                  Switch:
                </span>
                <select
                  value={project.id}
                  onChange={(e) => onSelectProject(e.target.value)}
                  aria-label="Switch active project"
                  className="appearance-none bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 py-1 pl-2.5 pr-7 focus:outline-none focus:border-slate-900 cursor-pointer hover:bg-slate-100 transition-colors rounded-xs"
                >
                  {allProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.documentCount || 0} docs)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
              </div>
            )}

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded-xs"
              title="Delete Project"
              aria-label={`Delete project ${project.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Header Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-xs sm:text-sm text-slate-500 font-sans max-w-2xl">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
            <span className="bg-slate-100 px-2.5 py-1 rounded-xs font-medium text-slate-700">
              {documents.length} {documents.length === 1 ? "document" : "documents"}
            </span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-xs font-medium text-slate-700">
              {totalChunks} {totalChunks === 1 ? "chunk" : "chunks"}
            </span>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`px-3.5 py-1.5 text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer rounded-xs ${
              activeTab === "documents"
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rag")}
            className={`px-3.5 py-1.5 text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer rounded-xs ${
              activeTab === "rag"
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>Ask AI</span>
            {queries.length > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
                {queries.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`px-3.5 py-1.5 text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer hidden lg:flex rounded-xs ${
              activeTab === "split"
                ? "bg-[#0F172A] text-white border-[#0F172A]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area based on Selected Tab */}
      <div className="w-full">
        {/* Tab 1: Full-width Documents Pipeline */}
        {activeTab === "documents" && (
          <div className="min-h-[600px]">
            <DocumentTable
              project={project}
              documents={documents}
              loading={loadingDocuments}
              onRefresh={onRefreshDocuments}
              onDeleteDocument={onDeleteDocument}
            />
          </div>
        )}

        {/* Tab 2: Full-width RAG Intelligence Terminal */}
        {activeTab === "rag" && (
          <div className="min-h-[600px]">
            <QueryTerminal
              activeProjectId={project.id}
              activeProjectTitle={project.title}
              history={queries}
              onOpenHistory={onOpenHistory}
              onQueryCompleted={onQueryCompleted}
            />
          </div>
        )}

        {/* Tab 3: Side-by-side Split View */}
        {activeTab === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[650px]">
            <div className="lg:col-span-6 h-full">
              <DocumentTable
                project={project}
                documents={documents}
                loading={loadingDocuments}
                onRefresh={onRefreshDocuments}
                onDeleteDocument={onDeleteDocument}
              />
            </div>
            <div className="lg:col-span-6 h-full">
              <QueryTerminal
                activeProjectId={project.id}
                activeProjectTitle={project.title}
                history={queries}
                onOpenHistory={onOpenHistory}
                onQueryCompleted={onQueryCompleted}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <SwissModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
        footer={
          <>
            <SwissButton
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </SwissButton>
            <SwissButton
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              loading={isDeleting}
            >
              Delete Project
            </SwissButton>
          </>
        }
      >
        <div className="text-xs space-y-3 font-sans text-slate-600 leading-relaxed">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">"{project.title}"</strong>?
          </p>
          <p>
            All uploaded files, documents, and vector embeddings in this project will be permanently deleted.
          </p>
        </div>
      </SwissModal>
    </div>
  );
};

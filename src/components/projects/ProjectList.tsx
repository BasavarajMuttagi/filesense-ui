import React, { useState } from "react";
import type { Project } from "../../types";
import { SwissButton } from "../common/SwissButton";
import { SwissModal } from "../common/SwissModal";
import { EmptyState } from "../common/EmptyState";
import { Folder, Plus, Trash2, Search, FileText, Calendar } from "lucide-react";

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  loading?: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenCreateModal,
  onDeleteProject,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (raw: string | number) => {
    try {
      const d = typeof raw === "number" ? new Date(raw * 1000) : new Date(raw);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return String(raw);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-900 swiss-shadow">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-900 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-[#0F172A] text-white px-1.5 py-0.5">
            01
          </span>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            PROJECTS // REPOSITORIES
          </h2>
        </div>
        <SwissButton
          variant="vermilion"
          size="sm"
          icon={<Plus className="w-3 h-3" />}
          onClick={onOpenCreateModal}
        >
          NEW
        </SwissButton>
      </div>

      {/* Filter / Search Bar */}
      {projects.length > 3 && (
        <div className="p-2 border-b border-slate-200 bg-white">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="FILTER REPOSITORIES..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs font-mono border border-slate-200 focus:border-slate-800 focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      )}

      {/* Project Item List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {loading && projects.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-slate-500">
            LOADING REPOSITORIES...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={searchTerm ? "No Matches Found" : "No Projects"}
              description={
                searchTerm
                  ? "Try a different search query."
                  : "Create your first project repository to begin ingesting documents."
              }
              code="PROJ_EMPTY"
              action={
                !searchTerm ? (
                  <SwissButton
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3 h-3" />}
                    onClick={onOpenCreateModal}
                  >
                    CREATE REPOSITORY
                  </SwissButton>
                ) : undefined
              }
            />
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`group p-3 transition-colors cursor-pointer relative border-l-4 ${
                  isSelected
                    ? "border-l-[#E11D48] bg-slate-50"
                    : "border-l-transparent hover:bg-slate-50/70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#E11D48]" : "text-slate-500"}`} />
                      <h3 className="text-xs font-bold font-mono uppercase tracking-tight text-slate-900 truncate">
                        {proj.title}
                      </h3>
                    </div>
                    {proj.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 font-sans">
                        {proj.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <FileText className="w-3 h-3" />
                        {proj.documentCount ?? 0} DOCS
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate">
                        <Calendar className="w-3 h-3" />
                        {formatDate(proj.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(proj);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-opacity cursor-pointer shrink-0"
                    title="Delete Project & Vector Data"
                    aria-label={`Delete project ${proj.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <SwissModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        title="Confirm Cascade Purge"
        code="PURGE // CASCADE"
        footer={
          <>
            <SwissButton
              variant="outline"
              size="sm"
              onClick={() => setProjectToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </SwissButton>
            <SwissButton
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              loading={isDeleting}
            >
              Purge All Data
            </SwissButton>
          </>
        }
      >
        <div className="text-xs space-y-3">
          <p className="font-bold text-red-600">
            WARNING: This action cannot be undone.
          </p>
          <p className="text-slate-700 leading-relaxed font-sans">
            Deleting project <strong className="font-mono text-slate-900">"{projectToDelete?.title}"</strong> will permanently delete:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-slate-600">
            <li>All associated document metadata in Turso DB</li>
            <li>All raw file objects stored in Tigris S3 storage</li>
            <li>All indexed vector embeddings and chunks in Upstash Vector</li>
          </ul>
        </div>
      </SwissModal>
    </div>
  );
};

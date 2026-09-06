import React, { useState } from "react";
import type { Project } from "../../types";
import { SwissButton } from "../common/SwissButton";
import { SwissBadge } from "../common/SwissBadge";
import { SwissModal } from "../common/SwissModal";
import { EmptyState } from "../common/EmptyState";
import {
  Folder,
  Plus,
  Trash2,
  Search,
  FileText,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface ProjectDashboardProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  loading?: boolean;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  onSelectProject,
  onOpenCreateModal,
  onDeleteProject,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProjects = projects.filter(
    (p) =>
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
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto py-2">
      {/* Dashboard Top Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Projects
          </h1>
          <p className="text-sm text-slate-500 font-sans">
            Select a project to upload documents and query them with AI.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <SwissButton
            variant="vermilion"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenCreateModal}
          >
            New Project
          </SwissButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {projects.length > 0 && (
        <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 p-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-sans border border-slate-200 focus:border-slate-900 focus:outline-none placeholder:text-slate-400 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
          </div>
        </div>
      )}

      {/* Grid of Projects */}
      {loading && projects.length === 0 ? (
        <div className="border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 font-sans">
          Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title={searchTerm ? "No matching projects" : "No projects yet"}
          description={
            searchTerm
              ? "Try adjusting your search terms."
              : "Create your first project to upload files and query documents."
          }
          action={
            !searchTerm ? (
              <SwissButton
                variant="vermilion"
                size="md"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={onOpenCreateModal}
              >
                Create First Project
              </SwissButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="group border border-slate-200 bg-white p-5 hover:border-slate-900 transition-all duration-150 cursor-pointer flex flex-col justify-between relative hover:shadow-xs"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <SwissBadge variant="mono">
                    <FileText className="w-3 h-3 inline mr-1" />
                    {proj.documentCount ?? 0} {proj.documentCount === 1 ? "doc" : "docs"}
                  </SwissBadge>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(proj);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-opacity cursor-pointer rounded-xs"
                    title="Delete Project"
                    aria-label={`Delete ${proj.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Project Title & Description */}
                <div className="flex items-start gap-2.5 mb-2">
                  <Folder className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 group-hover:text-slate-900 transition-colors" />
                  <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight group-hover:text-[#E11D48] transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-500 font-sans line-clamp-2 mb-4 leading-relaxed pl-6">
                    {proj.description}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-sans">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(proj.createdAt)}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <SwissModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        title="Delete Project"
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
              Delete Project
            </SwissButton>
          </>
        }
      >
        <div className="text-xs space-y-3 font-sans text-slate-600 leading-relaxed">
          <p>
            Are you sure you want to delete <strong className="text-slate-900">"{projectToDelete?.title}"</strong>?
          </p>
          <p>
            All uploaded files, documents, and search vectors will be permanently removed. This cannot be undone.
          </p>
        </div>
      </SwissModal>
    </div>
  );
};

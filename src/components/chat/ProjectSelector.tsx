import React, { useState, useRef, useEffect } from "react";
import type { Project, DocumentItem } from "../../types";
import {
  Folder,
  ChevronDown,
  Plus,
  Trash2,
  FileText,
  Check,
  Briefcase,
} from "lucide-react";

interface ProjectSelectorProps {
  projects: Project[];
  activeProject: Project | null;
  documents: DocumentItem[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  activeProject,
  documents,
  onSelectProject,
  onOpenNewProjectModal,
  onDeleteProject,
  onDeleteDocument,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilesList, setShowFilesList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowFilesList(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (!activeProject && projects.length === 0) {
    return (
      <button
        type="button"
        onClick={onOpenNewProjectModal}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0F172A] text-white hover:bg-slate-800 transition-colors cursor-pointer rounded-xs"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Create Project</span>
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer rounded-xs select-none"
        title="Switch Project"
      >
        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-semibold text-slate-900 max-w-[160px] sm:max-w-[220px] truncate font-sans">
          {activeProject ? activeProject.title : "Select Project"}
        </span>
        <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
          ({documents.length} {documents.length === 1 ? "file" : "files"})
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 shadow-lg rounded-xs z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
            <span>Projects</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNewProjectModal();
              }}
              className="text-[#E11D48] hover:underline flex items-center gap-1 cursor-pointer font-bold capitalize"
            >
              <Plus className="w-3 h-3" /> New
            </button>
          </div>

          {/* Project List */}
          <div className="max-h-48 overflow-y-auto py-1 divide-y divide-slate-50">
            {projects.map((p) => {
              const isActive = p.id === activeProject?.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isActive ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#E11D48]" : "text-slate-400"}`} />
                    <span className="truncate max-w-[170px] font-sans">{p.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-sans">
                      {p.documentCount ?? 0} docs
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-slate-900" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Project Files Section */}
          {activeProject && (
            <div className="border-t border-slate-100 pt-1.5 mt-1">
              <div
                onClick={() => setShowFilesList(!showFilesList)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 flex items-center justify-between cursor-pointer font-sans select-none"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Files in this project ({documents.length})
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showFilesList ? "rotate-180" : ""}`} />
              </div>

              {showFilesList && (
                <div className="max-h-36 overflow-y-auto px-2 py-1 space-y-1 bg-slate-50/50">
                  {documents.length === 0 ? (
                    <div className="text-[11px] text-slate-400 p-2 text-center font-sans">
                      No files yet. Attach documents in chat.
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-1.5 bg-white border border-slate-100 text-[11px] rounded-xs font-sans"
                      >
                        <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-700 font-medium" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-slate-400 text-[10px]">
                            {formatBytes(doc.fileSize)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument(doc.id);
                            }}
                            className="text-slate-300 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Delete Active Project option */}
              <div className="border-t border-slate-100 mt-1 px-3 py-1.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete project "${activeProject.title}" and all its documents?`)) {
                      onDeleteProject(activeProject.id);
                      setIsOpen(false);
                    }
                  }}
                  className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

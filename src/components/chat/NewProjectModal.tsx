import React, { useState } from "react";
import { createProject } from "../../api/projects";
import type { Project } from "../../types";
import { FolderPlus, X, Loader2 } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a project name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const project = await createProject({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      onProjectCreated(project);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#161613]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl border border-[#16161314] shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1616130d]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-2xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shrink-0 shadow-2xs">
              <FolderPlus className="size-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#161613]">New Project Workspace</h3>
              <p className="text-xs text-[#16161380]">Organize documents and query sessions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="size-8 flex items-center justify-center rounded-full text-[#16161380] hover:bg-[#1616130d] hover:text-[#161613] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-title" className="text-xs font-semibold text-[#161613]">
              Project Title
            </label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LLM Inference Specs, Q3 Financials"
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#16161318] bg-[#F8F7F3]/40 text-[#161613] placeholder:text-[#16161350] focus:bg-white focus:outline-none focus:border-[#161613] focus:ring-3 focus:ring-[#7C5CFC]/15 transition-all"
            />
            {error && <p className="text-xs text-[#C53030]">{error}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-description" className="text-xs font-semibold text-[#161613]">
              Description (Optional)
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, project context, or technical notes..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm rounded-2xl border border-[#16161318] bg-[#F8F7F3]/40 text-[#161613] placeholder:text-[#16161350] focus:bg-white focus:outline-none focus:border-[#161613] focus:ring-3 focus:ring-[#7C5CFC]/15 resize-none transition-all"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-white hover:bg-[#FAF9F6] text-[#161613] border border-[#16161314] rounded-full transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-[#161613] hover:bg-[#282824] text-white rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-50 hover:scale-[1.02] active:scale-95"
            >
              {loading && <Loader2 className="size-3.5 animate-spin text-white" />}
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { SwissModal } from "../common/SwissModal";
import { SwissButton } from "../common/SwissButton";
import { createProject } from "../../api/projects";
import type { Project } from "../../types";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a case or project name");
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
    <SwissModal
      isOpen={isOpen}
      onClose={onClose}
      title="New Case or Project"
      maxWidth="sm"
      footer={
        <>
          <SwissButton variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </SwissButton>
          <SwissButton
            variant="vermilion"
            size="sm"
            onClick={handleSubmit}
            loading={loading}
          >
            Create
          </SwissButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-sans">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            Case / Project Name
          </label>
          <input
            type="text"
            placeholder="e.g. Smith v. Jones, Metro Bridge Bid"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 focus:border-slate-900 rounded-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">
            Description (Optional)
          </label>
          <textarea
            placeholder="Brief scope, client name, or key dates..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 focus:border-slate-900 rounded-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
          />
        </div>
      </form>
    </SwissModal>
  );
};

import React, { useState } from "react";
import { SwissModal } from "../common/SwissModal";
import { SwissInput, SwissTextarea } from "../common/SwissInput";
import { SwissButton } from "../common/SwissButton";
import { createProject } from "../../api/projects";
import type { Project } from "../../types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
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
      setError("Project title is required");
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
      title="Create New Project"
      code="PROJ // NEW"
      footer={
        <>
          <SwissButton variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </SwissButton>
          <SwissButton
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={loading}
          >
            Create Project
          </SwissButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SwissInput
          label="Project Title *"
          sublabel="MAX 200 CHARS"
          placeholder="e.g., Financial Reports 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error || undefined}
          autoFocus
        />

        <SwissTextarea
          label="Description (Optional)"
          sublabel="MAX 1000 CHARS"
          placeholder="Summary of documents and domain scope for this project collection..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </form>
    </SwissModal>
  );
};

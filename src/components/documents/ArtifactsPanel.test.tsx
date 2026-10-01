import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { DocumentItem, Project } from "../../types";

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockDocs: DocumentItem[] = [
  {
    id: "doc-1",
    projectId: "proj-1",
    fileName: "system_architecture.pdf",
    mimeType: "application/pdf",
    fileSize: 1048576,
    status: "processed",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "doc-2",
    projectId: "proj-1",
    fileName: "migration_guide.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 512000,
    status: "processing",
    createdAt: "2026-01-02T00:00:00Z",
  },
];

describe("ArtifactsPanel component", () => {
  it("renders empty state message when no documents are attached", () => {
    render(
      <SidebarProvider>
        <ArtifactsPanel
          activeProject={mockProject}
          documents={[]}
          isOpen={true}
          onClose={vi.fn()}
          onDeleteDocument={vi.fn()}
          onInspectDocument={vi.fn()}
          onOpenNewProjectModal={vi.fn()}
        />
      </SidebarProvider>
    );

    expect(screen.getByText("No documents attached")).toBeInTheDocument();
  });

  it("renders uploaded files with correct filenames and status badges", () => {
    render(
      <SidebarProvider>
        <ArtifactsPanel
          activeProject={mockProject}
          documents={mockDocs}
          isOpen={true}
          onClose={vi.fn()}
          onDeleteDocument={vi.fn()}
          onInspectDocument={vi.fn()}
          onOpenNewProjectModal={vi.fn()}
        />
      </SidebarProvider>
    );

    expect(screen.getByText("system_architecture.pdf")).toBeInTheDocument();
    expect(screen.getByText("migration_guide.docx")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("Indexing")).toBeInTheDocument();
  });

  it("calls onClose when clicking the close button", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <SidebarProvider>
        <ArtifactsPanel
          activeProject={mockProject}
          documents={mockDocs}
          isOpen={true}
          onClose={handleClose}
          onDeleteDocument={vi.fn()}
          onInspectDocument={vi.fn()}
          onOpenNewProjectModal={vi.fn()}
        />
      </SidebarProvider>
    );

    const closeBtn = screen.getByRole("button", { name: /close files panel/i });
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

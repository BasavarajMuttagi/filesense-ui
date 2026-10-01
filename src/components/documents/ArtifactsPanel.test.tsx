import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ArtifactsPanel } from "./ArtifactsPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Project, DocumentItem } from "../../types";

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  description: "A test project",
  createdAt: Date.now(),
};

const mockDocuments: DocumentItem[] = [
  {
    id: "doc-1",
    projectId: "proj-1",
    fileName: "document-one.pdf",
    mimeType: "application/pdf",
    fileSize: 1024,
    status: "processed",
    createdAt: Date.now(),
  },
  {
    id: "doc-2",
    projectId: "proj-1",
    fileName: "document-two.txt",
    mimeType: "text/plain",
    fileSize: 2048,
    status: "processing",
    createdAt: Date.now(),
  },
];

const renderPanel = (props: any) => {
  return render(
    <SidebarProvider>
      <ArtifactsPanel {...props} />
    </SidebarProvider>
  );
};

describe("ArtifactsPanel", () => {
  it("renders empty state", async () => {
    const screen = await renderPanel({
      activeProject: mockProject,
      documents: [],
      isOpen: true,
      onClose: vi.fn(),
      onDeleteDocument: vi.fn(),
      onInspectDocument: vi.fn(),
      onOpenNewProjectModal: vi.fn(),
    });
    
    await expect.element(screen.getByText("No documents attached")).toBeVisible();
  });

  it("renders documents with filenames and status badges", async () => {
    const screen = await renderPanel({
      activeProject: mockProject,
      documents: mockDocuments,
      isOpen: true,
      onClose: vi.fn(),
      onDeleteDocument: vi.fn(),
      onInspectDocument: vi.fn(),
      onOpenNewProjectModal: vi.fn(),
    });
    
    await expect.element(screen.getByText("document-one.pdf")).toBeVisible();
    await expect.element(screen.getByText("document-two.txt")).toBeVisible();
    await expect.element(screen.getByText("Ready")).toBeVisible();
    await expect.element(screen.getByText("Indexing")).toBeVisible();
    
    await expect(screen.getByRole("complementary")).toMatchScreenshot("artifacts-panel-with-docs");
  });

  it("Close button calls onClose", async () => {
    const onClose = vi.fn();
    const screen = await renderPanel({
      activeProject: mockProject,
      documents: [],
      isOpen: true,
      onClose,
      onDeleteDocument: vi.fn(),
      onInspectDocument: vi.fn(),
      onOpenNewProjectModal: vi.fn(),
    });
    
    await screen.getByRole("button", { name: /close files panel/i }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Loading state shows skeletons", async () => {
    const screen = await renderPanel({
      activeProject: mockProject,
      documents: mockDocuments,
      isOpen: true,
      loading: true,
      onClose: vi.fn(),
      onDeleteDocument: vi.fn(),
      onInspectDocument: vi.fn(),
      onOpenNewProjectModal: vi.fn(),
    });
    
    await expect.element(screen.getByText("No documents attached")).not.toBeInTheDocument();
    await expect.element(screen.getByText("document-one.pdf")).not.toBeInTheDocument();
  });

  it("No active project shows create project prompt", async () => {
    const onOpenNewProjectModal = vi.fn();
    const screen = await renderPanel({
      activeProject: null,
      documents: [],
      isOpen: true,
      onClose: vi.fn(),
      onDeleteDocument: vi.fn(),
      onInspectDocument: vi.fn(),
      onOpenNewProjectModal,
    });
    
    await expect.element(screen.getByText("No project active")).toBeVisible();
    await screen.getByRole("button", { name: /create project/i }).click();
    expect(onOpenNewProjectModal).toHaveBeenCalledTimes(1);
  });

  it("Document click calls onInspectDocument", async () => {
    const onInspectDocument = vi.fn();
    const screen = await renderPanel({
      activeProject: mockProject,
      documents: mockDocuments,
      isOpen: true,
      onClose: vi.fn(),
      onDeleteDocument: vi.fn(),
      onInspectDocument,
      onOpenNewProjectModal: vi.fn(),
    });
    
    await screen.getByText("document-one.pdf").click();
    expect(onInspectDocument).toHaveBeenCalledWith(mockDocuments[0]);
  });

  it("Error status badge renders", async () => {
    const errorDoc: DocumentItem = {
      ...mockDocuments[0],
      id: "doc-error",
      status: "error",
    };
    const screen = await renderPanel({
      activeProject: mockProject,
      documents: [errorDoc],
      isOpen: true,
      onClose: vi.fn(),
      onDeleteDocument: vi.fn(),
      onInspectDocument: vi.fn(),
      onOpenNewProjectModal: vi.fn(),
    });
    
    await expect.element(screen.getByText("Error")).toBeVisible();
  });
});

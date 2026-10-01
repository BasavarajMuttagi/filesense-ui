import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Project, ChatSession } from "../../types";

const mockProjects: Project[] = [
  {
    id: "proj-1",
    title: "Engineering Knowledge Base",
    description: "Internal architecture documentation",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    documentCount: 5,
  },
  {
    id: "proj-2",
    title: "Product Roadmap",
    description: "Quarterly initiatives",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
    documentCount: 2,
  },
];

const mockSessions: ChatSession[] = [
  {
    sessionId: "sess-1",
    title: "Architecture Discussion",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    messageCount: 3,
  },
];

describe("AppSidebar component", () => {
  it("renders workspace branding and project list in default state", async () => {
    const handleSelectProject = vi.fn();
    const handleOpenModal = vi.fn();

    const screen = await render(
      <SidebarProvider>
        <AppSidebar
          projects={mockProjects}
          activeProject={mockProjects[0]}
          sessions={mockSessions}
          activeSessionId="sess-1"
          onSelectProject={handleSelectProject}
          onOpenNewProjectModal={handleOpenModal}
          onDeleteProject={vi.fn().mockResolvedValue(undefined)}
          onNewChat={vi.fn()}
          onSelectSession={vi.fn()}
        />
      </SidebarProvider>
    );

    // Functional assertions
    await expect.element(screen.getByText("FileSense")).toBeVisible();
    await expect.element(screen.getByText("Engineering Knowledge Base")).toBeVisible();
    await expect.element(screen.getByText("Architecture Discussion")).toBeVisible();

    // Visual screenshot assertion
    await expect(screen.locator).toMatchScreenshot("app-sidebar-with-projects");
  });

  it("triggers onOpenNewProjectModal when clicking create project button", async () => {
    const handleOpenModal = vi.fn();

    const screen = await render(
      <SidebarProvider>
        <AppSidebar
          projects={mockProjects}
          activeProject={null}
          sessions={[]}
          activeSessionId={null}
          onSelectProject={vi.fn()}
          onOpenNewProjectModal={handleOpenModal}
          onDeleteProject={vi.fn().mockResolvedValue(undefined)}
          onNewChat={vi.fn()}
          onSelectSession={vi.fn()}
        />
      </SidebarProvider>
    );

    const createButton = screen.getByRole("button", { name: "Create Project" });
    await expect.element(createButton).toBeVisible();
    await createButton.click();

    expect(handleOpenModal).toHaveBeenCalledTimes(1);
  });

  it("shows loading skeletons when loadingProjects is true", async () => {
    const screen = await render(
      <SidebarProvider>
        <AppSidebar
          projects={[]}
          activeProject={null}
          sessions={[]}
          activeSessionId={null}
          loadingProjects={true}
          onSelectProject={vi.fn()}
          onOpenNewProjectModal={vi.fn()}
          onDeleteProject={vi.fn()}
          onNewChat={vi.fn()}
          onSelectSession={vi.fn()}
        />
      </SidebarProvider>
    );
    await expect.element(screen.getByText("Engineering Knowledge Base")).not.toBeInTheDocument();
  });

  it("shows 'No projects yet.' when project list is empty", async () => {
    const screen = await render(
      <SidebarProvider>
        <AppSidebar
          projects={[]}
          activeProject={null}
          sessions={[]}
          activeSessionId={null}
          onSelectProject={vi.fn()}
          onOpenNewProjectModal={vi.fn()}
          onDeleteProject={vi.fn()}
          onNewChat={vi.fn()}
          onSelectSession={vi.fn()}
        />
      </SidebarProvider>
    );
    await expect.element(screen.getByText("No projects yet.")).toBeVisible();
  });

  it("hides Chat Threads section when no project is active", async () => {
    const screen = await render(
      <SidebarProvider>
        <AppSidebar
          projects={mockProjects}
          activeProject={null}
          sessions={[]}
          activeSessionId={null}
          onSelectProject={vi.fn()}
          onOpenNewProjectModal={vi.fn()}
          onDeleteProject={vi.fn()}
          onNewChat={vi.fn()}
          onSelectSession={vi.fn()}
        />
      </SidebarProvider>
    );
    await expect.element(screen.getByText("Chat Threads")).not.toBeInTheDocument();
    
    // Using query string or role
    const newThreadBtn = screen.getByRole("button", { name: "New Thread" });
    await expect.element(newThreadBtn).not.toBeInTheDocument();
  });

  it("calls onSelectProject when clicking a project", async () => {
    const handleSelectProject = vi.fn();
    const screen = await render(
      <SidebarProvider>
        <AppSidebar
          projects={mockProjects}
          activeProject={mockProjects[0]}
          sessions={[]}
          activeSessionId={null}
          onSelectProject={handleSelectProject}
          onOpenNewProjectModal={vi.fn()}
          onDeleteProject={vi.fn()}
          onNewChat={vi.fn()}
          onSelectSession={vi.fn()}
        />
      </SidebarProvider>
    );
    const projBtn = screen.getByRole("button", { name: "Product Roadmap" });
    await projBtn.click();
    expect(handleSelectProject).toHaveBeenCalledWith("proj-2");
  });

  it("calls onSelectSession when clicking a session", async () => {
    const handleSelectSession = vi.fn();
    const screen = await render(
      <SidebarProvider>
        <AppSidebar
          projects={mockProjects}
          activeProject={mockProjects[0]}
          sessions={mockSessions}
          activeSessionId={null}
          onSelectProject={vi.fn()}
          onOpenNewProjectModal={vi.fn()}
          onDeleteProject={vi.fn()}
          onNewChat={vi.fn()}
          onSelectSession={handleSelectSession}
        />
      </SidebarProvider>
    );
    const sessBtn = screen.getByRole("button", { name: "Architecture Discussion" });
    await sessBtn.click();
    expect(handleSelectSession).toHaveBeenCalledWith("sess-1");
  });
});

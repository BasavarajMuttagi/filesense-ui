import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { AppHeader } from "./AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Project, ChatSession } from "../../types";

const mockProject: Project = {
  id: "proj-1",
  title: "Engineering Knowledge Base",
  description: "Internal architecture documentation",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  documentCount: 5,
};

const mockSession: ChatSession = {
  sessionId: "sess-1",
  title: "Architecture Discussion",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  messageCount: 3,
};

describe("AppHeader component", () => {
  it("renders 'No project selected' when activeProject is null and verifies appearance", async () => {
    const screen = await render(
      <SidebarProvider>
        <AppHeader
          projects={[]}
          activeProject={null}
          activeSession={null}
          artifactsPanelOpen={true}
          onToggleArtifactsPanel={vi.fn()}
        />
      </SidebarProvider>
    );

    // Functional assertions (checked in both unit and visual runs)
    await expect.element(screen.getByText("No project selected")).toBeVisible();

    // Visual screenshot assertion (bypassed in test:unit, verified in test:visual)
    await expect(screen.getByRole("banner")).toMatchScreenshot("app-header-no-project");
  });

  it("renders project title and session breadcrumb when active and matches snapshot", async () => {
    const screen = await render(
      <SidebarProvider>
        <AppHeader
          projects={[mockProject]}
          activeProject={mockProject}
          activeSession={mockSession}
          artifactsPanelOpen={true}
          onToggleArtifactsPanel={vi.fn()}
        />
      </SidebarProvider>
    );

    await expect.element(screen.getByText("Engineering Knowledge Base")).toBeVisible();
    await expect.element(screen.getByText("Architecture Discussion")).toBeVisible();

    await expect(screen.getByRole("banner")).toMatchScreenshot("app-header-active-project");
  });

  it("calls onToggleArtifactsPanel when clicking the files toggle button", async () => {
    const handleToggle = vi.fn();

    const screen = await render(
      <SidebarProvider>
        <AppHeader
          projects={[mockProject]}
          activeProject={mockProject}
          activeSession={null}
          artifactsPanelOpen={false}
          onToggleArtifactsPanel={handleToggle}
        />
      </SidebarProvider>
    );

    const toggleButton = screen.getByRole("button", { name: /files/i });
    await expect.element(toggleButton).toBeVisible();

    await toggleButton.click();
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("shows 'New Thread' when project is active but no session", async () => {
    const screen = await render(
      <SidebarProvider>
        <AppHeader
          projects={[mockProject]}
          activeProject={mockProject}
          activeSession={null}
          artifactsPanelOpen={true}
          onToggleArtifactsPanel={vi.fn()}
        />
      </SidebarProvider>
    );

    await expect.element(screen.getByText("Engineering Knowledge Base")).toBeVisible();
    await expect.element(screen.getByText("New Thread")).toBeVisible();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  it("renders 'No project selected' when activeProject is null", () => {
    render(
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

    expect(screen.getByText("No project selected")).toBeInTheDocument();
  });

  it("renders project title and session breadcrumb when active", () => {
    render(
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

    expect(screen.getByText("Engineering Knowledge Base")).toBeInTheDocument();
    expect(screen.getByText("Architecture Discussion")).toBeInTheDocument();
  });

  it("calls onToggleArtifactsPanel when clicking the files toggle button", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(
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
    expect(toggleButton).toBeInTheDocument();

    await user.click(toggleButton);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ChatView } from "./ChatView";
import type { Project, QueryRecord } from "../../types";

const mockProject: Project = {
  id: "proj-1",
  title: "Engineering Knowledge Base",
  description: "Internal architecture documentation",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  documentCount: 3,
};

const mockHistory: QueryRecord[] = [
  {
    id: "q-1",
    projectId: "proj-1",
    sessionId: "sess-1",
    question: "How does the caching layer work?",
    answer: "The caching layer utilizes Redis with an LRU eviction strategy and a 5-minute TTL.",
    sources: [],
    createdAt: 1704067200,
  },
];

describe("ChatView component", () => {
  it("renders welcome prompt and create first project button when no project exists", async () => {
    const handleOpenModal = vi.fn();

    const screen = await render(
      <ChatView
        activeProject={null}
        projects={[]}
        activeSessionId={null}
        onOpenNewProjectModal={handleOpenModal}
      />
    );

    // Functional assertions
    await expect.element(screen.getByText("Welcome to FileSense")).toBeVisible();
    const createBtn = screen.getByRole("button", { name: "Create First Project" });
    await expect.element(createBtn).toBeVisible();

    await createBtn.click();
    expect(handleOpenModal).toHaveBeenCalledTimes(1);

    // Visual screenshot of no-project state
    await expect(screen.locator).toMatchScreenshot("chat-view-no-projects");
  });

  it("renders welcome screen with starter prompts when documents are attached", async () => {
    const screen = await render(
      <ChatView
        activeProject={mockProject}
        activeSessionId="sess-1"
        documentCount={3}
        initialHistory={[]}
        onOpenNewProjectModal={vi.fn()}
      />
    );

    await expect.element(screen.getByText("Engineering Knowledge Base")).toBeVisible();
    await expect.element(screen.getByText("Summarize the main topics in these documents")).toBeVisible();

    // Visual screenshot of welcome state with starter prompts
    await expect(screen.locator).toMatchScreenshot("chat-view-welcome-prompts");
  });

  it("renders conversation history messages with questions and answers", async () => {
    const screen = await render(
      <ChatView
        activeProject={mockProject}
        activeSessionId="sess-1"
        initialHistory={mockHistory}
        onOpenNewProjectModal={vi.fn()}
      />
    );

    await expect.element(screen.getByText("How does the caching layer work?")).toBeVisible();
    await expect.element(screen.getByText(/The caching layer utilizes Redis/i)).toBeVisible();
  });
});

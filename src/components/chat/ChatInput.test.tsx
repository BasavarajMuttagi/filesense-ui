import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./ChatInput";
import type { Project } from "../../types";

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  description: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("ChatInput component", () => {
  it("renders textarea with placeholder", () => {
    render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={vi.fn()}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
        placeholder="Custom placeholder text..."
      />
    );

    expect(
      screen.getByPlaceholderText("Custom placeholder text...")
    ).toBeInTheDocument();
  });

  it("submits message when user types and clicks Send button", async () => {
    const user = userEvent.setup();
    const handleSendMessage = vi.fn();

    render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={handleSendMessage}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
      />
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Explain the database schema");

    const sendButton = screen.getByRole("button", { name: /send message/i });
    expect(sendButton).not.toBeDisabled();

    await user.click(sendButton);

    expect(handleSendMessage).toHaveBeenCalledWith("Explain the database schema");
    expect(textarea).toHaveValue("");
  });

  it("submits message when user presses Enter (without Shift)", async () => {
    const user = userEvent.setup();
    const handleSendMessage = vi.fn();

    render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={handleSendMessage}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
      />
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "What are the dependencies?{Enter}");

    expect(handleSendMessage).toHaveBeenCalledWith("What are the dependencies?");
    expect(textarea).toHaveValue("");
  });

  it("renders Stop button when loading is true and onStop is provided", () => {
    render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={vi.fn()}
        onOpenNewProjectModal={vi.fn()}
        loading={true}
        onStop={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /stop generation/i })).toBeInTheDocument();
  });
});

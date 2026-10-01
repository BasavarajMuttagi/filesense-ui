import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./ChatInput";
import type { Project } from "../../types";

vi.mock("../../api/upload", () => ({
  uploadFile: vi.fn().mockResolvedValue(undefined),
  MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024,
}));

const mockProject: Project = {
  id: "proj-1",
  title: "Test Project",
  description: "A test project",
  createdAt: Date.now(),
};

describe("ChatInput", () => {
  it("renders textarea with custom placeholder", async () => {
    const screen = await render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={vi.fn()}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
        placeholder="Custom placeholder text"
      />
    );
    await expect.element(screen.getByPlaceholder("Custom placeholder text")).toBeVisible();
  });

  it("submits message on Send button click", async () => {
    const onSendMessage = vi.fn();
    const screen = await render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={onSendMessage}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
      />
    );

    await screen.getByRole("textbox").fill("Hello world");
    await screen.getByRole("button", { name: /send message/i }).click();

    expect(onSendMessage).toHaveBeenCalledWith("Hello world");
    expect(onSendMessage).toHaveBeenCalledTimes(1);
    await expect.element(screen.getByRole("textbox")).toHaveValue("");
  });

  it("submits on Enter key", async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    const screen = await render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={onSendMessage}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
      />
    );

    const textarea = screen.getByRole("textbox").element() as HTMLTextAreaElement;
    await user.type(textarea, "Hello world{Enter}");

    expect(onSendMessage).toHaveBeenCalledWith("Hello world");
  });

  it("does NOT submit on Shift+Enter", async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();
    const screen = await render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={onSendMessage}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
      />
    );

    const textarea = screen.getByRole("textbox").element() as HTMLTextAreaElement;
    await user.type(textarea, "Hello world{Shift>}{Enter}{/Shift}");

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it("shows Stop button when loading", async () => {
    const onStop = vi.fn();
    const screen = await render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={vi.fn()}
        onOpenNewProjectModal={vi.fn()}
        loading={true}
        onStop={onStop}
      />
    );

    const stopButton = screen.getByRole("button", { name: /stop generation/i });
    await expect.element(stopButton).toBeVisible();
    await stopButton.click();
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("Send button disabled when text is empty", async () => {
    const screen = await render(
      <ChatInput
        activeProject={mockProject}
        onSendMessage={vi.fn()}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
      />
    );

    await expect.element(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("shows no-project placeholder", async () => {
    const screen = await render(
      <ChatInput
        activeProject={null}
        onSendMessage={vi.fn()}
        onOpenNewProjectModal={vi.fn()}
        loading={false}
      />
    );

    await expect.element(screen.getByPlaceholder("Select or create a project to start chatting...")).toBeVisible();
  });
});

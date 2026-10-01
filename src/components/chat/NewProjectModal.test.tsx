import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { NewProjectModal } from "./NewProjectModal";
import { apiClient } from "../../api/client";

describe("NewProjectModal component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders modal dialog with form fields and matches snapshot", async () => {
    const handleClose = vi.fn();
    const handleProjectCreated = vi.fn();

    const screen = await render(
      <NewProjectModal
        isOpen={true}
        onClose={handleClose}
        onProjectCreated={handleProjectCreated}
      />
    );

    // Functional assertions
    await expect.element(screen.getByRole("dialog")).toBeVisible();
    await expect.element(screen.getByText("New Project Workspace")).toBeVisible();
    await expect.element(screen.getByLabelText("Project Title")).toBeVisible();
    await expect.element(screen.getByLabelText("Description (Optional)")).toBeVisible();

    // Visual screenshot assertion
    await expect(screen.getByRole("dialog")).toMatchScreenshot("new-project-modal-default");
  });

  it("disables create button when title is empty and enables when title is provided", async () => {
    const screen = await render(
      <NewProjectModal
        isOpen={true}
        onClose={vi.fn()}
        onProjectCreated={vi.fn()}
      />
    );

    const submitButton = screen.getByRole("button", { name: "Create Project" });
    await expect.element(submitButton).toBeVisible();
    await expect.element(submitButton).toBeDisabled();

    const titleInput = screen.getByLabelText("Project Title");
    await titleInput.fill("Enterprise Search");
    await expect.element(submitButton).toBeEnabled();
  });

  it("calls onClose when clicking Cancel button", async () => {
    const handleClose = vi.fn();
    const screen = await render(
      <NewProjectModal
        isOpen={true}
        onClose={handleClose}
        onProjectCreated={vi.fn()}
      />
    );
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await cancelBtn.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("submits form and calls onProjectCreated on success", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        id: "new-proj-1",
        title: "My New Project",
        description: "A description",
        createdAt: "2026-01-01T00:00:00Z",
      },
    });

    const handleClose = vi.fn();
    const handleProjectCreated = vi.fn();
    const screen = await render(
      <NewProjectModal
        isOpen={true}
        onClose={handleClose}
        onProjectCreated={handleProjectCreated}
      />
    );

    await screen.getByLabelText("Project Title").fill("My New Project");
    await screen.getByLabelText("Description (Optional)").fill("A description");
    await screen.getByRole("button", { name: "Create Project" }).click();

    await vi.waitFor(() => {
      expect(postSpy).toHaveBeenCalledTimes(1);
    });
    expect(handleProjectCreated).toHaveBeenCalledWith(expect.objectContaining({ id: "new-proj-1" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("displays error message when API fails", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValueOnce(new Error("Network failure"));

    const screen = await render(
      <NewProjectModal
        isOpen={true}
        onClose={vi.fn()}
        onProjectCreated={vi.fn()}
      />
    );

    await screen.getByLabelText("Project Title").fill("Fail Project");
    await screen.getByRole("button", { name: "Create Project" }).click();

    await expect.element(screen.getByText(/Network failure/i)).toBeVisible();
  });
});

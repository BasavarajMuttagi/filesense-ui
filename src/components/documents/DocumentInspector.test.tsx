import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { DocumentInspector } from "./DocumentInspector";
import type { DocumentItem } from "../../types";

const mockDocument: DocumentItem = {
  id: "doc-1",
  projectId: "proj-1",
  fileName: "quarterly-report.pdf",
  mimeType: "application/pdf",
  fileSize: 1048576, // 1 MB
  status: "processed",
  createdAt: 1704067200,
};

describe("DocumentInspector component", () => {
  it("renders null when document is null", async () => {
    const screen = await render(
      <DocumentInspector
        document={null}
        onClose={vi.fn()}
        onDeleteDocument={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    await expect.element(dialog).not.toBeInTheDocument();
  });

  it("renders document metadata and status badge when document is provided", async () => {
    const screen = await render(
      <DocumentInspector
        document={mockDocument}
        onClose={vi.fn()}
        onDeleteDocument={vi.fn()}
      />
    );

    // Functional assertions
    await expect.element(screen.getByRole("dialog")).toBeVisible();
    await expect.element(screen.getByText("quarterly-report.pdf")).toBeVisible();
    await expect.element(screen.getByText("application/pdf")).toBeVisible();
    await expect.element(screen.getByText("processed")).toBeVisible();
    await expect.element(screen.getByText("1 MB")).toBeVisible();

    // Visual screenshot of the inspector modal
    await expect(screen.getByRole("dialog")).toMatchScreenshot("document-inspector-modal");
  });

  it("handles delete confirmation flow correctly", async () => {
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    const screen = await render(
      <DocumentInspector
        document={mockDocument}
        onClose={handleClose}
        onDeleteDocument={handleDelete}
      />
    );

    // Step 1: Initial delete button
    const initialDeleteBtn = screen.getByRole("button", { name: "Delete File" });
    await expect.element(initialDeleteBtn).toBeVisible();
    await initialDeleteBtn.click();

    // Step 2: Confirmation state is shown
    await expect.element(screen.getByText("Confirm deletion?")).toBeVisible();
    const confirmBtn = screen.getByRole("button", { name: "Delete" });
    await expect.element(confirmBtn).toBeVisible();

    // Step 3: Clicking confirm triggers deletion and closes modal
    await confirmBtn.click();
    expect(handleDelete).toHaveBeenCalledWith("doc-1");
  });

  it("renders destructive badge for error status", async () => {
    const errorDoc: DocumentItem = {
      ...mockDocument,
      id: "doc-err",
      status: "error",
    };

    const screen = await render(
      <DocumentInspector
        document={errorDoc}
        onClose={vi.fn()}
        onDeleteDocument={vi.fn()}
      />
    );

    await expect.element(screen.getByText("error")).toBeVisible();
  });
});

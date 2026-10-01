import React, { useState } from "react";
import type { DocumentItem } from "../../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  FileText,
  Database,
  HardDrive,
  Calendar,
  Trash2,
  Layers,
} from "lucide-react";

interface DocumentInspectorProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDeleteDocument: (docId: string) => Promise<void>;
}

export const DocumentInspector: React.FC<DocumentInspectorProps> = ({
  document,
  onClose,
  onDeleteDocument,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!document) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (raw: string | number) => {
    try {
      const d = typeof raw === "number" ? new Date(raw * 1000) : new Date(raw);
      return d.toLocaleString();
    } catch {
      return String(raw);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteDocument(document.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={!!document} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="size-5 text-muted-foreground shrink-0" />
              <DialogTitle className="truncate" title={document.fileName}>
                {document.fileName}
              </DialogTitle>
            </div>
            <Badge
              variant={
                document.status === "processed"
                  ? "default"
                  : document.status === "processing"
                  ? "secondary"
                  : document.status === "error"
                  ? "destructive"
                  : "outline"
              }
              className="text-[10px] font-mono uppercase shrink-0"
            >
              {document.status}
            </Badge>
          </div>
          <DialogDescription className="font-mono text-xs">
            {document.mimeType}
          </DialogDescription>
        </DialogHeader>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="p-3 bg-muted rounded-lg flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <HardDrive className="size-3.5" /> File Size
            </span>
            <span className="text-sm font-semibold font-mono">
              {formatBytes(document.fileSize)}
            </span>
          </div>

          <div className="p-3 bg-muted rounded-lg flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Layers className="size-3.5" /> Chunks
            </span>
            <span className="text-sm font-semibold font-mono">
              {document.chunkCount ?? "Indexed"}
            </span>
          </div>

          <div className="p-3 bg-muted rounded-lg flex flex-col gap-1 col-span-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <Calendar className="size-3.5" /> Ingestion Date
            </span>
            <span className="text-xs font-mono">
              {formatDate(document.createdAt)}
            </span>
          </div>

          {document.storageUrl && (
            <div className="p-3 bg-muted rounded-lg flex flex-col gap-1 col-span-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Database className="size-3.5" /> Storage Path
              </span>
              <span className="text-[11px] font-mono text-muted-foreground truncate" title={document.storageUrl}>
                {document.storageUrl}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-xs text-destructive font-medium">Confirm deletion?</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting && <Spinner data-icon="inline-start" />}
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 data-icon="inline-start" />
                <span>Delete File</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

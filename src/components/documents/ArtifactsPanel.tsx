import React, { useState } from "react";
import type { DocumentItem, Project } from "../../types";
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  FileText,
  Trash2,
  X,
  Code,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Eye,
  HardDrive,
  Plus,
} from "lucide-react";

interface ArtifactsPanelProps {
  activeProject: Project | null;
  documents: DocumentItem[];
  isOpen?: boolean;
  loading?: boolean;
  onClose: () => void;
  onDeleteDocument: (docId: string) => Promise<void>;
  onInspectDocument: (docItem: DocumentItem) => void;
  onOpenNewProjectModal: () => void;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({
  activeProject,
  documents,
  isOpen = true,
  loading = false,
  onClose,
  onDeleteDocument,
  onInspectDocument,
  onOpenNewProjectModal,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string, mimeType: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    if (["ts", "tsx", "js", "jsx", "py"].includes(ext)) {
      return <Code className="size-4" />;
    }
    if (["prisma", "json", "sql", "yaml", "yml"].includes(ext)) {
      return <FileCode className="size-4" />;
    }
    if (["csv", "xlsx", "xls"].includes(ext)) {
      return <FileSpreadsheet className="size-4" />;
    }
    if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) {
      return <ImageIcon className="size-4" />;
    }
    return <FileText className="size-4" />;
  };

  const handleDelete = async (docId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingId(docId);
    try {
      await onDeleteDocument(docId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside
      data-state={isOpen ? "open" : "closed"}
      aria-label="Document Inspector Panel"
      className={cn(
        "border-l border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,opacity] duration-200 ease-in-out shrink-0 overflow-hidden flex flex-col h-full",
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-l-0 pointer-events-none"
      )}
    >
      <div className="w-80 flex flex-col h-full min-w-80">
        {/* 1. Header */}
        <SidebarHeader className="h-12 border-b border-sidebar-border flex-row items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Project Files</span>
            <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
              {documents.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            aria-label="Close files panel"
          >
            <X className="size-3.5" />
          </Button>
        </SidebarHeader>

        {/* 2. Content */}
        <SidebarContent className="flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel>Indexed Files ({documents.length})</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {loading ? (
                  <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ) : !activeProject ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <HardDrive className="size-6 mx-auto mb-1.5 opacity-40" />
                    <p className="text-xs">No project active</p>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={onOpenNewProjectModal}
                      className="mt-2 text-xs gap-1"
                    >
                      <Plus className="size-3" />
                      <span>Create Project</span>
                    </Button>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileText className="size-6 mx-auto mb-1.5 opacity-40" />
                    <p className="text-xs font-medium text-foreground">No documents attached</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] mx-auto">
                      Attach files in chat to index embeddings.
                    </p>
                  </div>
                ) : (
                  documents.map((doc) => {
                    const isDeleting = deletingId === doc.id;
                    const isProcessing = doc.status === "processing" || doc.status === "created";
                    const isError = doc.status === "error";

                    return (
                      <SidebarMenuItem key={doc.id}>
                        <SidebarMenuButton
                          onClick={() => onInspectDocument(doc)}
                          className="h-auto py-2 px-2.5 pr-16 items-start group-hover/menu-item:pr-16"
                        >
                          <div className="mt-0.5 shrink-0 text-muted-foreground">
                            {getFileIcon(doc.fileName, doc.mimeType)}
                          </div>

                          <div className="grid flex-1 gap-1 min-w-0">
                            <span className="truncate text-xs font-medium" title={doc.fileName}>
                              {doc.fileName}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                              <span>{formatBytes(doc.fileSize)}</span>
                              <span>·</span>
                              {isProcessing ? (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium"
                                >
                                  <span className="inline-block size-1 rounded-full bg-amber-500 animate-pulse mr-1" />
                                  Indexing
                                </Badge>
                              ) : isError ? (
                                <Badge
                                  variant="destructive"
                                  className="text-[9px] px-1.5 py-0 h-4 bg-destructive/10 text-destructive border-destructive/20 font-medium"
                                >
                                  Error
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium"
                                >
                                  Ready
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SidebarMenuButton>

                        <SidebarMenuAction
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectDocument(doc);
                          }}
                          showOnHover
                          title="Inspect file"
                          className="right-7"
                        >
                          <Eye className="size-3" />
                        </SidebarMenuAction>

                        <SidebarMenuAction
                          onClick={(e) => handleDelete(doc.id, e)}
                          showOnHover
                          title="Delete file"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          {isDeleting ? (
                            <Spinner className="size-3" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </aside>
  );
};

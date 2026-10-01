import React from "react";
import type { Project, ChatSession } from "../../types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { PanelRight, Folder, MessageSquare } from "lucide-react";

interface AppHeaderProps {
  projects: Project[];
  activeProject: Project | null;
  activeSession: ChatSession | null;
  documentCount?: number;
  artifactsPanelOpen: boolean;
  onToggleArtifactsPanel: () => void;
  onToggleSidebar?: () => void;
  onSelectProject?: (projectId: string) => void;
  onOpenNewProjectModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeProject,
  activeSession,
  artifactsPanelOpen,
  onToggleArtifactsPanel,
}) => {
  return (
    <header className="h-12 w-full bg-background border-b border-border flex items-center justify-between px-3 shrink-0">
      {/* Left: Sidebar Trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />

        <Breadcrumb>
          <BreadcrumbList>
            {!activeProject ? (
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs text-muted-foreground">
                  No project selected
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Folder className="size-3.5" />
                    <span className="truncate max-w-[140px]" title={activeProject.title}>
                      {activeProject.title}
                    </span>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    {activeSession ? (
                      <>
                        <MessageSquare className="size-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[200px]" title={activeSession.title}>
                          {activeSession.title}
                        </span>
                      </>
                    ) : (
                      "New Thread"
                    )}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Files Drawer Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={artifactsPanelOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={onToggleArtifactsPanel}
          className="text-xs gap-1.5 h-8 px-2.5"
        >
          <PanelRight className="size-3.5" />
          <span>Files</span>
        </Button>
      </div>
    </header>
  );
};

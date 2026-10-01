import React, { useState } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import type { Project, ChatSession } from "../../types";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Folder,
  Trash2,
  MoreHorizontal,
  Layers,
  MessageSquare,
} from "lucide-react";

interface AppSidebarProps {
  projects: Project[];
  activeProject: Project | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
  loadingProjects?: boolean;
  loadingSessions?: boolean;
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  projects,
  activeProject,
  sessions,
  activeSessionId,
  loadingProjects = false,
  loadingSessions = false,
  onSelectProject,
  onOpenNewProjectModal,
  onDeleteProject,
  onNewChat,
  onSelectSession,
}) => {
  const { user } = useUser();
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 8);
  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, 10);

  return (
    <Sidebar side="left" collapsible="icon">
      {/* 1. Header */}
      <SidebarHeader className="p-2 pb-0 gap-10">
        <div className="flex h-8 items-center gap-2 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold text-foreground">FileSense</span>
            <span className="truncate text-xs text-muted-foreground">Document RAG Engine</span>
          </div>
        </div>

        {/* New Thread Action Button */}
        {activeProject && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onNewChat}
                tooltip="New Thread"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary font-medium shadow-xs"
              >
                <Plus className="size-4 shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">New Thread</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>

      {/* 2. Content */}
      <SidebarContent className="gap-3 pt-1">
        {/* PROJECTS SECTION */}
        <SidebarGroup className="px-3 py-1 group-data-[collapsible=icon]:p-2">
          <SidebarGroupLabel className="px-1 text-xs font-semibold text-muted-foreground/80 tracking-wider uppercase mb-1">
            Projects
          </SidebarGroupLabel>
          <SidebarGroupAction
            title="Create Project"
            onClick={onOpenNewProjectModal}
            className="right-2 top-3 hover:bg-sidebar-accent rounded-md"
          >
            <Plus className="size-4" />
            <span className="sr-only">Create Project</span>
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {loadingProjects ? (
                <div className="flex flex-col gap-1 px-2 py-1">
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-3/4 rounded-md" />
                </div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                  No projects yet.
                </div>
              ) : (
                visibleProjects.map((proj) => {
                  const isActive = activeProject?.id === proj.id;
                  return (
                    <SidebarMenuItem key={proj.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => onSelectProject(proj.id)}
                        tooltip={proj.title}
                      >
                        <Folder className="size-4 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{proj.title}</span>
                      </SidebarMenuButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <SidebarMenuAction showOnHover className="right-2">
                              <MoreHorizontal />
                              <span className="sr-only">More options</span>
                            </SidebarMenuAction>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() => onDeleteProject(proj.id)}
                              className="text-destructive text-xs gap-2 cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete Project</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                })
              )}

              {projects.length > 8 && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    className="text-xs text-muted-foreground justify-center group-data-[collapsible=icon]:hidden"
                  >
                    {showAllProjects ? "Show less" : `+${projects.length - 8} more`}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CHAT THREADS SECTION */}
        {activeProject && (
          <SidebarGroup className="px-3 pt-3 pb-1 group-data-[collapsible=icon]:p-2">
            <SidebarGroupLabel className="px-1 text-xs font-semibold text-muted-foreground/80 tracking-wider uppercase mb-1">
              Chat Threads
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {loadingSessions ? (
                  <div className="flex flex-col gap-1 px-2 py-1">
                    <Skeleton className="h-7 w-full rounded-md" />
                    <Skeleton className="h-7 w-4/5 rounded-md" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                    No threads yet.
                  </div>
                ) : (
                  visibleSessions.map((sess) => {
                    const isActive = activeSessionId === sess.sessionId;
                    return (
                      <SidebarMenuItem key={sess.sessionId}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => onSelectSession(sess.sessionId)}
                          tooltip={sess.title}
                        >
                          <MessageSquare className="size-4 shrink-0" />
                          <span className="truncate group-data-[collapsible=icon]:hidden">{sess.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}

                {sessions.length > 10 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setShowAllSessions(!showAllSessions)}
                      className="text-xs text-muted-foreground justify-center group-data-[collapsible=icon]:hidden"
                    >
                      {showAllSessions ? "Show less" : `+${sessions.length - 10} more`}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* 3. Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <UserButton />
              <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

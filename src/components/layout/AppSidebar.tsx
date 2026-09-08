import React, { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import type { Project, ChatSession } from "../../types";
import {
  Plus,
  Folder,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  Layers,
  MessageSquare,
} from "lucide-react";
import { SidebarNavSkeleton } from "../common/SwissSkeleton";

interface AppSidebarProps {
  projects: Project[];
  activeProject: Project | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
  collapsed: boolean;
  loadingProjects?: boolean;
  loadingSessions?: boolean;
  onToggleCollapse: () => void;
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
  collapsed,
  loadingProjects = false,
  loadingSessions = false,
  onToggleCollapse,
  onSelectProject,
  onOpenNewProjectModal,
  onDeleteProject,
  onNewChat,
  onSelectSession,
}) => {
  const { user } = useUser();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [sessionsExpanded, setSessionsExpanded] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 6);
  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, 8);

  if (collapsed) {
    return (
      <aside className="w-13 h-screen bg-[#F8F7F3] border-r border-[#16161312] flex flex-col items-center py-3 shrink-0 z-30 font-sans select-none">
        {/* Brand Mark */}
        <div className="size-8 bg-[#E2DAFF] text-[#7C5CFC] rounded-2xl flex items-center justify-center mb-3 shrink-0 shadow-2xs">
          <Layers className="size-4" />
        </div>

        {/* Quick New Chat Button */}
        {activeProject && (
          <button
            type="button"
            onClick={onNewChat}
            aria-label="New thread"
            title="New thread"
            className="size-8 flex items-center justify-center rounded-full bg-[#161613] text-white hover:bg-[#282824] transition-transform active:scale-95 shadow-xs mb-3 cursor-pointer"
          >
            <Plus className="size-4" />
          </button>
        )}

        {/* Projects Icons */}
        <div className="flex-1 w-full flex flex-col items-center gap-1.5 overflow-y-auto px-1.5 scrollbar-none">
          {loadingProjects ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="size-8 rounded-2xl bg-[#EFECE6] animate-shimmer" />
              <div className="size-8 rounded-2xl bg-[#EFECE6] animate-shimmer" />
              <div className="size-8 rounded-2xl bg-[#EFECE6] animate-shimmer" />
            </div>
          ) : (
            projects.map((p) => {
              const isActive = p.id === activeProject?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProject(p.id)}
                  title={p.title}
                  className={`size-8 flex items-center justify-center rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#7C5CFC] text-white shadow-xs"
                      : "text-[#16161399] hover:bg-[#1616130d] hover:text-[#161613]"
                  }`}
                >
                  {p.title.charAt(0).toUpperCase()}
                </button>
              );
            })
          )}
        </div>

        {/* Expand Trigger */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="mt-auto size-8 flex items-center justify-center rounded-full text-[#16161380] hover:bg-[#1616130d] hover:text-[#161613] transition-colors cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-[#F8F7F3] border-r border-[#16161312] flex flex-col shrink-0 z-30 font-sans select-none">
      {/* Top Header Section */}
      <div className="h-12 px-3.5 border-b border-[#16161310] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 rounded-xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shrink-0 shadow-2xs">
            <Layers className="size-4" />
          </div>
          <span className="font-serif text-base font-bold text-[#161613] tracking-tight">
            FileSense
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="size-7 flex items-center justify-center rounded-full text-[#16161380] hover:bg-[#1616130d] hover:text-[#161613] transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-3.5" />
        </button>
      </div>

      {/* New Chat Primary Action - Tiimo obsidian pill */}
      {activeProject && (
        <div className="p-3 pb-1">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#161613] hover:bg-[#282824] text-white rounded-full shadow-xs transition-all cursor-pointer hover:scale-[0.99] active:scale-95"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>New Thread</span>
          </button>
        </div>
      )}

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
        {/* PROJECTS SECTION */}
        <div>
          <div className="flex items-center justify-between px-1.5 mb-1.5">
            <button
              type="button"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#16161380] uppercase tracking-wider hover:text-[#161613] transition-colors cursor-pointer"
            >
              <span>Projects</span>
              <ChevronDown
                className={`size-3 transition-transform duration-200 ${
                  projectsExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={onOpenNewProjectModal}
              aria-label="Create new project"
              title="Create new project"
              className="size-5 flex items-center justify-center rounded-full text-[#16161380] hover:bg-[#1616130f] hover:text-[#161613] transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {projectsExpanded && (
            <div className="space-y-1">
              {loadingProjects ? (
                <div className="py-1">
                  <SidebarNavSkeleton count={3} />
                </div>
              ) : projects.length === 0 ? (
                <div className="px-2 py-2 text-xs text-[#16161366] italic">No projects yet</div>
              ) : (
                visibleProjects.map((p) => {
                  const isActive = p.id === activeProject?.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-2 text-xs rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? "bg-white text-[#161613] font-medium shadow-xs border border-[#16161310]"
                          : "text-[#161613b3] hover:bg-[#16161308] hover:text-[#161613] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Folder
                          className={`size-3.5 shrink-0 ${
                            isActive ? "text-[#7C5CFC]" : "text-[#16161366]"
                          }`}
                        />
                        <span className="truncate max-w-[130px]">{p.title}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {typeof p.documentCount === "number" && p.documentCount > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#E2DAFF]/60 text-[#5B3EDB] font-medium">
                            {p.documentCount}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete project "${p.title}" and all its documents?`)) {
                              onDeleteProject(p.id);
                            }
                          }}
                          aria-label="Delete project"
                          title="Delete project"
                          className="opacity-0 group-hover:opacity-100 size-4.5 flex items-center justify-center rounded-full text-[#16161366] hover:text-rose-600 transition-all cursor-pointer ml-1"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {projects.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#16161366] hover:text-[#161613] transition-colors cursor-pointer w-full text-left mt-0.5"
                >
                  <MoreHorizontal className="size-3 shrink-0" />
                  <span>{showAllProjects ? "Show less" : `+${projects.length - 6} more`}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* THREADS / SESSIONS SECTION */}
        <div>
          <div className="flex items-center justify-between px-1.5 mb-1.5">
            <button
              type="button"
              onClick={() => setSessionsExpanded(!sessionsExpanded)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#16161380] uppercase tracking-wider hover:text-[#161613] transition-colors cursor-pointer"
            >
              <span>Recent Threads</span>
              <ChevronDown
                className={`size-3 transition-transform duration-200 ${
                  sessionsExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>
          </div>

          {sessionsExpanded && (
            <div className="space-y-1">
              {loadingSessions ? (
                <div className="py-1">
                  <SidebarNavSkeleton count={4} />
                </div>
              ) : !activeProject ? (
                <p className="px-2.5 py-2 text-xs text-[#16161366] italic">Select a project</p>
              ) : sessions.length === 0 ? (
                <p className="px-2.5 py-2 text-xs text-[#16161366] italic">No threads yet</p>
              ) : (
                visibleSessions.map((s) => {
                  const isActive = s.sessionId === activeSessionId;
                  return (
                    <div
                      key={s.sessionId}
                      onClick={() => onSelectSession(s.sessionId)}
                      className={`flex items-center gap-2 px-2.5 py-2 text-xs rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? "bg-[#E2DAFF] text-[#161613] font-medium shadow-2xs"
                          : "text-[#161613b3] hover:bg-[#16161308] hover:text-[#161613] border border-transparent"
                      }`}
                    >
                      <MessageSquare
                        className={`size-3.5 shrink-0 ${
                          isActive ? "text-[#7C5CFC]" : "text-[#16161366]"
                        }`}
                      />
                      <span className="truncate leading-relaxed" title={s.title}>
                        {s.title}
                      </span>
                    </div>
                  );
                })
              )}

              {sessions.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllSessions(!showAllSessions)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#16161366] hover:text-[#161613] transition-colors cursor-pointer w-full text-left mt-0.5"
                >
                  <MoreHorizontal className="size-3 shrink-0" />
                  <span>{showAllSessions ? "Show less" : `+${sessions.length - 8} more`}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* USER ACCOUNT FOOTER */}
      <div className="p-3 border-t border-[#16161310] bg-[#F8F7F3]">
        <SignedIn>
          <div className="flex items-center gap-2.5 min-w-0 px-1 py-0.5">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "size-7 rounded-full border border-[#16161314]",
                },
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#161613] truncate leading-tight">
                {user?.fullName || user?.firstName || "Account"}
              </span>
              {user?.primaryEmailAddress?.emailAddress && (
                <span className="text-[11px] text-[#16161366] truncate leading-tight">
                  {user.primaryEmailAddress.emailAddress}
                </span>
              )}
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full py-2 text-xs font-semibold rounded-full bg-[#161613] hover:bg-[#282824] text-white transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </aside>
  );
};

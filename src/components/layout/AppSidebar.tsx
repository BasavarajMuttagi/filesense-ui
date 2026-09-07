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
  Bell,
  UserPlus,
  MoreHorizontal,
  Layers,
  MessageSquare,
} from "lucide-react";

interface AppSidebarProps {
  projects: Project[];
  activeProject: Project | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
  collapsed: boolean;
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

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 5);
  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, 8);

  if (collapsed) {
    return (
      <aside className="w-14 h-screen bg-zinc-50 border-r border-zinc-200 flex flex-col items-center py-3 shrink-0 z-30 font-sans select-none">
        {/* Brand Icon */}
        <div className="size-8 bg-zinc-900 flex items-center justify-center mb-4 shrink-0 rounded-xl shadow-xs">
          <Layers className="size-4 text-white" />
        </div>

        {/* Quick New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          aria-label="New chat session"
          className="size-8 flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors shadow-2xs mb-4 cursor-pointer"
        >
          <Plus className="size-4" />
        </button>

        {/* Projects Icons */}
        <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto px-1.5 scrollbar-none">
          {projects.map((p) => {
            const isActive = p.id === activeProject?.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProject(p.id)}
                aria-label={p.title}
                className={`size-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-2xs"
                    : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
                }`}
              >
                {p.title.charAt(0).toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Expand Trigger Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="mt-auto size-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 transition-colors cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-zinc-50/80 border-r border-zinc-200 flex flex-col shrink-0 z-30 font-sans select-none">
      {/* Top Header Section */}
      <div className="p-3 flex items-center justify-between border-b border-zinc-200/80">
        {/* + New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-xl shadow-2xs transition-all cursor-pointer mr-2"
        >
          <Plus className="size-3.5 text-zinc-600" />
          <span>New Chat</span>
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {/* PROJECTS SECTION */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5 text-zinc-500">
            <button
              type="button"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              <span>Projects</span>
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ${
                  projectsExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={onOpenNewProjectModal}
              aria-label="Create new project"
              className="size-5 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {projectsExpanded && (
            <div className="space-y-0.5">
              {projects.length === 0 ? (
                <p className="px-2 py-2 text-xs text-zinc-400 italic">No projects</p>
              ) : (
                visibleProjects.map((p) => {
                  const isActive = p.id === activeProject?.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? "bg-white text-zinc-950 font-semibold shadow-2xs border border-zinc-200/80"
                          : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Folder className={`size-3.5 shrink-0 ${isActive ? "text-zinc-900" : "text-zinc-400"}`} />
                        <span className="truncate max-w-[145px]">{p.title}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete project "${p.title}" and all its documents?`)) {
                            onDeleteProject(p.id);
                          }
                        }}
                        aria-label="Delete project"
                        className="opacity-0 group-hover:opacity-100 size-5 flex items-center justify-center rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  );
                })
              )}

              {/* Show More / Show Less for Projects */}
              {projects.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                  className="flex items-center gap-2 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer w-full text-left mt-0.5"
                >
                  <MoreHorizontal className="size-3.5 shrink-0" />
                  <span>{showAllProjects ? "Show less" : "Show more"}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* RECENT CHATS SECTION */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5 text-zinc-500">
            <button
              type="button"
              onClick={() => setSessionsExpanded(!sessionsExpanded)}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              <span>Recent Chats</span>
              <ChevronDown
                className={`size-3.5 transition-transform duration-200 ${
                  sessionsExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={onNewChat}
              aria-label="New chat"
              className="size-5 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {sessionsExpanded && (
            <div className="space-y-0.5">
              {!activeProject ? (
                <p className="px-2 py-2 text-xs text-zinc-400 italic">Select a project</p>
              ) : sessions.length === 0 ? (
                <p className="px-2 py-2 text-xs text-zinc-400 italic">No chat sessions</p>
              ) : (
                visibleSessions.map((s) => {
                  const isActive = s.sessionId === activeSessionId;
                  return (
                    <div
                      key={s.sessionId}
                      onClick={() => onSelectSession(s.sessionId)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? "bg-white text-zinc-950 font-semibold shadow-2xs border border-zinc-200/80"
                          : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 border border-transparent"
                      }`}
                    >
                      <MessageSquare className={`size-3 shrink-0 ${isActive ? "text-zinc-900" : "text-zinc-400"}`} />
                      <span className="truncate leading-relaxed" title={s.title}>
                        {s.title}
                      </span>
                    </div>
                  );
                })
              )}

              {/* Show More / Show Less for Sessions */}
              {sessions.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllSessions(!showAllSessions)}
                  className="flex items-center gap-2 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer w-full text-left mt-0.5"
                >
                  <MoreHorizontal className="size-3.5 shrink-0" />
                  <span>{showAllSessions ? "Show less" : "Show more"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* USER ACCOUNT FOOTER */}
      <div className="p-3 border-t border-zinc-200/80 bg-white">
        <SignedIn>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-7 rounded-full border border-zinc-200",
                    },
                  }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-zinc-900 truncate">
                    {user?.fullName || user?.firstName || "Account"}
                  </span>
                  <span className="text-[10px] text-zinc-400">Pro Workspace</span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Notifications"
                className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <Bell className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 pt-1 transition-colors cursor-pointer"
            >
              <UserPlus className="size-3.5" />
              <span>Add team members</span>
            </button>
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full py-2 text-xs font-medium rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer shadow-2xs"
            >
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </aside>
  );
};

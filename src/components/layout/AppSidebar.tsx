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

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 6);
  const visibleSessions = showAllSessions ? sessions : sessions.slice(0, 8);

  if (collapsed) {
    return (
      <aside className="w-14 h-screen bg-white border-r border-slate-200 flex flex-col items-center py-3 shrink-0 z-30 font-sans select-none">
        {/* Brand Mark */}
        <div className="size-9 bg-slate-900 rounded-lg flex items-center justify-center mb-4 shrink-0 shadow-2xs">
          <Layers className="size-4 text-[#0052FF]" />
        </div>

        {/* Quick New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          aria-label="New chat session"
          title="New Chat"
          className="size-8 flex items-center justify-center rounded-lg bg-blue-50 text-[#0052FF] hover:bg-blue-100 transition-colors border border-blue-200/60 mb-4 cursor-pointer"
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
                title={p.title}
                className={`size-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0052FF] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {p.title.charAt(0).toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Expand Trigger */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="mt-auto size-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-[#F8FAFC] border-r border-slate-200 flex flex-col shrink-0 z-30 font-sans select-none">
      {/* Top Header / Brand Section */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center text-[#0052FF] shrink-0 shadow-2xs">
            <Layers className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-extrabold tracking-tight text-slate-900 truncate">
              FileSense
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
              Intelligence // 01
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="size-7 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* New Chat Primary Action */}
      <div className="p-3 pb-0">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-[#0052FF] hover:bg-[#0045D8] text-white rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>New Query Thread</span>
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* PROJECTS / WORKSPACES SECTION */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <button
              type="button"
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
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
              className="size-5 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {projectsExpanded && (
            <div className="space-y-1">
              {projects.length === 0 ? (
                <div className="px-2 py-3 text-center border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-600">No projects yet</p>
                  <button
                    type="button"
                    onClick={onOpenNewProjectModal}
                    className="mt-1.5 text-[11px] font-semibold text-[#0052FF] hover:underline"
                  >
                    + Create Project
                  </button>
                </div>
              ) : (
                visibleProjects.map((p) => {
                  const isActive = p.id === activeProject?.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProject(p.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-all ${
                        isActive
                          ? "bg-white text-slate-950 font-semibold shadow-2xs border border-slate-200"
                          : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Folder
                          className={`size-3.5 shrink-0 ${
                            isActive ? "text-[#0052FF]" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate max-w-[130px]">{p.title}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {typeof p.documentCount === "number" && p.documentCount > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 group-hover:bg-slate-200">
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
                          className="opacity-0 group-hover:opacity-100 size-5 flex items-center justify-center rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer ml-1"
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
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer w-full text-left mt-0.5"
                >
                  <MoreHorizontal className="size-3.5 shrink-0" />
                  <span>{showAllProjects ? "Show less" : `+${projects.length - 6} more`}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* CHAT SESSIONS / THREADS SECTION */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <button
              type="button"
              onClick={() => setSessionsExpanded(!sessionsExpanded)}
              className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span>Recent Threads</span>
              <ChevronDown
                className={`size-3 transition-transform duration-200 ${
                  sessionsExpanded ? "" : "-rotate-90"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={onNewChat}
              aria-label="New chat"
              title="New thread"
              className="size-5 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {sessionsExpanded && (
            <div className="space-y-0.5">
              {!activeProject ? (
                <p className="px-2 py-2 text-xs text-slate-600 italic">Select a project</p>
              ) : sessions.length === 0 ? (
                <p className="px-2 py-2 text-xs text-slate-600 italic">No query sessions</p>
              ) : (
                visibleSessions.map((s) => {
                  const isActive = s.sessionId === activeSessionId;
                  return (
                    <div
                      key={s.sessionId}
                      onClick={() => onSelectSession(s.sessionId)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-all ${
                        isActive
                          ? "bg-white text-slate-950 font-semibold shadow-2xs border border-slate-200"
                          : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent"
                      }`}
                    >
                      <MessageSquare
                        className={`size-3 shrink-0 ${
                          isActive ? "text-[#0052FF]" : "text-slate-400"
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
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer w-full text-left mt-0.5"
                >
                  <MoreHorizontal className="size-3.5 shrink-0" />
                  <span>{showAllSessions ? "Show less" : `+${sessions.length - 8} more`}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* USER ACCOUNT FOOTER */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <SignedIn>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "size-7 rounded-lg border border-slate-200",
                    },
                  }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {user?.fullName || user?.firstName || "Operator"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">Enterprise Node</span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Notifications"
                className="size-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <Bell className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 pt-1 transition-colors cursor-pointer"
            >
              <UserPlus className="size-3.5" />
              <span>Invite collaborators</span>
            </button>
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-2xs"
            >
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </aside>
  );
};

import React from "react";
import type { Project, ChatSession } from "../../types";
import { PanelRight, Menu, Folder, ChevronRight, MessageSquare } from "lucide-react";

interface AppHeaderProps {
  projects: Project[];
  activeProject: Project | null;
  activeSession: ChatSession | null;
  documentCount?: number;
  artifactsPanelOpen: boolean;
  onToggleArtifactsPanel: () => void;
  onToggleSidebar: () => void;
  onSelectProject?: (projectId: string) => void;
  onOpenNewProjectModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeProject,
  activeSession,
  artifactsPanelOpen,
  onToggleArtifactsPanel,
  onToggleSidebar,
}) => {
  return (
    <header className="h-12 w-full bg-[#FAF9F6]/40 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 font-sans select-none transition-colors">
      {/* Left: Mobile Menu Toggle + Clean Breadcrumb Navigation */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="lg:hidden shrink-0 size-8 flex items-center justify-center rounded-full text-[#16161399] hover:bg-[#1616130a] hover:text-[#161613] transition-colors cursor-pointer"
        >
          <Menu className="size-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0 text-xs">
          {!activeProject ? (
            <span className="font-medium text-[#16161380] truncate">
              No project selected
            </span>
          ) : (
            <>
              {/* Project Crumb */}
              <div className="flex items-center gap-1.5 text-[#16161399] shrink-0 font-medium">
                <Folder className="size-3.5 text-[#7C5CFC]" />
                <span
                  className="truncate max-w-[120px] sm:max-w-[180px]"
                  title={activeProject.title}
                >
                  {activeProject.title}
                </span>
              </div>

              {/* Separator */}
              <ChevronRight className="size-3 text-[#16161333] shrink-0" />

              {/* Active Thread Crumb */}
              <div className="flex items-center gap-1.5 min-w-0 text-[#161613] font-serif font-semibold text-sm">
                {activeSession ? (
                  <>
                    <MessageSquare className="size-3.5 text-[#7C5CFC] shrink-0" />
                    <span
                      className="truncate max-w-[180px] sm:max-w-[360px]"
                      title={activeSession.title}
                    >
                      {activeSession.title}
                    </span>
                  </>
                ) : (
                  <span className="italic text-[#161613b3]">New thread</span>
                )}
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Right: Files Side Panel Toggle with Tiimo pill button styling */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleArtifactsPanel}
          title={artifactsPanelOpen ? "Close files panel" : "Open files panel"}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
            artifactsPanelOpen
              ? "bg-[#161613] text-white shadow-xs"
              : "bg-white/80 hover:bg-white text-[#161613] border border-[#16161314] hover:border-[#16161328] shadow-2xs"
          }`}
        >
          <PanelRight className="size-3.5" />
          <span>Files</span>
        </button>
      </div>
    </header>
  );
};

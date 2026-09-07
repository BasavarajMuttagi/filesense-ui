import React from "react";
import type { Project, ChatSession } from "../../types";
import { PanelRight, Menu } from "lucide-react";

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
  activeSession,
  artifactsPanelOpen,
  onToggleArtifactsPanel,
  onToggleSidebar,
}) => {
  return (
    <header className="h-11 w-full bg-white border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-4 font-sans select-none">
      {/* Left: Mobile Menu Toggle + Linear-style Clean Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="lg:hidden shrink-0 size-7 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="size-4" />
        </button>

        <h1 className="text-xs font-semibold text-slate-900 truncate max-w-[280px] sm:max-w-[480px]">
          {activeSession ? activeSession.title : "New thread"}
        </h1>
      </div>

      {/* Right: Files Side Panel Toggle without count or profile */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleArtifactsPanel}
          title={artifactsPanelOpen ? "Close files panel" : "Open files panel"}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all cursor-pointer ${
            artifactsPanelOpen
              ? "bg-slate-100 text-slate-900 border-slate-300/80 shadow-2xs font-semibold"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <PanelRight className="size-3.5" />
          <span>Files</span>
        </button>
      </div>
    </header>
  );
};

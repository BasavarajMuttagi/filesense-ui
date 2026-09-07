import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import type { Project, ChatSession } from "../../types";
import {
  Folder,
  PanelRight,
  Menu,
} from "lucide-react";

interface AppHeaderProps {
  projects: Project[];
  activeProject: Project | null;
  activeSession: ChatSession | null;
  documentCount: number;
  artifactsPanelOpen: boolean;
  onToggleArtifactsPanel: () => void;
  onToggleSidebar: () => void;
  onSelectProject?: (projectId: string) => void;
  onOpenNewProjectModal?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeProject,
  activeSession,
  documentCount,
  artifactsPanelOpen,
  onToggleArtifactsPanel,
  onToggleSidebar,
}) => {
  return (
    <header className="h-13 w-full bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 font-sans select-none">
      {/* Left: Mobile Menu Toggle + Swiss Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="lg:hidden shrink-0 size-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Menu className="size-4" />
        </button>

        <div className="flex items-center gap-2 text-xs min-w-0">
          {/* Active Project Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-900 shrink-0 border border-slate-200/60">
            <Folder className="size-3.5 text-[#0052FF]" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {activeProject ? activeProject.title : "Select Project"}
            </span>
          </div>

          <span className="text-slate-300 font-mono text-[11px] shrink-0">//</span>

          {/* Active Chat Title */}
          <span className="text-xs text-slate-500 truncate max-w-[140px] sm:max-w-[260px] font-medium">
            {activeSession ? activeSession.title : "New Query Thread"}
          </span>
        </div>
      </div>

      {/* Right: Artifacts Side Panel Toggle + Auth */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleArtifactsPanel}
          title="Toggle Documents & Artifacts Panel"
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
            artifactsPanelOpen
              ? "bg-blue-50 text-[#0052FF] border-blue-200 shadow-2xs font-semibold"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <PanelRight className="size-3.5" />
          <span className="hidden sm:inline">Artifacts</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              artifactsPanelOpen
                ? "bg-[#0052FF] text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {documentCount}
          </span>
        </button>

        {/* Auth Profile */}
        <div className="pl-2 border-l border-slate-200 flex items-center">
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "size-7 rounded-lg border border-slate-200",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-2xs"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

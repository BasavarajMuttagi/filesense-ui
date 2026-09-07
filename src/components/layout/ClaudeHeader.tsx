import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import type { Project, ChatSession } from "../../types";
import {
  Folder,
  PanelRight,
  Menu,
  ChevronRight,
} from "lucide-react";

interface ClaudeHeaderProps {
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

export const ClaudeHeader: React.FC<ClaudeHeaderProps> = ({
  activeProject,
  activeSession,
  documentCount,
  artifactsPanelOpen,
  onToggleArtifactsPanel,
  onToggleSidebar,
}) => {
  return (
    <header className="h-13 w-full bg-white border-b border-zinc-200 sticky top-0 z-20 flex items-center justify-between px-4 font-sans select-none">
      {/* Left: Mobile Menu Toggle + Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="lg:hidden shrink-0 size-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <Menu className="size-4" />
        </button>

        <div className="flex items-center gap-2 text-xs min-w-0">
          {/* Active Project Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-xs font-medium text-zinc-900 shrink-0">
            <Folder className="size-3.5 text-zinc-500" />
            <span className="truncate max-w-[150px] sm:max-w-[220px]">
              {activeProject ? activeProject.title : "Select Project"}
            </span>
          </div>

          <ChevronRight className="size-3.5 text-zinc-400 shrink-0" />

          {/* Active Chat Title */}
          <span className="text-xs text-zinc-500 truncate max-w-[150px] sm:max-w-[280px]">
            {activeSession ? activeSession.title : "New Chat"}
          </span>
        </div>
      </div>

      {/* Right: Artifacts Side Panel Toggle + Auth */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleArtifactsPanel}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
            artifactsPanelOpen
              ? "bg-zinc-100 text-zinc-900 border-zinc-300 shadow-2xs"
              : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          <PanelRight className="size-3.5" />
          <span>Artifacts</span>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-700 font-medium">
            {documentCount}
          </span>
        </button>

        {/* Auth Profile */}
        <div className="pl-2 border-l border-zinc-200 flex items-center">
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "size-7 rounded-full border border-zinc-200",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer shadow-2xs"
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

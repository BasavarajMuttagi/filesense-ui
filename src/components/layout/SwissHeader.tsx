import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { SwissButton } from "../common/SwissButton";
import { ProjectSelector } from "../chat/ProjectSelector";
import type { Project, DocumentItem } from "../../types";

interface SwissHeaderProps {
  projects: Project[];
  activeProject: Project | null;
  documents: DocumentItem[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
}

export const SwissHeader: React.FC<SwissHeaderProps> = ({
  projects,
  activeProject,
  documents,
  onSelectProject,
  onOpenNewProjectModal,
  onDeleteProject,
  onDeleteDocument,
}) => {
  return (
    <header className="w-full bg-white/90 backdrop-blur-xs border-b border-slate-200 sticky top-0 z-40 select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#0F172A] flex items-center justify-center relative shrink-0 rounded-xs">
              <div className="w-3.5 h-0.5 bg-[#E11D48]" />
              <div className="w-0.5 h-3.5 bg-[#E11D48] absolute" />
              <div className="w-1 h-1 bg-white absolute" />
            </div>

            <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
              FileSense
            </span>
          </div>
        </div>

        {/* Center/Right: Project/Case Selector & Auth */}
        <div className="flex items-center gap-3">
          <ProjectSelector
            projects={projects}
            activeProject={activeProject}
            documents={documents}
            onSelectProject={onSelectProject}
            onOpenNewProjectModal={onOpenNewProjectModal}
            onDeleteProject={onDeleteProject}
            onDeleteDocument={onDeleteDocument}
          />

          {/* Authentication State */}
          <div className="flex items-center pl-2 border-l border-slate-200">
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 rounded-full border border-slate-200",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <SwissButton variant="primary" size="sm">
                  Sign In
                </SwissButton>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

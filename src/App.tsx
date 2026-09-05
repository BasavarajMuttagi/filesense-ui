import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { registerAuthTokenGetter } from "./api/client";
import { getProjects, deleteProject } from "./api/projects";
import { getDocumentsByProject, deleteDocument } from "./api/documents";
import { listQueries } from "./api/queries";
import type { Project, DocumentItem, QueryRecord } from "./types";

import { SwissHeader } from "./components/layout/SwissHeader";
import { DevSettingsModal } from "./components/layout/DevSettingsModal";
import { ProjectList } from "./components/projects/ProjectList";
import { CreateProjectModal } from "./components/projects/CreateProjectModal";
import { DocumentTable } from "./components/documents/DocumentTable";
import { QueryTerminal } from "./components/queries/QueryTerminal";
import { QueryHistory } from "./components/queries/QueryHistory";
import { Folder, FileText, Sparkles } from "lucide-react";

export function App() {
  const { getToken, isLoaded } = useAuth();

  // Core Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [queries, setQueries] = useState<QueryRecord[]>([]);

  // Loading States
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);

  // Modals & Drawers
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Mobile Active Tab: 'projects' | 'documents' | 'query'
  const [mobileTab, setMobileTab] = useState<"projects" | "documents" | "query">("documents");

  // Register token getter for apiClient and Tigris client uploads
  useEffect(() => {
    const tokenGetter = async () => {
      try {
        return await getToken();
      } catch (err) {
        console.warn("Error getting Clerk token:", err);
        return null;
      }
    };
    registerAuthTokenGetter(tokenGetter);
  }, [getToken]);

  // Load documents for selected project
  const fetchDocuments = useCallback(async (projectId: string) => {
    setLoadingDocuments(true);
    try {
      const docs = await getDocumentsByProject(projectId);
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  // Initial Load when Auth is loaded
  useEffect(() => {
    if (!isLoaded) return;
    let active = true;

    const loadInitial = async () => {
      setLoadingProjects(true);
      try {
        const data = await getProjects();
        if (active) {
          setProjects(data);
          setSelectedProjectId((curr) => curr || (data.length > 0 ? data[0].id : null));
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        if (active) setLoadingProjects(false);
      }
    };

    loadInitial();
    return () => {
      active = false;
    };
  }, [isLoaded, refreshCounter]);

  // When selected project changes, load its documents and queries
  useEffect(() => {
    let active = true;
    const loadProjectData = async () => {
      if (!selectedProjectId) {
        if (active) {
          setDocuments([]);
          setQueries([]);
        }
        return;
      }

      setLoadingDocuments(true);
      setLoadingQueries(true);
      try {
        const [docs, qs] = await Promise.all([
          getDocumentsByProject(selectedProjectId),
          listQueries(selectedProjectId),
        ]);
        if (active) {
          setDocuments(docs);
          setQueries(qs);
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      } finally {
        if (active) {
          setLoadingDocuments(false);
          setLoadingQueries(false);
        }
      }
    };

    loadProjectData();
    return () => {
      active = false;
    };
  }, [selectedProjectId]);

  // Auto-polling when documents are in "processing" or "created" state
  useEffect(() => {
    const hasUnfinishedDocs = documents.some(
      (d) => d.status === "processing" || d.status === "created"
    );

    if (!hasUnfinishedDocs || !selectedProjectId) return;

    const interval = setInterval(() => {
      fetchDocuments(selectedProjectId);
    }, 4000); // 4s poll while jobs are running

    return () => clearInterval(interval);
  }, [documents, selectedProjectId, fetchDocuments]);

  // Handlers
  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    setMobileTab("documents");
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProjectId === projectId) {
      const remaining = projects.filter((p) => p.id !== projectId);
      setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    await deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    // update project doc count locally
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProjectId
          ? { ...p, documentCount: Math.max(0, (p.documentCount || 1) - 1) }
          : p
      )
    );
  };

  const handleQueryCompleted = (newRecord: QueryRecord) => {
    setQueries((prev) => [newRecord, ...prev]);
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 font-sans">
      {/* Swiss Header */}
      <SwissHeader
        activeProjectTitle={activeProject?.title}
        onOpenSettings={() => setSettingsOpen(true)}
        refreshTrigger={refreshCounter}
      />

      {/* Mobile Workspace Tab Bar */}
      <div className="lg:hidden border-b border-slate-900 bg-white grid grid-cols-3 text-center text-xs font-mono font-bold select-none">
        <button
          type="button"
          onClick={() => setMobileTab("projects")}
          className={`py-2.5 flex items-center justify-center gap-1.5 border-r border-slate-200 cursor-pointer ${
            mobileTab === "projects" ? "bg-[#0F172A] text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Folder className="w-3.5 h-3.5" /> REPOSITORIES
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("documents")}
          className={`py-2.5 flex items-center justify-center gap-1.5 border-r border-slate-200 cursor-pointer ${
            mobileTab === "documents" ? "bg-[#0F172A] text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> DOCUMENTS
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("query")}
          className={`py-2.5 flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === "query" ? "bg-[#0F172A] text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" /> RAG TERMINAL
        </button>
      </div>

      {/* Main Precision Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-[calc(100vh-3.5rem)]">
        {/* Left Column: Projects Repository List (Col 3) */}
        <div
          className={`lg:col-span-3 h-[750px] lg:h-[calc(100vh-6.5rem)] ${
            mobileTab === "projects" ? "block" : "hidden lg:block"
          }`}
        >
          <ProjectList
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setMobileTab("documents");
            }}
            onOpenCreateModal={() => setCreateProjectOpen(true)}
            onDeleteProject={handleDeleteProject}
            loading={loadingProjects}
          />
        </div>

        {/* Middle Column: Documents Management & Ingestion (Col 5) */}
        <div
          className={`lg:col-span-5 h-[750px] lg:h-[calc(100vh-6.5rem)] ${
            mobileTab === "documents" ? "block" : "hidden lg:block"
          }`}
        >
          <DocumentTable
            project={activeProject}
            documents={documents}
            loading={loadingDocuments}
            onRefresh={() => selectedProjectId && fetchDocuments(selectedProjectId)}
            onDeleteDocument={handleDeleteDocument}
          />
        </div>

        {/* Right Column: RAG Intelligence Terminal (Col 4) */}
        <div
          className={`lg:col-span-4 h-[750px] lg:h-[calc(100vh-6.5rem)] ${
            mobileTab === "query" ? "block" : "hidden lg:block"
          }`}
        >
          <QueryTerminal
            activeProjectId={selectedProjectId}
            activeProjectTitle={activeProject?.title}
            history={queries}
            onOpenHistory={() => setHistoryOpen(true)}
            onQueryCompleted={handleQueryCompleted}
          />
        </div>
      </main>

      {/* Modals */}
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <DevSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSettingsChanged={() => {
          setRefreshCounter((prev) => prev + 1);
        }}
      />

      <QueryHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        queries={queries}
        onSelectQuery={(q) => {
          // Put the selected query in view
          handleQueryCompleted(q);
        }}
        loading={loadingQueries}
      />
    </div>
  );
}

export default App;

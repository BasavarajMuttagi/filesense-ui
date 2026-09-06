import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { registerAuthTokenGetter } from "./api/client";
import { getProjects, deleteProject } from "./api/projects";
import { getDocumentsByProject, deleteDocument } from "./api/documents";
import { listQueries } from "./api/queries";
import type { Project, DocumentItem, QueryRecord } from "./types";

import { SwissHeader } from "./components/layout/SwissHeader";
import { PerplexityChat } from "./components/chat/PerplexityChat";
import { NewProjectModal } from "./components/chat/NewProjectModal";

export function App() {
  const { getToken, isLoaded } = useAuth();

  // Core Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [queries, setQueries] = useState<QueryRecord[]>([]);

  // Modals
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);

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
    try {
      const docs = await getDocumentsByProject(projectId);
      setDocuments(docs);
      // update documentCount locally on active project
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, documentCount: docs.length } : p))
      );
    } catch (err) {
      console.error("Failed to load documents:", err);
      setDocuments([]);
    }
  }, []);

  // Initial Load when Auth is loaded
  useEffect(() => {
    if (!isLoaded) return;
    let active = true;

    const loadInitial = async () => {
      try {
        const data = await getProjects();
        if (active) {
          setProjects(data);
          setSelectedProjectId((curr) => curr || (data.length > 0 ? data[0].id : null));
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    };

    loadInitial();
    return () => {
      active = false;
    };
  }, [isLoaded]);

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
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProjectId
          ? { ...p, documentCount: Math.max(0, (p.documentCount || 1) - 1) }
          : p
      )
    );
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900 font-sans">
      {/* Sleek Minimalist Header */}
      <SwissHeader
        projects={projects}
        activeProject={activeProject}
        documents={documents}
        onSelectProject={(id) => setSelectedProjectId(id)}
        onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
        onDeleteProject={handleDeleteProject}
        onDeleteDocument={handleDeleteDocument}
      />

      {/* Main Perplexity-Style Document Intelligence Chat */}
      <main className="flex-1 flex flex-col">
        <PerplexityChat
          activeProject={activeProject}
          documentCount={documents.length}
          onDocumentUploaded={() => selectedProjectId && fetchDocuments(selectedProjectId)}
          onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
          initialHistory={queries}
        />
      </main>

      {/* Create Case / Project Modal */}
      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}

export default App;

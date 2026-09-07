import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { registerAuthTokenGetter } from "./api/client";
import { getProjects, deleteProject } from "./api/projects";
import { getDocumentsByProject, deleteDocument } from "./api/documents";
import { listQueries, listSessions } from "./api/queries";
import type { Project, DocumentItem, QueryRecord, ChatSession } from "./types";

import { AppSidebar } from "./components/layout/AppSidebar";
import { AppHeader } from "./components/layout/AppHeader";
import { PerplexityChat } from "./components/chat/PerplexityChat";
import { ArtifactsPanel } from "./components/documents/ArtifactsPanel";
import { DocumentInspector } from "./components/documents/DocumentInspector";
import { NewProjectModal } from "./components/chat/NewProjectModal";

export function App() {
  const { getToken, isLoaded } = useAuth();

  // Core Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [queries, setQueries] = useState<QueryRecord[]>([]);

  // UI Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [artifactsPanelOpen, setArtifactsPanelOpen] = useState(true);
  const [inspectingDocument, setInspectingDocument] = useState<DocumentItem | null>(null);

  // Modals
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);

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

  // Load documents for selected project smoothly
  const fetchDocuments = useCallback(async (projectId: string) => {
    try {
      const docs = await getDocumentsByProject(projectId);
      setDocuments(docs);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, documentCount: docs.length } : p))
      );
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  }, []);

  // Fetch chat sessions for selected project
  const fetchSessions = useCallback(async (projectId: string) => {
    try {
      const sess = await listSessions(projectId);
      setSessions(sess);
      return sess;
    } catch (err) {
      console.error("Failed to load sessions:", err);
      return [];
    }
  }, []);

  // Fetch queries for a specific project & session
  const fetchSessionQueries = useCallback(async (projectId: string, sessionId: string | null) => {
    if (!sessionId) {
      setQueries([]);
      return;
    }
    try {
      const res = await listQueries(projectId, { sessionId, limit: 30 });
      setQueries(res.queries);
    } catch (err) {
      console.error("Failed to load session queries:", err);
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
          if (data.length > 0) {
            setSelectedProjectId(data[0].id);
          }
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

  // When selected project changes, load its documents and sessions
  useEffect(() => {
    let active = true;
    const loadProjectData = async () => {
      if (!selectedProjectId) return;
      try {
        const [docs, sess] = await Promise.all([
          getDocumentsByProject(selectedProjectId),
          fetchSessions(selectedProjectId),
        ]);
        if (!active) return;
        setDocuments(docs);

        if (sess.length > 0) {
          const firstSessionId = sess[0].sessionId;
          setActiveSessionId(firstSessionId);
          const qsRes = await listQueries(selectedProjectId, { sessionId: firstSessionId, limit: 30 });
          if (active) setQueries(qsRes.queries);
        } else {
          setActiveSessionId(null);
          setQueries([]);
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      }
    };

    loadProjectData();
    return () => {
      active = false;
    };
  }, [selectedProjectId, fetchSessions]);

  // Handle switching active chat session
  const handleSelectSession = useCallback(async (sessionId: string) => {
    if (!selectedProjectId) return;
    setActiveSessionId(sessionId);
    await fetchSessionQueries(selectedProjectId, sessionId);
  }, [selectedProjectId, fetchSessionQueries]);

  // Auto-polling when documents are in "processing" or "created" state
  useEffect(() => {
    const hasUnfinishedDocs = documents.some(
      (d) => d.status === "processing" || d.status === "created"
    );

    if (!hasUnfinishedDocs || !selectedProjectId) return;

    const interval = setInterval(() => {
      fetchDocuments(selectedProjectId);
    }, 4000);

    return () => clearInterval(interval);
  }, [documents, selectedProjectId, fetchDocuments]);

  // Handlers
  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    setDocuments([]);
    setSessions([]);
    setActiveSessionId(null);
    setQueries([]);
    setChatKey((k) => k + 1);
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

  const handleNewChat = () => {
    setActiveSessionId(null);
    setQueries([]);
    setChatKey((k) => k + 1);
  };

  const handleSessionCreated = (sessionId: string, firstQuestion: string) => {
    setActiveSessionId(sessionId);
    setSessions((prev) => {
      const exists = prev.some((s) => s.sessionId === sessionId);
      if (exists) return prev;
      return [
        {
          sessionId,
          title: firstQuestion,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 1,
        },
        ...prev,
      ];
    });
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;
  const activeSession = sessions.find((s) => s.sessionId === activeSessionId) || null;

  return (
    <div className="h-screen w-screen flex bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* 1. Left Swiss Navigation Sidebar */}
      <AppSidebar
        projects={projects}
        activeProject={activeProject}
        sessions={sessions}
        activeSessionId={activeSessionId}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectProject={(id) => setSelectedProjectId(id)}
        onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
        onDeleteProject={handleDeleteProject}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
      />

      {/* 2. Center Column: Swiss Header & Main Query Stream */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#F8FAFC]">
        {/* Top Header */}
        <AppHeader
          projects={projects}
          activeProject={activeProject}
          activeSession={activeSession}
          documentCount={documents.length}
          artifactsPanelOpen={artifactsPanelOpen}
          onToggleArtifactsPanel={() => setArtifactsPanelOpen(!artifactsPanelOpen)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSelectProject={(id) => setSelectedProjectId(id)}
          onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
        />

        {/* Central Chat Stream */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          <PerplexityChat
            key={`${selectedProjectId || "default"}-${chatKey}`}
            activeProject={activeProject}
            activeSessionId={activeSessionId}
            documentCount={documents.length}
            onDocumentUploaded={() => selectedProjectId && fetchDocuments(selectedProjectId)}
            onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
            onSessionCreated={handleSessionCreated}
            onNewChat={handleNewChat}
            initialHistory={queries}
          />
        </main>
      </div>

      {/* 3. Right Column: Artifacts & Documents Side Panel */}
      <ArtifactsPanel
        activeProject={activeProject}
        documents={documents}
        isOpen={artifactsPanelOpen}
        onClose={() => setArtifactsPanelOpen(false)}
        onDocumentUploaded={() => selectedProjectId && fetchDocuments(selectedProjectId)}
        onDeleteDocument={handleDeleteDocument}
        onInspectDocument={(doc) => setInspectingDocument(doc)}
        onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
      />

      {/* 4. Modals */}
      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <DocumentInspector
        document={inspectingDocument}
        onClose={() => setInspectingDocument(null)}
        onDeleteDocument={handleDeleteDocument}
      />
    </div>
  );
}

export default App;

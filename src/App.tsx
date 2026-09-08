import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { registerAuthTokenGetter } from "./api/client";
import { getProjects, deleteProject } from "./api/projects";
import { getDocumentsByProject, deleteDocument } from "./api/documents";
import { listQueries, listSessions } from "./api/queries";
import type { Project, DocumentItem, QueryRecord, ChatSession } from "./types";

import { AppSidebar } from "./components/layout/AppSidebar";
import { AppHeader } from "./components/layout/AppHeader";
import { ChatView } from "./components/chat/ChatView";
import { ArtifactsPanel } from "./components/documents/ArtifactsPanel";
import { DocumentInspector } from "./components/documents/DocumentInspector";
import { NewProjectModal } from "./components/chat/NewProjectModal";
import { LandingPage } from "./components/landing/LandingPage";
import { Layers } from "lucide-react";

export function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

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

  // Loading States for Skeletons
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingQueries, setLoadingQueries] = useState(false);

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
      // Deduplicate by ID to prevent any duplicate key/card rendering
      const uniqueDocs = Array.from(new Map(docs.map((d) => [d.id, d])).values());
      setDocuments(uniqueDocs);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, documentCount: uniqueDocs.length } : p))
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
    setLoadingQueries(true);
    try {
      const res = await listQueries(projectId, { sessionId, limit: 30 });
      setQueries(res.queries);
    } catch (err) {
      console.error("Failed to load session queries:", err);
    } finally {
      setLoadingQueries(false);
    }
  }, []);

  // Initial Load when Auth is loaded
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;

    const loadInitial = async () => {
      setLoadingProjects(true);
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
      } finally {
        if (active) {
          setLoadingProjects(false);
        }
      }
    };

    loadInitial();
    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn]);

  // When selected project changes, load its documents and sessions
  useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    const loadProjectData = async () => {
      if (!selectedProjectId) {
        setLoadingDocuments(false);
        setLoadingSessions(false);
        setLoadingQueries(false);
        return;
      }
      setLoadingDocuments(true);
      setLoadingSessions(true);
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
          setLoadingQueries(true);
          try {
            const qsRes = await listQueries(selectedProjectId, { sessionId: firstSessionId, limit: 30 });
            if (active) setQueries(qsRes.queries);
          } finally {
            if (active) setLoadingQueries(false);
          }
        } else {
          setActiveSessionId(null);
          setQueries([]);
          setLoadingQueries(false);
        }
      } catch (err) {
        console.error("Failed to load project details:", err);
      } finally {
        if (active) {
          setLoadingDocuments(false);
          setLoadingSessions(false);
        }
      }
    };

    loadProjectData();
    return () => {
      active = false;
    };
  }, [selectedProjectId, fetchSessions, isSignedIn]);

  // Handle switching active chat session
  const handleSelectSession = useCallback(async (sessionId: string) => {
    if (!selectedProjectId || sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    await fetchSessionQueries(selectedProjectId, sessionId);
  }, [selectedProjectId, activeSessionId, fetchSessionQueries]);

  // Auto-polling when documents are in "processing" or "created" state
  useEffect(() => {
    const hasUnfinishedDocs = documents.some(
      (d) => d.status === "processing" || d.status === "created"
    );

    if (!hasUnfinishedDocs || !selectedProjectId) return;

    const interval = setInterval(() => {
      fetchDocuments(selectedProjectId);
    }, 2500);

    return () => clearInterval(interval);
  }, [documents, selectedProjectId, fetchDocuments]);

  // Handle newly uploaded document: open panel and fetch real document state from backend
  const handleDocumentUploaded = useCallback(() => {
    if (!selectedProjectId) return;

    // Ensure the artifacts panel is open so the user sees the file indexing
    setArtifactsPanelOpen(true);

    // Trigger immediate and short-interval synchronization with backend
    fetchDocuments(selectedProjectId);
    setTimeout(() => selectedProjectId && fetchDocuments(selectedProjectId), 800);
    setTimeout(() => selectedProjectId && fetchDocuments(selectedProjectId), 2500);
  }, [selectedProjectId, fetchDocuments]);

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
    setLoadingQueries(false);
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
          firstQuestion,
          queryCount: 1,
          messageCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;
  const activeSession = sessions.find((s) => s.sessionId === activeSessionId) || null;

  // 1. Loading screen while Clerk authentication initializes
  if (!isLoaded) {
    return (
      <div className="min-h-screen w-screen bg-[#FAF9F6] flex flex-col items-center justify-center font-sans select-none">
        <div className="size-12 rounded-2xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shadow-xs mb-3 animate-pulse">
          <Layers className="size-6" />
        </div>
        <span className="text-xs font-medium text-[#16161380]">Initializing FileSense...</span>
      </div>
    );
  }

  // 2. Unauthenticated state: Render the Tiimo-inspired Landing Page
  if (!isSignedIn) {
    return <LandingPage />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#FAF9F6] text-[#161613] overflow-hidden font-sans selection:bg-[#E2DAFF] selection:text-[#161613]">
      {/* 1. Left Column: App Sidebar Navigation */}
      <AppSidebar
        projects={projects}
        activeProject={activeProject}
        sessions={sessions}
        activeSessionId={activeSessionId}
        collapsed={sidebarCollapsed}
        loadingProjects={loadingProjects}
        loadingSessions={loadingSessions}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectProject={(id) => setSelectedProjectId(id)}
        onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
        onDeleteProject={handleDeleteProject}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
      />

      {/* 2. Middle Column: Main Header & Central RAG Stream Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
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
          <ChatView
            key={`${selectedProjectId || "default"}-${chatKey}`}
            activeProject={activeProject}
            projects={projects}
            loadingProjects={loadingProjects}
            onSelectProject={(id) => setSelectedProjectId(id)}
            activeSessionId={activeSessionId}
            documentCount={documents.length}
            onDocumentUploaded={handleDocumentUploaded}
            onOpenNewProjectModal={() => setNewProjectModalOpen(true)}
            onSessionCreated={handleSessionCreated}
            onNewChat={handleNewChat}
            initialHistory={queries}
            loadingHistory={loadingQueries}
          />
        </main>
      </div>

      {/* 3. Right Column: Artifacts & Documents Side Panel */}
      <ArtifactsPanel
        activeProject={activeProject}
        documents={documents}
        isOpen={artifactsPanelOpen}
        loading={loadingDocuments}
        onClose={() => setArtifactsPanelOpen(false)}
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

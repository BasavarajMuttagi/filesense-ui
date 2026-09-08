import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import type { Project, QueryRecord, SourceItem } from "../../types";
import { submitQueryStream, listQueries } from "../../api/queries";
import { ChatInput } from "./ChatInput";
import { SourceChips } from "./SourceChips";
import { ChatMarkdown } from "./ChatMarkdown";
import { ResponseSkeleton, ChatThreadSkeleton } from "../common/SwissSkeleton";
import {
  Layers,
  Copy,
  Check,
  AlertCircle,
  Square,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileSearch,
  Cpu,
  BookOpen,
  FolderPlus,
  Folder,
  Plus,
  ArrowRight,
} from "lucide-react";

interface ChatViewProps {
  activeProject: Project | null;
  projects?: Project[];
  loadingProjects?: boolean;
  onSelectProject?: (projectId: string) => void;
  activeSessionId: string | null;
  documentCount?: number;
  onDocumentUploaded: () => void;
  onOpenNewProjectModal: () => void;
  onSessionCreated?: (sessionId: string, firstQuestion: string) => void;
  onNewChat?: () => void;
  initialHistory?: QueryRecord[];
  loadingHistory?: boolean;
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string | null;
  sources?: SourceItem[] | null;
  loading?: boolean;
  streaming?: boolean;
  error?: string | null;
  createdAt: string | number;
}

interface ChatMessageItemProps {
  msg: ChatMessage;
  activeCitationIndex: number | null;
  copiedId: string | null;
  onCitationClick: (citationIdx: number) => void;
  onCloseCitationModal: () => void;
  onCopyAnswer: (text: string, id: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(
  ({
    msg,
    activeCitationIndex,
    copiedId,
    onCitationClick,
    onCloseCitationModal,
    onCopyAnswer,
  }) => {
    return (
      <div id={`msg-${msg.id}`} className="flex flex-col gap-3">
        {/* User Question Bubble */}
        <div className="flex justify-end w-full">
          <div className="max-w-[85%] sm:max-w-[75%] bg-slate-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-sm leading-relaxed shadow-xs font-medium selection:bg-[#0052FF]">
            {msg.question}
          </div>
        </div>

        {/* Grounded Citations Reel */}
        {msg.sources && msg.sources.length > 0 && (
          <SourceChips
            sources={msg.sources}
            selectedSourceIndex={activeCitationIndex}
            onCloseModal={onCloseCitationModal}
          />
        )}

        {/* Assistant Answer Stream */}
        {msg.loading && !msg.answer ? (
          <ResponseSkeleton />
        ) : msg.error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 rounded-xl">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <div className="font-bold mb-0.5">Synthesis Alert</div>
              <div>{msg.error}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-1">
            {/* Markdown Answer Rendering */}
            <div className="relative leading-relaxed">
              <ChatMarkdown
                content={msg.answer || ""}
                isStreaming={msg.streaming}
                onCitationClick={onCitationClick}
              />
              {msg.streaming && (
                <span className="inline-block w-1.5 h-3.5 bg-[#0052FF] animate-pulse ml-1 align-middle rounded-xs" />
              )}
            </div>

            {/* Answer Footer Actions */}
            {msg.answer && !msg.streaming && (
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-xs text-slate-400 font-mono">
                <span className="text-[11px] text-slate-400">
                  Grounded via FileSense Vector Engine
                </span>
                <button
                  type="button"
                  onClick={() => onCopyAnswer(msg.answer || "", msg.id)}
                  className="flex items-center gap-1.5 px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  {copiedId === msg.id ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span className="text-xs">{copiedId === msg.id ? "Copied" : "Copy"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.msg.id === next.msg.id &&
      prev.msg.question === next.msg.question &&
      prev.msg.answer === next.msg.answer &&
      prev.msg.loading === next.msg.loading &&
      prev.msg.streaming === next.msg.streaming &&
      prev.msg.sources === next.msg.sources &&
      prev.msg.error === next.msg.error &&
      prev.activeCitationIndex === next.activeCitationIndex &&
      prev.copiedId === next.copiedId
    );
  }
);

export const ChatView: React.FC<ChatViewProps> = ({
  activeProject,
  projects = [],
  loadingProjects = false,
  onSelectProject,
  activeSessionId,
  documentCount = 0,
  onDocumentUploaded,
  onOpenNewProjectModal,
  onSessionCreated,
  initialHistory = [],
  loadingHistory = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialHistory && initialHistory.length > 0
      ? initialHistory.map((q) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
          sources: q.sources,
          createdAt: q.createdAt,
        }))
      : []
  );
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<{ msgId: string; index: number } | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(() => (initialHistory ? initialHistory.length >= 20 : false));
  const [loadingEarlier, setLoadingEarlier] = useState<boolean>(false);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentStreamingSessionIdRef = useRef<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFollowingStreamRef = useRef<boolean>(true);
  const pendingScrollToMsgIdRef = useRef<string | null>(null);
  const activeStreamingIdRef = useRef<string | null>(null);
  const tokenBufferRef = useRef<string>("");
  const rafIdRef = useRef<number | null>(null);

  const [prevHistory, setPrevHistory] = useState(initialHistory);

  // Sync if initialHistory updates from parent during render
  if (prevHistory !== initialHistory) {
    setPrevHistory(initialHistory);
    setMessages(
      initialHistory && initialHistory.length > 0
        ? initialHistory.map((q) => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            sources: q.sources,
            createdAt: q.createdAt,
          }))
        : []
    );
    setHasMore(initialHistory ? initialHistory.length >= 20 : false);
  }

  // Scroll directly to bottom
  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    isFollowingStreamRef.current = true;
    setShowScrollBottom(false);
  }, []);

  // Track user scroll position: disengage following if user scrolls up
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceToBottom <= 40;
    if (atBottom) {
      isFollowingStreamRef.current = true;
      setShowScrollBottom(false);
    } else if (distanceToBottom > 160 && loading) {
      setShowScrollBottom(true);
    }
  };

  // Immediate detection if user scrolls up with wheel or trackpad
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < -2) {
      isFollowingStreamRef.current = false;
      if (loading) setShowScrollBottom(true);
    }
  };

  // Synchronous DOM scroll management: focus new question, then slowly follow SSE stream
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 1. If a new question was submitted, smoothly focus that question at top of viewport
    if (pendingScrollToMsgIdRef.current) {
      const targetId = pendingScrollToMsgIdRef.current;
      pendingScrollToMsgIdRef.current = null;
      requestAnimationFrame(() => {
        const el = document.getElementById(`msg-${targetId}`);
        if (el && container) {
          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - 20;
          container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
        }
      });
      return;
    }

    // 2. If following active stream, gently advance scroll only when content exceeds visible viewport
    if (isFollowingStreamRef.current && activeStreamingIdRef.current) {
      const overflow = container.scrollHeight - (container.scrollTop + container.clientHeight);
      if (overflow > 0) {
        container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    }
  }, [messages]);

  // Reset scroll to bottom only on project or session switch
  useEffect(() => {
    // Only abort if user navigated away to a genuinely different session during streaming
    if (
      abortControllerRef.current &&
      currentStreamingSessionIdRef.current &&
      activeSessionId !== currentStreamingSessionIdRef.current
    ) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      currentStreamingSessionIdRef.current = null;
    }
    isFollowingStreamRef.current = true;
    scrollToBottom();
  }, [activeSessionId, activeProject?.id, scrollToBottom]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Lazy Load Earlier Messages
  const handleLoadEarlier = useCallback(async () => {
    if (!activeProject || loadingEarlier || !hasMore || messages.length === 0 || loading) return;
    setLoadingEarlier(true);
    const el = scrollContainerRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;
    const prevScrollTop = el ? el.scrollTop : 0;

    try {
      const oldestCreatedAt = messages[0].createdAt;
      const res = await listQueries(activeProject.id, {
        sessionId: activeSessionId,
        limit: 15,
        before: oldestCreatedAt,
      });

      if (res.queries.length > 0) {
        const earlierMessages: ChatMessage[] = res.queries.map((q) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
          sources: q.sources,
          createdAt: q.createdAt,
        }));
        setMessages((prev) => [...earlierMessages, ...prev]);
        setHasMore(res.hasMore);

        // Preserve scroll position so it doesn't jump
        requestAnimationFrame(() => {
          if (el) {
            const heightDiff = el.scrollHeight - prevScrollHeight;
            el.scrollTop = prevScrollTop + heightDiff;
          }
        });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load earlier chats:", err);
    } finally {
      setLoadingEarlier(false);
    }
  }, [activeProject, loadingEarlier, hasMore, messages, loading, activeSessionId]);

  const handleStopGeneration = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    tokenBufferRef.current = "";
    activeStreamingIdRef.current = null;
    isFollowingStreamRef.current = false;
    currentStreamingSessionIdRef.current = null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setMessages((prev) =>
        prev.map((msg) => (msg.streaming ? { ...msg, streaming: false, loading: false } : msg))
      );
    }
  };

  const handleCopyAnswer = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    if (!activeProject) {
      onOpenNewProjectModal();
      return;
    }

    const currentSessionId = activeSessionId || `session-${Date.now()}`;
    if (!activeSessionId && onSessionCreated) {
      onSessionCreated(currentSessionId, questionText);
    }

    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      question: questionText,
      answer: "",
      sources: null,
      loading: true,
      streaming: true,
      createdAt: new Date().toISOString(),
    };

    // Multi-turn history from preceding messages
    const history = messages
      .filter((m) => m.question && m.answer && !m.error)
      .slice(-6)
      .flatMap((m) => [
        { role: "user" as const, content: m.question },
        { role: "assistant" as const, content: m.answer || "" },
      ]);

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);
    tokenBufferRef.current = "";
    activeStreamingIdRef.current = tempId;
    pendingScrollToMsgIdRef.current = tempId;
    isFollowingStreamRef.current = true;
    setShowScrollBottom(false);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    currentStreamingSessionIdRef.current = currentSessionId;

    try {
      await submitQueryStream({
        question: questionText,
        projectId: activeProject.id,
        sessionId: currentSessionId,
        history,
        signal: controller.signal,
        onSources: (incomingSources) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    ...msg,
                    sources: incomingSources,
                  }
                : msg
            )
          );
        },
        // Throttled token streaming via requestAnimationFrame for silky 60fps rendering
        onToken: (chunk) => {
          tokenBufferRef.current += chunk;

          if (rafIdRef.current === null) {
            rafIdRef.current = requestAnimationFrame(() => {
              rafIdRef.current = null;
              const pendingText = tokenBufferRef.current;
              tokenBufferRef.current = "";

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempId
                    ? {
                        ...msg,
                        answer: (msg.answer || "") + pendingText,
                        loading: false,
                        streaming: true,
                      }
                    : msg
                )
              );
            });
          }
        },
        onDone: () => {
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
          const remainingText = tokenBufferRef.current;
          tokenBufferRef.current = "";
          activeStreamingIdRef.current = null;
          isFollowingStreamRef.current = false;

          setLoading(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    ...msg,
                    answer: (msg.answer || "") + remainingText,
                    loading: false,
                    streaming: false,
                  }
                : msg
            )
          );
        },
      });
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      tokenBufferRef.current = "";
      activeStreamingIdRef.current = null;
      isFollowingStreamRef.current = false;
      setLoading(false);
      const errMessage = err instanceof Error ? err.message : "Failed to generate answer";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                loading: false,
                streaming: false,
                error: errMessage,
              }
            : msg
        )
      );
    } finally {
      if (currentStreamingSessionIdRef.current === currentSessionId) {
        currentStreamingSessionIdRef.current = null;
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const starterSuggestions = [
    {
      icon: <FileSearch className="size-3.5 text-[#0052FF]" />,
      label: "Summarize key architecture & findings",
      prompt: "Provide a structured executive summary of the uploaded documents, highlighting key findings, architecture, and core conclusions.",
    },
    {
      icon: <Cpu className="size-3.5 text-[#0052FF]" />,
      label: "Extract technical specifications & data",
      prompt: "Extract all technical parameters, data specifications, benchmarks, and API contracts defined in these files.",
    },
    {
      icon: <BookOpen className="size-3.5 text-[#0052FF]" />,
      label: "Identify risks and constraints",
      prompt: "Analyze the documents for potential technical risks, compliance constraints, dependencies, and prerequisites.",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col font-sans relative bg-[#F8FAFC]">
      {!activeProject ? (
        loadingProjects ? (
          <div className="flex-1 flex items-center justify-center p-8 font-sans">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="size-6 animate-spin text-[#0052FF]" />
              <span className="text-xs font-medium">Loading workspace...</span>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto font-sans animate-in fade-in duration-300">
            <div className="size-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center mb-4">
              <FolderPlus className="size-7 text-[#0052FF]" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1.5">
              No projects yet
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-sm">
              Create your first project to organize documents and query them with neural search.
            </p>
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto font-sans animate-in fade-in duration-300">
            <div className="size-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center mb-4">
              <Folder className="size-7 text-[#0052FF]" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1.5">
              No project selected
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 max-w-sm">
              Select a project from the sidebar to view documents and start a conversation, or create a new one.
            </p>
            <div className="flex items-center gap-2.5">
              {projects.length > 0 && onSelectProject && (
                <button
                  type="button"
                  onClick={() => onSelectProject(projects[0].id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <span>Open &ldquo;{projects[0].title}&rdquo;</span>
                  <ArrowRight className="size-3" />
                </button>
              )}
              <button
                type="button"
                onClick={onOpenNewProjectModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>New Project</span>
              </button>
            </div>
          </div>
        )
      ) : loadingHistory ? (
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <ChatThreadSkeleton />
          </div>

          {/* Sticky Bottom Chat Input Bar */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/95 to-transparent pt-3 pb-5 px-4 z-20">
            <div className="max-w-3xl mx-auto flex flex-col gap-2">
              <ChatInput
                activeProject={activeProject}
                onSendMessage={handleSendMessage}
                onDocumentUploaded={onDocumentUploaded}
                onOpenNewProjectModal={onOpenNewProjectModal}
                loading={true}
                placeholder="Loading thread..."
              />
            </div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4 py-8 text-center max-w-3xl mx-auto w-full">
          {/* Brand Icon & Welcome Title */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-md relative">
              <Layers className="size-6 text-[#0052FF]" />
              <div className="size-2 rounded-full bg-[#0052FF] absolute -top-0.5 -right-0.5 animate-ping" />
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-[#0052FF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                  Neural RAG Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
                {activeProject ? activeProject.title : "Document Intelligence"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
                {documentCount === 0
                  ? "Ask anything about your project, or click Attach below to index documents."
                  : "Ask anything across your indexed documents with verified page citations, vector telemetry, and architecture diagram generation."}
              </p>
            </div>
          </div>

          {/* Central Input Box */}
          <div className="w-full max-w-2xl mb-6">
            <ChatInput
              activeProject={activeProject}
              onSendMessage={handleSendMessage}
              onDocumentUploaded={onDocumentUploaded}
              onOpenNewProjectModal={onOpenNewProjectModal}
              loading={loading}
              placeholder={
                activeProject
                  ? documentCount === 0
                    ? "Ask a question or click Attach to upload files..."
                    : `Ask anything about ${activeProject.title}...`
                  : "Ask anything about your documents..."
              }
            />
          </div>

          {/* Quick Start Prompt Starters - only when documents exist */}
          {documentCount > 0 && (
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {starterSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt)}
                  className="flex items-start gap-2 p-3 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 rounded-xl text-left transition-all shadow-2xs cursor-pointer group"
                >
                  <div className="size-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 leading-snug">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 2. THREAD VIEW: Smooth, high-performance scrollable conversation */
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Dedicated Single Scroll Container with overflow-anchor: none to prevent browser jitter */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onWheel={handleWheel}
            style={{ overflowAnchor: "none" }}
            className="flex-1 overflow-y-auto px-4 sm:px-8 py-6"
          >
            <div className="max-w-3xl mx-auto flex flex-col gap-7 pb-4">
              {/* Load Earlier Messages Button (Manual only, no auto-triggering) */}
              {hasMore && !loading && (
                <div className="flex justify-center py-2">
                  <button
                    type="button"
                    onClick={handleLoadEarlier}
                    disabled={loadingEarlier}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingEarlier ? (
                      <Loader2 className="size-3.5 animate-spin text-[#0052FF]" />
                    ) : (
                      <ArrowUp className="size-3.5 text-[#0052FF]" />
                    )}
                    <span>Load Earlier Messages</span>
                  </button>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  msg={msg}
                  activeCitationIndex={
                    activeCitation?.msgId === msg.id ? activeCitation.index : null
                  }
                  copiedId={copiedId}
                  onCitationClick={(citationIdx) => {
                    setActiveCitation({ msgId: msg.id, index: citationIdx });
                  }}
                  onCloseCitationModal={() => setActiveCitation(null)}
                  onCopyAnswer={handleCopyAnswer}
                />
              ))}

              {/* Bottom anchor for rock-solid scroll pinning */}
              <div className="h-2 w-full shrink-0" />
            </div>
          </div>

          {/* Floating "Scroll to latest" button if user scrolled up while stream is active */}
          {showScrollBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-28 right-6 sm:right-10 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer animate-in fade-in zoom-in-95"
            >
              <ArrowDown className="size-3.5 text-[#0052FF]" />
              <span>Scroll to latest</span>
            </button>
          )}

          {/* Sticky Bottom Chat Input Bar */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/95 to-transparent pt-3 pb-5 px-4 z-20">
            <div className="max-w-3xl mx-auto flex flex-col gap-2">
              {loading && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Square className="size-3 fill-current" />
                    <span>Stop Generation</span>
                  </button>
                </div>
              )}
              <ChatInput
                activeProject={activeProject}
                onSendMessage={handleSendMessage}
                onDocumentUploaded={onDocumentUploaded}
                onOpenNewProjectModal={onOpenNewProjectModal}
                loading={loading}
                placeholder="Ask a follow-up question..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

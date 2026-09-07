import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Project, QueryRecord, SourceItem } from "../../types";
import { submitQueryStream, listQueries } from "../../api/queries";
import { ChatInput } from "./ChatInput";
import { SourceChips } from "./SourceChips";
import { PerplexityMarkdown } from "./PerplexityMarkdown";
import {
  Layers,
  Copy,
  Check,
  AlertCircle,
  Square,
  ArrowUp,
  Loader2,
  FileSearch,
  Cpu,
  BookOpen,
} from "lucide-react";

interface PerplexityChatProps {
  activeProject: Project | null;
  activeSessionId: string | null;
  documentCount?: number;
  onDocumentUploaded: () => void;
  onOpenNewProjectModal: () => void;
  onSessionCreated?: (sessionId: string, firstQuestion: string) => void;
  onNewChat?: () => void;
  initialHistory?: QueryRecord[];
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

export const PerplexityChat: React.FC<PerplexityChatProps> = ({
  activeProject,
  activeSessionId,
  onDocumentUploaded,
  onOpenNewProjectModal,
  onSessionCreated,
  initialHistory = [],
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const [prevHistory, setPrevHistory] = useState(initialHistory);

  // Sync if initialHistory updates from parent during render (React recommended pattern)
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

  // Lazy Load Earlier Messages
  const handleLoadEarlier = useCallback(async () => {
    if (!activeProject || loadingEarlier || !hasMore || messages.length === 0) return;
    setLoadingEarlier(true);
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
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load earlier chats:", err);
    } finally {
      setLoadingEarlier(false);
    }
  }, [activeProject, loadingEarlier, hasMore, messages, activeSessionId]);

  // IntersectionObserver for top sentinel
  useEffect(() => {
    if (!hasMore || loadingEarlier) return;
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadEarlier();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingEarlier, handleLoadEarlier]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleStopGeneration = () => {
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

    const controller = new AbortController();
    abortControllerRef.current = controller;

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
        onToken: (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    ...msg,
                    answer: (msg.answer || "") + chunk,
                    loading: false,
                    streaming: true,
                  }
                : msg
            )
          );
        },
        onDone: () => {
          setLoading(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    ...msg,
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
      {/* 1. ZERO STATE: When no questions have been asked yet */}
      {messages.length === 0 ? (
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
                Ask anything across your indexed documents with verified page citations, vector telemetry, and architecture diagram generation.
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
                  ? `Ask anything about ${activeProject.title}...`
                  : "Ask anything about your documents..."
              }
            />
          </div>

          {/* Quick Start Prompt Starters */}
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
        </div>
      ) : (
        /* 2. THREAD VIEW: When conversation has started */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Message Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-4">
              {/* Top Sentinel & Load Earlier Messages */}
              {hasMore && (
                <div ref={topSentinelRef} className="flex justify-center py-2">
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
                <div key={msg.id} className="flex flex-col gap-3">
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
                      selectedSourceIndex={
                        activeCitation?.msgId === msg.id ? activeCitation.index : null
                      }
                      onCloseModal={() => setActiveCitation(null)}
                    />
                  )}

                  {/* Assistant Answer Stream */}
                  {msg.loading && !msg.answer ? (
                    <div className="flex items-center gap-2.5 py-3 text-xs text-slate-500 font-mono">
                      <div className="size-2 rounded-full bg-[#0052FF] animate-ping" />
                      <span>Synthesizing verified excerpts &amp; citations...</span>
                    </div>
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
                        <PerplexityMarkdown
                          content={msg.answer || ""}
                          isStreaming={msg.streaming}
                          onCitationClick={(citationIdx) => {
                            setActiveCitation({ msgId: msg.id, index: citationIdx });
                          }}
                        />
                        {msg.streaming && (
                          <span className="inline-block w-2 h-4 bg-[#0052FF] animate-pulse ml-1 align-middle rounded-xs" />
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
                            onClick={() => handleCopyAnswer(msg.answer || "", msg.id)}
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
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

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

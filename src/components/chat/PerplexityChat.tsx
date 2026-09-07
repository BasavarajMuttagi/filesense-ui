import React, { useState, useEffect, useRef } from "react";
import type { Project, QueryRecord, SourceItem } from "../../types";
import { submitQueryStream, listQueries } from "../../api/queries";
import { ChatInput } from "./ChatInput";
import { SourceChips } from "./SourceChips";
import { PerplexityMarkdown } from "./PerplexityMarkdown";
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Square,
  ArrowUp,
  Loader2,
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<{ msgId: string; index: number } | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingEarlier, setLoadingEarlier] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  // Initialize or restore from query history when history changes
  useEffect(() => {
    if (initialHistory && initialHistory.length > 0) {
      setMessages(
        initialHistory.map((q) => ({
          id: q.id,
          question: q.question,
          answer: q.answer,
          sources: q.sources,
          createdAt: q.createdAt,
        }))
      );
      setHasMore(initialHistory.length >= 20);
    } else {
      setMessages([]);
      setHasMore(false);
    }
  }, [activeProject?.id, activeSessionId, initialHistory]);

  // Lazy Load Earlier Messages
  const handleLoadEarlier = async () => {
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
  };

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
  }, [hasMore, loadingEarlier, messages, activeProject?.id, activeSessionId]);

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

    // Construct multi-turn history from preceding messages
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

  return (
    <div className="w-full h-full flex flex-col font-sans relative">
      {/* 1. ZERO STATE: When no questions have been asked yet */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4 py-8 text-center max-w-3xl mx-auto w-full">
          {/* Brand Icon & Welcome Title */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="size-11 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-xs">
              <Sparkles className="size-5 text-white" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 font-sans">
                {activeProject ? activeProject.title : "Document Intelligence"}
              </h1>
              <p className="text-sm text-zinc-500 max-w-md">
                Search, analyze, and ask anything across your uploaded files with instant citations.
              </p>
            </div>
          </div>

          {/* Central Input Box */}
          <div className="w-full max-w-2xl">
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
        </div>
      ) : (
        /* 2. THREAD VIEW: When questions have been asked */
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
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingEarlier ? (
                      <Loader2 className="size-3.5 animate-spin text-zinc-500" />
                    ) : (
                      <ArrowUp className="size-3.5" />
                    )}
                    <span>Load Earlier Messages</span>
                  </button>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-3">
                  {/* User Message Bubble */}
                  <div className="flex justify-end w-full">
                    <div className="max-w-[85%] sm:max-w-[75%] bg-zinc-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-sm leading-relaxed shadow-2xs font-normal selection:bg-zinc-700">
                      {msg.question}
                    </div>
                  </div>

                  {/* Sources Reel */}
                  {msg.sources && msg.sources.length > 0 && (
                    <SourceChips
                      sources={msg.sources}
                      selectedSourceIndex={
                        activeCitation?.msgId === msg.id ? activeCitation.index : null
                      }
                      onCloseModal={() => setActiveCitation(null)}
                    />
                  )}

                  {/* Assistant Response Stream */}
                  {msg.loading && !msg.answer ? (
                    <div className="flex items-center gap-2.5 py-3 text-xs text-zinc-500 animate-pulse">
                      <Loader2 className="size-4 animate-spin text-zinc-500" />
                      <span>Synthesizing response from verified excerpts...</span>
                    </div>
                  ) : msg.error ? (
                    <div className="p-4 bg-rose-50/70 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 rounded-xl">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-0.5">Query Error</div>
                        <div>{msg.error}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 py-1">
                      {/* Natural Markdown rendering (uncaged, no heavy border box) */}
                      <div className="relative leading-relaxed">
                        <PerplexityMarkdown
                          content={msg.answer || ""}
                          isStreaming={msg.streaming}
                          onCitationClick={(citationIdx) => {
                            setActiveCitation({ msgId: msg.id, index: citationIdx });
                          }}
                        />
                        {msg.streaming && (
                          <span className="inline-block w-2 h-4 bg-zinc-900 animate-pulse ml-1 align-middle" />
                        )}
                      </div>

                      {/* Footer Actions */}
                      {msg.answer && !msg.streaming && (
                        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 text-xs text-zinc-400">
                          <span className="text-[11px] font-sans">
                            Grounded with Mistral AI & Vector Search
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyAnswer(msg.answer || "", msg.id)}
                            className="flex items-center gap-1.5 px-2 py-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
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

          {/* Sticky Bottom Chat Input Bar within the Center Column */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/95 to-transparent pt-3 pb-5 px-4 z-20">
            <div className="max-w-3xl mx-auto flex flex-col gap-2">
              {loading && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
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

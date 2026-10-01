import React, { useState, useRef, useCallback } from "react";
import type { Project, QueryRecord, SourceItem } from "../../types";
import { submitQueryStream, listQueries } from "../../api/queries";
import { ChatInput } from "./ChatInput";
import { ChatMarkdown } from "./ChatMarkdown";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
} from "@/components/ai-elements/sources";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Copy,
  Check,
  AlertCircle,
  FileSearch,
  BookOpen,
  ArrowRight,
  FolderPlus,
  FileText,
} from "lucide-react";

interface ChatViewProps {
  activeProject: Project | null;
  projects?: Project[];
  loadingProjects?: boolean;
  onSelectProject?: (projectId: string) => void;
  activeSessionId: string | null;
  documentCount?: number;
  onDocumentUploaded?: () => void;
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

export const ChatView: React.FC<ChatViewProps> = ({
  activeProject,
  projects = [],
  loadingProjects = false,
  onSelectProject: _onSelectProject,
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
  const [hasMore, setHasMore] = useState<boolean>(() => (initialHistory ? initialHistory.length >= 20 : false));
  const [loadingEarlier, setLoadingEarlier] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [prevHistory, setPrevHistory] = useState(initialHistory);

  // Sync if initialHistory updates from parent
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

  // Load earlier messages for pagination
  const handleLoadEarlier = useCallback(async () => {
    if (!activeProject || loadingEarlier || !hasMore || messages.length === 0 || loading) return;
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
  }, [activeProject, loadingEarlier, hasMore, messages, loading, activeSessionId]);

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
        onDone: (data) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    ...msg,
                    id: data.id || tempId,
                    answer: data.answer || msg.answer,
                    loading: false,
                    streaming: false,
                  }
                : msg
            )
          );
          setLoading(false);
          abortControllerRef.current = null;
        },
        onError: (err) => {
          if (controller.signal.aborted) return;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId
                ? {
                    ...msg,
                    loading: false,
                    streaming: false,
                    error: err.message || "An unexpected error occurred during synthesis.",
                  }
                : msg
            )
          );
          setLoading(false);
          abortControllerRef.current = null;
        },
      });
    } catch {
      // Handled in onError
    }
  };

  // If no project is selected or projects are loading
  if (!activeProject && !loadingProjects && projects.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="size-12 rounded-xl bg-muted text-foreground flex items-center justify-center mb-3">
          <BookOpen className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Welcome to FileSense</h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
          Create a workspace project to index documents and ask questions grounded in your data.
        </p>
        <Button onClick={onOpenNewProjectModal} size="sm" className="gap-2">
          <FolderPlus className="size-4" />
          <span>Create First Project</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative font-sans">
      {/* Scrollable Conversation Thread */}
      <Conversation className="flex-1 px-4 md:px-8 py-6">
        <ConversationContent className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Pagination: Load Earlier Button */}
          {hasMore && messages.length > 0 && (
            <div className="flex justify-center pb-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingEarlier || loading}
                onClick={handleLoadEarlier}
                className="text-xs text-muted-foreground"
              >
                {loadingEarlier ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    <span>Loading earlier messages...</span>
                  </>
                ) : (
                  "Load earlier messages"
                )}
              </Button>
            </div>
          )}

          {/* Loading Skeleton during initial session history load */}
          {loadingHistory && messages.length === 0 && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex justify-end">
                <Skeleton className="h-9 w-40 rounded-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          )}

          {/* Empty Conversation Hero */}
          {!loadingHistory && messages.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center font-sans select-none">
              <div className="size-10 rounded-xl bg-muted text-foreground flex items-center justify-center mb-3">
                <FileText className="size-5" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1">
                {activeProject?.title}
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
                {documentCount > 0
                  ? `${documentCount} document${documentCount > 1 ? "s" : ""} indexed and ready for grounded questions.`
                  : "No documents attached yet. Drop files below to start."}
              </p>

              {/* Starter Prompt Suggestions */}
              {documentCount > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full text-left">
                  {[
                    "Summarize the main topics in these documents",
                    "What are the key technical concepts described?",
                    "Extract important configuration details and steps",
                    "Are there any specific limitations or warnings?",
                  ].map((promptText, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(promptText)}
                      className="p-3 bg-muted hover:bg-muted/80 border rounded-xl text-xs text-foreground transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate pr-2">{promptText}</span>
                      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg) => {
            // Deduplicate unique sources for the top tray
            const uniqueSources = msg.sources
              ? Array.from(new Map(msg.sources.map((s) => [s.fileName, s])).values())
              : [];

            return (
              <div key={msg.id} className="flex flex-col gap-4">
                {/* User Message */}
                <Message from="user">
                  <MessageContent>
                    {msg.question}
                  </MessageContent>
                </Message>

                {/* Assistant Message */}
                <Message from="assistant">
                  <MessageContent className="w-full">
                    {msg.loading && !msg.answer ? (
                      <div className="flex flex-col gap-2 py-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileSearch className="size-3.5 animate-pulse" />
                          <span>Searching documents & synthesizing answer...</span>
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    ) : msg.error ? (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-start gap-2">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold">Synthesis Alert</div>
                          <div>{msg.error}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {/* Top Collapsible Sources Tray (AI Elements Sources) */}
                        {uniqueSources.length > 0 && (
                          <Sources className="border-b pb-2 mb-1">
                            <SourcesTrigger count={uniqueSources.length}>
                              <div className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                                <BookOpen className="size-3.5" />
                                <span>{uniqueSources.length} source{uniqueSources.length > 1 ? "s" : ""} consulted</span>
                              </div>
                            </SourcesTrigger>
                            <SourcesContent className="mt-2 flex flex-wrap gap-1.5">
                              {uniqueSources.map((source, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center gap-1.5 px-2.5 py-1 bg-muted border rounded-md text-xs"
                                >
                                  <FileText className="size-3 text-muted-foreground shrink-0" />
                                  <span className="text-foreground truncate max-w-[160px]" title={source.fileName}>
                                    {source.fileName}
                                  </span>
                                </div>
                              ))}
                            </SourcesContent>
                          </Sources>
                        )}

                        {/* Assistant Synthesized Markdown Content */}
                        <ChatMarkdown
                          content={msg.answer || ""}
                          isStreaming={msg.streaming}
                          sources={msg.sources}
                        />

                        {/* Streaming cursor pulse */}
                        {msg.streaming && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <span className="inline-block size-1.5 rounded-full bg-foreground animate-pulse" />
                            <span>Generating...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </MessageContent>

                  {/* Message Action Footer */}
                  {msg.answer && !msg.streaming && (
                    <MessageActions className="pt-1">
                      <MessageAction
                        label="Copy answer"
                        tooltip="Copy answer"
                        onClick={() => handleCopyAnswer(msg.answer || "", msg.id)}
                      >
                        {copiedId === msg.id ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </MessageAction>
                    </MessageActions>
                  )}
                </Message>
              </div>
            );
          })}
        </ConversationContent>

        {/* Jump-to-bottom scroll button */}
        <ConversationScrollButton />
      </Conversation>

      {/* Pinned Bottom Input */}
      <ChatInput
        activeProject={activeProject}
        onSendMessage={handleSendMessage}
        onDocumentUploaded={onDocumentUploaded}
        onOpenNewProjectModal={onOpenNewProjectModal}
        loading={loading}
        onStop={handleStopGeneration}
      />
    </div>
  );
};

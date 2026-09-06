import React, { useState, useEffect, useRef } from "react";
import type { Project, QueryRecord, SourceItem } from "../../types";
import { submitQuery } from "../../api/queries";
import { ChatInput } from "./ChatInput";
import { SourceChips } from "./SourceChips";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  FileText,
  AlertCircle,
} from "lucide-react";

interface PerplexityChatProps {
  activeProject: Project | null;
  documentCount: number;
  onDocumentUploaded: () => void;
  onOpenNewProjectModal: () => void;
  initialHistory?: QueryRecord[];
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string | null;
  sources?: SourceItem[] | null;
  loading?: boolean;
  error?: string | null;
  createdAt: string | number;
}

export const PerplexityChat: React.FC<PerplexityChatProps> = ({
  activeProject,
  documentCount,
  onDocumentUploaded,
  onOpenNewProjectModal,
  initialHistory = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or restore from query history if available
  useEffect(() => {
    let mounted = true;
    if (initialHistory.length > 0) {
      queueMicrotask(() => {
        if (mounted) {
          setMessages((prev) =>
            prev.length === 0
              ? initialHistory.map((q) => ({
                  id: q.id,
                  question: q.question,
                  answer: q.answer,
                  sources: q.sources,
                  createdAt: q.createdAt,
                }))
              : prev
          );
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [initialHistory]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    if (!activeProject) {
      onOpenNewProjectModal();
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      question: questionText,
      answer: null,
      sources: null,
      loading: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await submitQuery(questionText, activeProject.id);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                id: res.id,
                question: res.question,
                answer: res.answer,
                sources: res.sources,
                loading: false,
                createdAt: res.createdAt,
              }
            : msg
        )
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate answer.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                loading: false,
                error: errorMsg,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnswer = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const suggestions = [
    "Summarize the key obligations and liabilities",
    "What are the payment terms, penalties, and deadlines?",
    "Extract all mentioned parties, witnesses, and dates",
    "Identify any ambiguities or potential legal risks",
  ];

  const isEmpty = messages.length === 0;

  return (
    <div className="w-full flex-1 flex flex-col justify-between max-w-3xl mx-auto px-4 py-6 font-sans">
      {/* 1. HERO VIEW: When thread is empty */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12">
          {/* Logo Icon & Title */}
          <div className="flex flex-col items-center gap-2.5 mb-8">
            <div className="w-12 h-12 bg-[#0F172A] flex items-center justify-center relative rounded-xl shadow-xs">
              <div className="w-6 h-1 bg-[#E11D48]" />
              <div className="w-1 h-6 bg-[#E11D48] absolute" />
              <div className="w-1.5 h-1.5 bg-white absolute" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              Where knowledge begins.
            </h1>

            <p className="text-sm text-slate-500 max-w-md">
              Ask anything across your case files and project documents with cited, grounded answers.
            </p>
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

          {/* Prompt Suggestions */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              Suggested queries:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(s)}
                  className="px-3 py-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-full transition-colors cursor-pointer shadow-2xs"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Context Status Footnote */}
          <div className="mt-8 text-xs text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {activeProject ? (
              <span>
                Searching <strong>{activeProject.title}</strong> ({documentCount} {documentCount === 1 ? "document" : "documents"} indexed)
              </span>
            ) : (
              <span>No case selected. Attach a document to start.</span>
            )}
          </div>
        </div>
      ) : (
        /* 2. THREAD VIEW: When questions have been asked */
        <div className="flex-1 flex flex-col gap-8 pb-32">
          {/* Thread header with reset */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>
                Case: <strong className="text-slate-700 font-medium">{activeProject?.title}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMessages([])}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Start a new conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Question</span>
            </button>
          </div>

          {/* Message List */}
          <div className="flex flex-col gap-8">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-3">
                {/* Question */}
                <div className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                  {msg.question}
                </div>

                {/* Sources Row */}
                {msg.sources && msg.sources.length > 0 && (
                  <SourceChips sources={msg.sources} />
                )}

                {/* Answer Box */}
                {msg.loading ? (
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3 text-xs text-slate-600 animate-pulse">
                    <Sparkles className="w-4 h-4 text-[#E11D48] animate-spin shrink-0" />
                    <span>Analyzing documents and synthesizing answer...</span>
                  </div>
                ) : msg.error ? (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Query Error</div>
                      <div>{msg.error}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 bg-white p-5 border border-slate-200 rounded-xl shadow-2xs">
                    {/* Prose Content */}
                    <div className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap selection:bg-[#E11D48] selection:text-white">
                      {msg.answer}
                    </div>

                    {/* Footer Actions */}
                    {msg.answer && (
                      <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleCopyAnswer(msg.answer || "", msg.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom Follow-up Input */}
          <div className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent pt-6 pb-6 z-30">
            <div className="max-w-3xl mx-auto px-4">
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

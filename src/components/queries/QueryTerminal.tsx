import React, { useState } from "react";
import type { QueryRecord } from "../../types";
import { submitQuery } from "../../api/queries";
import { AnswerCard } from "./AnswerCard";
import { SwissButton } from "../common/SwissButton";
import { EmptyState } from "../common/EmptyState";
import {
  Sparkles,
  History,
  CornerDownLeft,
  AlertCircle,
} from "lucide-react";

interface QueryTerminalProps {
  activeProjectId: string | null;
  activeProjectTitle?: string;
  history: QueryRecord[];
  onOpenHistory: () => void;
  onQueryCompleted: (record: QueryRecord) => void;
}

export const QueryTerminal: React.FC<QueryTerminalProps> = ({
  activeProjectId,
  activeProjectTitle,
  history,
  onOpenHistory,
  onQueryCompleted,
}) => {
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<"project" | "global">("project");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<QueryRecord | null>(
    history.length > 0 ? history[0] : null
  );

  const effectiveProjectId =
    scope === "project" && activeProjectId ? activeProjectId : null;

  const handleExecute = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await submitQuery(question.trim(), effectiveProjectId);
      setActiveResult(res);
      onQueryCompleted(res);
      setQuestion("");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to execute semantic query"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
  };

  const suggestions = [
    "Summarize the core conclusions",
    "Identify any action items or key dates",
    "Extract all key metrics and numbers",
  ];

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-bold text-slate-900 font-sans">
            Ask AI
          </h2>
          <span className="text-xs text-slate-400 font-sans">
            Search and synthesize answers from indexed documents
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Scope Selector */}
          <div className="flex items-center border border-slate-200 bg-slate-50 p-0.5 rounded-xs text-xs font-sans">
            <button
              type="button"
              onClick={() => setScope("project")}
              disabled={!activeProjectId}
              className={`px-2.5 py-1 transition-colors cursor-pointer rounded-xs disabled:opacity-40 ${
                scope === "project" && activeProjectId
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              This Project
            </button>
            <button
              type="button"
              onClick={() => setScope("global")}
              className={`px-2.5 py-1 transition-colors cursor-pointer rounded-xs ${
                scope === "global" || !activeProjectId
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Projects
            </button>
          </div>

          <SwissButton
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            icon={<History className="w-3.5 h-3.5" />}
          >
            History {history.length > 0 && `(${history.length})`}
          </SwissButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
        {/* Prompt Input Form */}
        <div className="border border-slate-200 bg-white p-4 flex flex-col gap-3 rounded-xs">
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder={`Ask a question about ${effectiveProjectId ? activeProjectTitle || "this project" : "all documents"}...`}
              className="w-full p-3 text-sm font-sans bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors resize-none rounded-xs"
            />
          </div>

          {/* Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-sans">
              Suggested:
            </span>
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuestion(s)}
                className="text-xs font-sans px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer rounded-xs truncate max-w-[240px]"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 hidden sm:inline font-sans">
              Press <kbd className="px-1.5 py-0.5 border border-slate-200 bg-slate-50 text-[11px] font-mono">⌘+Enter</kbd> to ask
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {question.trim().length > 0 && (
                <SwissButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuestion("")}
                  disabled={loading}
                >
                  Clear
                </SwissButton>
              )}

              <SwissButton
                variant="vermilion"
                size="sm"
                onClick={handleExecute}
                loading={loading}
                disabled={!question.trim()}
                icon={<CornerDownLeft className="w-3.5 h-3.5" />}
              >
                Ask AI
              </SwissButton>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-xs font-sans flex items-start gap-2 rounded-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div>
              <div className="font-semibold">Query Failed</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Answers and Sources */}
        <div className="flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="border border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center gap-2.5 rounded-xs">
              <Sparkles className="w-5 h-5 text-[#E11D48] animate-spin" />
              <div className="text-xs font-medium text-slate-700 font-sans">
                Analyzing documents and generating answer...
              </div>
            </div>
          ) : activeResult ? (
            <AnswerCard query={activeResult} />
          ) : (
            <EmptyState
              title="No questions yet"
              description="Ask a question above to search through indexed document chunks and synthesize an answer."
              icon={<Sparkles className="w-5 h-5 text-slate-400" />}
            />
          )}
        </div>
      </div>
    </div>
  );
};

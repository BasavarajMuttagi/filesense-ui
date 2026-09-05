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
    "Summarize the core conclusions and findings",
    "Identify any action items, risks, or key dates",
    "Extract all financial figures and quantitative metrics",
  ];

  return (
    <div className="flex flex-col h-full bg-white border border-slate-900 swiss-shadow">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-900 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-[#0F172A] text-white px-1.5 py-0.5">
            03
          </span>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            INTELLIGENCE // RAG TERMINAL
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Scope Selector */}
          <div className="flex items-center border border-slate-300 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setScope("project")}
              disabled={!activeProjectId}
              className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 ${
                scope === "project" && activeProjectId
                  ? "bg-[#0F172A] text-white font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title={activeProjectId ? `Scope to ${activeProjectTitle}` : "Select a project first"}
            >
              PROJECT SCOPE
            </button>
            <button
              type="button"
              onClick={() => setScope("global")}
              className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                scope === "global" || !activeProjectId
                  ? "bg-[#0F172A] text-white font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ALL PROJECTS
            </button>
          </div>

          <SwissButton
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            icon={<History className="w-3 h-3" />}
          >
            HISTORY ({history.length})
          </SwissButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Prompt Input Form */}
        <div className="border border-slate-900 bg-white p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900">
                ASK DOCUMENT INTELLIGENCE
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              SEARCH: {effectiveProjectId ? activeProjectTitle : "ENTIRE VECTOR REPOSITORY"}
            </span>
          </div>

          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Query indexed documents (e.g. 'What are the main risks identified in section 3?')..."
              className="w-full p-2.5 text-sm font-sans bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors resize-none"
            />
          </div>

          {/* Preset Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-slate-600 uppercase">
              PROMPT TEMPLATES:
            </span>
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuestion(s)}
                className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer truncate max-w-[220px]"
              >
                "{s}"
              </button>
            ))}
          </div>

          {/* Execution Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-[10px] font-mono text-slate-600 hidden sm:inline">
              PRESS <kbd className="px-1 py-0.5 border border-slate-300 bg-slate-100 font-bold">CMD+ENTER</kbd> TO RUN
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {question.trim().length > 0 && (
                <SwissButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuestion("")}
                  disabled={loading}
                >
                  CLEAR
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
                EXECUTE QUERY
              </SwissButton>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="border border-slate-900 bg-slate-50 p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent animate-spin" />
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              VECTOR SEARCH &amp; MISTRAL SYNTHESIS IN PROGRESS...
            </div>
            <p className="text-[11px] font-mono text-slate-500 max-w-sm">
              Querying Upstash Vector top-6 chunks, assembling document context, and synthesizing answer with Mistral AI.
            </p>
          </div>
        )}

        {/* Active Result or Empty State */}
        {!loading && activeResult && (
          <AnswerCard query={activeResult} />
        )}

        {!loading && !activeResult && (
          <div className="flex-1 flex items-center justify-center p-4">
            <EmptyState
              title="Ready for Semantic Queries"
              description="Ask natural-language questions about your uploaded documents. Upstash Vector will extract relevant snippets and Mistral AI will generate grounded answers with source citations."
              code="RAG_IDLE"
              icon={<Sparkles className="w-5 h-5 text-slate-500" />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

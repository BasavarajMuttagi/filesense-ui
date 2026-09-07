import React, { useState } from "react";
import type { QueryRecord } from "../../types";
import { SourceCard } from "./SourceCard";
import { SwissButton } from "../common/SwissButton";
import { PerplexityMarkdown } from "../chat/PerplexityMarkdown";
import { Copy, Check, BookOpen, Sparkles } from "lucide-react";

interface AnswerCardProps {
  query: QueryRecord;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ query }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAnswer = () => {
    if (query.answer) {
      navigator.clipboard.writeText(query.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const formatDate = (raw: string | number) => {
    try {
      const d = typeof raw === "number" ? new Date(raw * 1000) : new Date(raw);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return String(raw);
    }
  };

  const sources = query.sources || [];

  return (
    <div className="border border-slate-200 bg-white rounded-xs flex flex-col">
      {/* Answer Header */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E11D48]" />
          <span className="text-xs font-bold text-slate-900 font-sans">
            AI Answer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-sans">
            {formatDate(query.createdAt)}
          </span>
          <SwissButton
            variant="outline"
            size="sm"
            onClick={handleCopyAnswer}
            icon={copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          >
            {copied ? "Copied" : "Copy"}
          </SwissButton>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white">
        <p className="text-sm font-semibold text-slate-900 font-sans">
          {query.question}
        </p>
      </div>

      {/* Answer Prose Body with Markdown */}
      <div className="p-4 text-sm leading-relaxed text-slate-800 font-sans border-b border-slate-100">
        {query.answer ? (
          <PerplexityMarkdown content={query.answer} />
        ) : (
          <span className="text-slate-400 italic">No response content returned.</span>
        )}
      </div>

      {/* Cited Sources Section */}
      {sources.length > 0 && (
        <div className="p-4 bg-slate-50/40 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 font-sans">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Sources ({sources.length})</span>
          </div>

          <div className="flex flex-col gap-2">
            {sources.map((src, idx) => (
              <SourceCard key={`${src.fileName}-${idx}`} source={src} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

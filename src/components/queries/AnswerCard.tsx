import React, { useState } from "react";
import type { QueryRecord } from "../../types";
import { SourceCard } from "./SourceCard";
import { SwissButton } from "../common/SwissButton";
import { Copy, Check, BookOpen } from "lucide-react";

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
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return String(raw);
    }
  };

  const sources = query.sources || [];

  return (
    <div className="border border-slate-900 bg-white swiss-shadow flex flex-col">
      {/* Answer Header */}
      <div className="p-3.5 border-b border-slate-900 bg-slate-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-bold bg-[#E11D48] text-white px-1.5 py-0.5">
            RAG
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 truncate">
            SYNTHESIS // mistral-medium-3-5
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-500">
            {formatDate(query.createdAt)}
          </span>
          <SwissButton
            variant="outline"
            size="sm"
            onClick={handleCopyAnswer}
            icon={copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          >
            {copied ? "COPIED" : "COPY"}
          </SwissButton>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/40">
        <span className="text-[10px] font-mono text-slate-600 uppercase font-semibold block mb-1">
          PROMPT
        </span>
        <p className="text-sm font-semibold text-slate-900 font-sans">
          {query.question}
        </p>
      </div>

      {/* Answer Prose Body */}
      <div className="p-4 text-sm leading-relaxed text-slate-800 font-sans whitespace-pre-wrap selection:bg-[#E11D48] selection:text-white border-b border-slate-200">
        {query.answer || "No response content returned."}
      </div>

      {/* Cited Sources Section */}
      <div className="p-4 bg-slate-50/50 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#E11D48]" />
            CITED VECTOR CHUNKS ({sources.length})
          </span>
          <span className="text-[10px] font-mono text-slate-600">
            TOP-K // UPSTASH VECTOR
          </span>
        </div>

        {sources.length === 0 ? (
          <div className="text-xs font-mono text-slate-600 italic p-2 border border-dashed border-slate-200 bg-white">
            No direct document citations matched this prompt.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sources.map((src, idx) => (
              <SourceCard key={`${src.fileName}-${idx}`} source={src} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

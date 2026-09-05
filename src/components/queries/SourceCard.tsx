import { useState } from "react";
import type { SourceItem } from "../../types";
import { FileText, ChevronDown, ChevronUp, Check, Copy } from "lucide-react";

interface SourceCardProps {
  source: SourceItem;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const scorePct = Math.round((source.score || 0) * 100);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(source.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="border border-slate-300 bg-white hover:border-slate-800 transition-colors">
      <div
        className="p-2.5 flex items-center justify-between cursor-pointer select-none bg-slate-50/70"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono font-bold text-[#E11D48]">
            [{String(index + 1).padStart(2, "0")}]
          </span>
          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[200px]">
            {source.fileName || source.title || "Document Chunk"}
          </span>
          {source.pageStart && (
            <span className="text-[10px] font-mono text-slate-500">
              (P.{source.pageStart}
              {source.pageEnd && source.pageEnd !== source.pageStart ? `–${source.pageEnd}` : ""})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {source.score > 0 && (
            <div className="flex items-center gap-1.5">
              {/* Geometric mini score bar */}
              <div className="w-12 bg-slate-200 h-1.5 border border-slate-300 hidden sm:block">
                <div
                  className="bg-[#0F172A] h-full"
                  style={{ width: `${Math.min(100, Math.max(10, scorePct))}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-600 font-semibold">
                {scorePct}%
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            title="Copy excerpt"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>

          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-3 border-t border-slate-200 bg-white font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap selection:bg-[#E11D48] selection:text-white max-h-48 overflow-y-auto">
          {source.text}
        </div>
      )}
    </div>
  );
};

import { useState } from "react";
import type { SourceItem } from "../../types";
import { FileText, ChevronDown, ChevronUp, Check, Copy } from "lucide-react";

interface SourceCardProps {
  source: SourceItem;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
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
    <div className="border border-slate-200 bg-white rounded-xs">
      <div
        className="p-2.5 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-800 truncate max-w-[240px] font-sans">
            {source.fileName || source.title || "Document Chunk"}
          </span>
          {source.pageStart && (
            <span className="text-[11px] text-slate-400 font-sans">
              p. {source.pageStart}
              {source.pageEnd && source.pageEnd !== source.pageStart ? `–${source.pageEnd}` : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {source.score > 0 && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-xs font-mono">
              {scorePct}% match
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-xs"
            title="Copy excerpt"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>

          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-3 border-t border-slate-100 bg-white text-xs text-slate-600 font-sans leading-relaxed whitespace-pre-wrap selection:bg-[#E11D48] selection:text-white max-h-48 overflow-y-auto">
          {source.text}
        </div>
      )}
    </div>
  );
};

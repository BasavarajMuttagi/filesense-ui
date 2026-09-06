import React, { useState } from "react";
import type { SourceItem } from "../../types";
import { SwissModal } from "../common/SwissModal";
import { FileText, Copy, Check } from "lucide-react";

interface SourceChipsProps {
  sources: SourceItem[];
}

export const SourceChips: React.FC<SourceChipsProps> = ({ sources }) => {
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [copied, setCopied] = useState(false);

  if (!sources || sources.length === 0) return null;

  const handleCopyExcerpt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-2 my-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans font-medium">
        <FileText className="w-3.5 h-3.5 text-slate-400" />
        <span>Sources ({sources.length})</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {sources.map((src, idx) => {
          const scorePct = Math.round((src.score || 0) * 100);
          return (
            <button
              key={`${src.fileName}-${idx}`}
              type="button"
              onClick={() => setSelectedSource(src)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-full transition-colors cursor-pointer group"
            >
              <span className="w-4 h-4 bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center rounded-full group-hover:bg-slate-300">
                {idx + 1}
              </span>
              <span className="font-medium truncate max-w-[160px] font-sans">
                {src.fileName || "Document"}
              </span>
              {scorePct > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {scorePct}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Excerpt Modal */}
      {selectedSource && (
        <SwissModal
          isOpen={Boolean(selectedSource)}
          onClose={() => setSelectedSource(null)}
          title={selectedSource.fileName || "Source Citation"}
          maxWidth="lg"
          footer={
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-400 font-sans">
                Relevance match: {Math.round((selectedSource.score || 0) * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleCopyExcerpt(selectedSource.text)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Excerpt"}
              </button>
            </div>
          }
        >
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="font-medium text-slate-800">
                {selectedSource.fileName}
              </span>
              {selectedSource.pageStart && (
                <span>
                  Page {selectedSource.pageStart}
                  {selectedSource.pageEnd && selectedSource.pageEnd !== selectedSource.pageStart
                    ? `–${selectedSource.pageEnd}`
                    : ""}
                </span>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-sans">
              {selectedSource.text}
            </div>
          </div>
        </SwissModal>
      )}
    </div>
  );
};

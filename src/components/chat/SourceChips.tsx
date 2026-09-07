import React, { useState } from "react";
import type { SourceItem } from "../../types";
import { FileText, Copy, Check, ChevronRight, X } from "lucide-react";

interface SourceChipsProps {
  sources: SourceItem[];
  selectedSourceIndex?: number | null;
  onCloseModal?: () => void;
}

export const SourceChips: React.FC<SourceChipsProps> = ({
  sources,
  selectedSourceIndex,
  onCloseModal,
}) => {
  const [manualSource, setManualSource] = useState<SourceItem | null>(null);
  const [closedIndex, setClosedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive source from prop index or manual click
  const activeSource =
    manualSource ||
    (typeof selectedSourceIndex === "number" &&
    selectedSourceIndex >= 0 &&
    selectedSourceIndex < sources.length &&
    selectedSourceIndex !== closedIndex
      ? sources[selectedSourceIndex]
      : null);

  if (!sources || sources.length === 0) return null;

  const handleCopyExcerpt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClose = () => {
    setManualSource(null);
    if (typeof selectedSourceIndex === "number") {
      setClosedIndex(selectedSourceIndex);
    }
    onCloseModal?.();
  };

  return (
    <div className="flex flex-col gap-2 my-2.5 font-sans">
      {/* Sources Header */}
      <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
        <FileText className="size-3.5 text-[#0052FF]" />
        <span>Grounded Citations ({sources.length})</span>
      </div>

      {/* Swiss Compact Citation Cards Reel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
        {sources.slice(0, 6).map((src, idx) => {
          const scorePct = Math.round((src.score || 0) * 100);
          const pageStr = src.pageStart ? `p. ${src.pageStart}` : null;

          return (
            <button
              key={`${src.fileName}-${idx}`}
              type="button"
              onClick={() => {
                setClosedIndex(null);
                setManualSource(src);
              }}
              className="group flex flex-col justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left min-w-[155px] max-w-[195px] h-[72px] shrink-0 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer select-none"
            >
              {/* Top Row: File title + Citation index */}
              <div className="flex items-start justify-between gap-1.5 w-full">
                <span
                  className="text-xs font-semibold text-slate-800 group-hover:text-slate-950 truncate max-w-[115px]"
                  title={src.fileName}
                >
                  {src.fileName || "Document"}
                </span>
                <span className="font-mono text-[10px] font-bold text-[#0052FF] bg-blue-50 group-hover:bg-blue-100 size-4.5 rounded-md flex items-center justify-center shrink-0 border border-blue-100">
                  {idx + 1}
                </span>
              </div>

              {/* Bottom Row: Score & Page */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 w-full mt-1">
                <span className="font-mono text-slate-600">{pageStr || "Vector chunk"}</span>
                {scorePct > 0 && (
                  <span className="font-mono px-1 py-0.2 rounded bg-sky-50 text-sky-700 font-semibold border border-sky-100">
                    {scorePct}% match
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {sources.length > 6 && (
          <button
            type="button"
            onClick={() => {
              setClosedIndex(null);
              setManualSource(sources[6]);
            }}
            className="flex items-center justify-center gap-1 p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 min-w-[110px] h-[72px] shrink-0 transition-colors cursor-pointer"
          >
            <span>+{sources.length - 6} more</span>
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>

      {/* Swiss Citation Excerpt Inspection Modal */}
      {activeSource && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-7 rounded-lg bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {activeSource.fileName || "Source Citation"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                {activeSource.pageStart ? (
                  <span>
                    Page {activeSource.pageStart}
                    {activeSource.pageEnd &&
                    activeSource.pageEnd !== activeSource.pageStart
                      ? `–${activeSource.pageEnd}`
                      : ""}
                  </span>
                ) : (
                  <span>Chunk {activeSource.chunkIndex ?? 0}</span>
                )}
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                  Semantic Score: {Math.round((activeSource.score || 0) * 100)}%
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-sans select-text">
                {activeSource.text}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
              <button
                type="button"
                onClick={() => handleCopyExcerpt(activeSource.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0052FF] hover:bg-[#0045D8] text-white rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="size-3.5 text-white" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy Excerpt"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

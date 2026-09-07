import React, { useState, useEffect } from "react";
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
  const [internalSelectedSource, setInternalSelectedSource] = useState<SourceItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync with external selected index (e.g. when user clicks [1] in markdown)
  useEffect(() => {
    if (
      typeof selectedSourceIndex === "number" &&
      selectedSourceIndex >= 0 &&
      selectedSourceIndex < sources.length
    ) {
      setInternalSelectedSource(sources[selectedSourceIndex]);
    }
  }, [selectedSourceIndex, sources]);

  if (!sources || sources.length === 0) return null;

  const handleCopyExcerpt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClose = () => {
    setInternalSelectedSource(null);
    onCloseModal?.();
  };

  return (
    <div className="flex flex-col gap-2 my-3 font-sans">
      {/* Sources Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        <FileText className="size-3.5 text-zinc-400" />
        <span>Sources ({sources.length})</span>
      </div>

      {/* Perplexity-style Compact Source Cards Reel */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
        {sources.slice(0, 6).map((src, idx) => {
          const scorePct = Math.round((src.score || 0) * 100);
          const pageStr = src.pageStart ? `p. ${src.pageStart}` : null;

          return (
            <button
              key={`${src.fileName}-${idx}`}
              type="button"
              onClick={() => setInternalSelectedSource(src)}
              className="group flex flex-col justify-between p-2.5 bg-white hover:bg-zinc-50 border border-zinc-200/90 hover:border-zinc-300 rounded-xl text-left min-w-[150px] max-w-[190px] h-[72px] shrink-0 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer select-none"
            >
              {/* Top Row: File title + Citation index */}
              <div className="flex items-start justify-between gap-1.5 w-full">
                <span
                  className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-950 truncate max-w-[110px]"
                  title={src.fileName}
                >
                  {src.fileName || "Document"}
                </span>
                <span className="font-mono text-[10px] font-semibold text-zinc-500 bg-zinc-100 group-hover:bg-zinc-200 size-4.5 rounded-full flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
              </div>

              {/* Bottom Row: Score & Page */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 w-full mt-1">
                <span>{pageStr || "Vector chunk"}</span>
                {scorePct > 0 && (
                  <span className="font-mono text-[10px] text-zinc-500">
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
            onClick={() => setInternalSelectedSource(sources[6])}
            className="flex items-center justify-center gap-1 p-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-600 min-w-[110px] h-[72px] shrink-0 transition-colors cursor-pointer"
          >
            <span>+{sources.length - 6} more</span>
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>

      {/* Pure React + Tailwind Modal for Source Excerpt */}
      {internalSelectedSource && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-lg w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-zinc-500 shrink-0" />
                <h3 className="text-sm font-semibold text-zinc-900 truncate">
                  {internalSelectedSource.fileName || "Source Citation"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="size-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                {internalSelectedSource.pageStart && (
                  <span>
                    Page {internalSelectedSource.pageStart}
                    {internalSelectedSource.pageEnd &&
                    internalSelectedSource.pageEnd !== internalSelectedSource.pageStart
                      ? `–${internalSelectedSource.pageEnd}`
                      : ""}
                  </span>
                )}
                <span>
                  Relevance Match:{" "}
                  <strong className="text-zinc-800">
                    {Math.round((internalSelectedSource.score || 0) * 100)}%
                  </strong>
                </span>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs text-zinc-700 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-sans">
                {internalSelectedSource.text}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-5 py-3.5 border-t border-zinc-100 bg-zinc-50/50">
              <button
                type="button"
                onClick={() => handleCopyExcerpt(internalSelectedSource.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
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

import React, { useState } from "react";
import type { SourceItem } from "../../types";
import { FileText, Copy, Check, ChevronRight, X } from "lucide-react";

// Normalize raw scores: converts Upstash Hybrid RRF scores (range 0.005-0.033) or cosine scores (0-1) into human-intuitive 0-100%
function formatMatchScore(rawScore: number | undefined): number {
  if (!rawScore || rawScore <= 0) return 0;
  if (rawScore >= 0.20) return Math.min(100, Math.round(rawScore * 100));

  const maxRrf = 2 / 61; // ≈ 0.0328 (top rank in both dense and sparse)
  const singleRank1 = 1 / 61; // ≈ 0.0164 (top rank in one modality)

  if (rawScore >= singleRank1) {
    const ratio = Math.min(1, (rawScore - singleRank1) / (maxRrf - singleRank1));
    return Math.round(80 + ratio * 18);
  }
  const ratio = Math.max(0, rawScore / singleRank1);
  return Math.round(60 + ratio * 20);
}

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
    <div className="flex flex-col gap-2 my-3 font-sans">
      {/* Sources Header */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#16161380] uppercase tracking-wider">
        <span className="size-4.5 rounded-full bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center">
          <FileText className="size-2.5" />
        </span>
        <span>Grounded Citations ({sources.length})</span>
      </div>

      {/* Tiimo Rounded Citation Cards Reel */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
        {sources.slice(0, 6).map((src, idx) => {
          const scorePct = formatMatchScore(src.score);
          const pageStr = src.pageStart ? `p. ${src.pageStart}` : null;

          return (
            <button
              key={`${src.fileName}-${idx}`}
              type="button"
              onClick={() => {
                setClosedIndex(null);
                setManualSource(src);
              }}
              className="group flex flex-col justify-between p-3 bg-white hover:bg-[#FAF9F6] border border-[#16161312] hover:border-[#7C5CFC50] rounded-2xl text-left min-w-[160px] max-w-[200px] h-[74px] shrink-0 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer select-none"
            >
              {/* Top Row: File title + Citation index */}
              <div className="flex items-start justify-between gap-1.5 w-full">
                <span
                  className="text-xs font-semibold text-[#161613] truncate max-w-[120px]"
                  title={src.fileName}
                >
                  {src.fileName || "Document"}
                </span>
                <span className="font-mono text-[10px] font-bold text-[#7C5CFC] bg-[#E2DAFF] group-hover:bg-[#d4c8ff] size-5 rounded-full flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
              </div>

              {/* Bottom Row: Score & Page */}
              <div className="flex items-center justify-between text-[10px] text-[#16161380] w-full mt-1">
                <span className="font-mono text-[#16161399]">{pageStr || "Vector chunk"}</span>
                {scorePct > 0 && (
                  <span className="font-mono px-1.5 py-0.5 rounded-full bg-[#D8F3E5] text-[#136C40] font-semibold">
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
            className="flex items-center justify-center gap-1 p-3 bg-[#EFECE6] hover:bg-[#E5E1D8] border border-[#16161310] rounded-2xl text-xs font-semibold text-[#161613] min-w-[110px] h-[74px] shrink-0 transition-colors cursor-pointer"
          >
            <span>+{sources.length - 6} more</span>
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>

      {/* Tiimo Citation Excerpt Inspection Modal */}
      {activeSource && (
        <div className="fixed inset-0 bg-[#161613]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl border border-[#16161314] shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#1616130d]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-full bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="size-4" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#161613] truncate">
                  {activeSource.fileName || "Source Citation"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="size-8 flex items-center justify-center rounded-full text-[#16161380] hover:bg-[#1616130d] hover:text-[#161613] transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3.5">
              <div className="flex items-center justify-between text-xs text-[#16161380] font-mono">
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
                <span className="px-2.5 py-0.5 rounded-full bg-[#D8F3E5] text-[#136C40] font-semibold text-[11px]">
                  Semantic Match: {formatMatchScore(activeSource.score)}%
                </span>
              </div>

              <div className="p-4 bg-[#F8F7F3] border border-[#1616130d] rounded-2xl text-xs text-[#161613d9] leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-sans select-text scrollbar-thin">
                {activeSource.text}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-[#1616130d] bg-[#FAF9F6]">
              <button
                type="button"
                onClick={() => handleCopyExcerpt(activeSource.text)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#161613] hover:bg-[#282824] text-white rounded-full shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                {copied ? (
                  <Check className="size-3.5 text-[#D8F3E5]" />
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

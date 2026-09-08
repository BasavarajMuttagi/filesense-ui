import React, { useState, useEffect } from "react";
import type { SourceItem } from "../../types";
import { FileText, Copy, Check, X } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  // Derive source from prop index
  const activeSource =
    typeof selectedSourceIndex === "number" &&
    selectedSourceIndex >= 0 &&
    selectedSourceIndex < sources.length
      ? sources[selectedSourceIndex]
      : null;

  useEffect(() => {
    if (!activeSource) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseModal?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSource, onCloseModal]);

  if (!activeSource || typeof selectedSourceIndex !== "number") return null;

  const handleCopyExcerpt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCloseModal?.();
        }
      }}
      className="fixed inset-0 bg-[#161613]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white rounded-3xl border border-[#16161314] shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#1616130d]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded-2xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-[#7C5CFC] bg-[#E2DAFF] px-2 py-0.5 rounded-md border border-[#7C5CFC33]">
                  [{selectedSourceIndex + 1}]
                </span>
                <h3 className="font-serif text-base font-bold text-[#161613] truncate">
                  {activeSource.fileName || "Source Citation"}
                </h3>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseModal}
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
  );
};

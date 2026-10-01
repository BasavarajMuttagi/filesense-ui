import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "../common/MermaidDiagram";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SourceItem } from "../../types";
import { Copy, Check, FileText } from "lucide-react";

// Normalize raw scores: converts Upstash Hybrid RRF scores or cosine scores into intuitive 0-100%
function formatMatchScore(rawScore: number | undefined): number {
  if (!rawScore || rawScore <= 0) return 0;
  if (rawScore >= 0.20) return Math.min(100, Math.round(rawScore * 100));

  const maxRrf = 2 / 61; // ≈ 0.0328
  const singleRank1 = 1 / 61; // ≈ 0.0164

  if (rawScore >= singleRank1) {
    const ratio = Math.min(1, (rawScore - singleRank1) / (maxRrf - singleRank1));
    return Math.round(80 + ratio * 18);
  }
  const ratio = Math.max(0, rawScore / singleRank1);
  return Math.round(60 + ratio * 20);
}

interface InlineCitationChipProps {
  citationNum: number;
  source: SourceItem | null;
}

const InlineCitationChip: React.FC<InlineCitationChipProps> = ({ citationNum, source }) => {
  const [copied, setCopied] = useState(false);

  if (!source) {
    return (
      <span className="inline-flex items-center font-mono text-[11px] text-muted-foreground bg-muted px-1 py-0.5 rounded align-baseline mx-0.5 select-none">
        [{citationNum}]
      </span>
    );
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(source.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const matchPercent = formatMatchScore(source.score);

  return (
    <HoverCard>
      <HoverCardTrigger
        className="inline-flex items-center font-mono text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent bg-muted px-1.5 py-0.5 rounded align-baseline mx-0.5 transition-colors cursor-pointer select-none"
      >
        [{citationNum}]
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-80 p-3 border bg-popover text-popover-foreground rounded-lg flex flex-col gap-2 z-50 font-sans text-xs"
      >
        <div className="flex items-center justify-between gap-2 border-b pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <FileText className="size-3.5 text-muted-foreground shrink-0" />
            <span className="font-medium truncate max-w-[160px]" title={source.fileName}>
              {source.fileName}
            </span>
          </div>
          <Badge variant="secondary" className="text-[10px] font-mono px-1 py-0">
            {matchPercent > 0 ? `${matchPercent}% match` : "Source"}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>
            {source.pageStart
              ? `Page ${source.pageStart}${source.pageEnd && source.pageEnd !== source.pageStart ? `–${source.pageEnd}` : ""}`
              : `Chunk ${(source.chunkIndex ?? 0) + 1}`}
          </span>
        </div>

        <div className="text-xs text-foreground bg-muted/60 rounded p-2 max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap font-sans select-text border">
          "{source.text}"
        </div>

        <div className="flex justify-end pt-1">
          <Button
            size="xs"
            variant="ghost"
            onClick={handleCopy}
            className="h-6 text-[11px] gap-1 px-2 text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy Snippet</span>
              </>
            )}
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

interface ChatMarkdownProps {
  content: string;
  isStreaming?: boolean;
  sources?: SourceItem[] | null;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = React.memo(
  ({ content, isStreaming, sources }) => {
    // Parse inline citations like [1] or [1][2] into sleek interactive hover cards
    const renderFormattedText = (text: string) => {
      const parts = text.split(/(\[\d+\])/g);
      if (parts.length === 1) return text;

      return parts.map((part, i) => {
        const match = /^\[(\d+)\]$/.exec(part);
        if (match) {
          const citationNum = parseInt(match[1], 10);
          const sourceIndex = citationNum - 1; // 1-indexed to 0-indexed
          const source = sources && sources[sourceIndex] ? sources[sourceIndex] : null;

          return (
            <InlineCitationChip
              key={i}
              citationNum={citationNum}
              source={source}
            />
          );
        }
        return part;
      });
    };

    return (
      <div className="chat-markdown text-sm text-foreground leading-relaxed font-sans flex flex-col gap-3">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-lg font-bold text-foreground mt-4 mb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-bold text-foreground mt-3 mb-1.5">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-foreground mt-2 mb-1">
                {children}
              </h3>
            ),
            p: ({ children }) => {
              return (
                <p className="my-1 leading-relaxed">
                  {React.Children.map(children, (child) => {
                    if (typeof child === "string") {
                      return renderFormattedText(child);
                    }
                    return child;
                  })}
                </p>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc list-outside pl-5 my-1.5 flex flex-col gap-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside pl-5 my-1.5 flex flex-col gap-1">
                {children}
              </ol>
            ),
            li: ({ children }) => {
              return (
                <li className="leading-relaxed">
                  {React.Children.map(children, (child) => {
                    if (typeof child === "string") {
                      return renderFormattedText(child);
                    }
                    return child;
                  })}
                </li>
              );
            },
            table: ({ children }) => (
              <div className="my-2.5 overflow-x-auto rounded-lg border bg-card">
                <table className="min-w-full divide-y text-xs text-left">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted font-semibold text-muted-foreground uppercase font-mono text-[11px]">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-3.5 py-2 font-medium">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3.5 py-2 border-t text-foreground">
                {React.Children.map(children, (child) => {
                  if (typeof child === "string") {
                    return renderFormattedText(child);
                  }
                  return child;
                })}
              </td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-border pl-3 my-2 text-muted-foreground italic">
                {React.Children.map(children, (child) => {
                  if (typeof child === "string") {
                    return renderFormattedText(child);
                  }
                  return child;
                })}
              </blockquote>
            ),
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";
              const codeString = String(children).replace(/\n$/, "");

              if (language === "mermaid") {
                return <MermaidDiagram code={codeString} isStreaming={isStreaming} />;
              }

              const isInline = !match && !codeString.includes("\n");

              if (isInline) {
                return (
                  <code
                    className="font-mono text-xs bg-muted px-1 py-0.5 rounded border text-foreground"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return <CodeBlockRender code={codeString} language={language} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

interface CodeBlockRenderProps {
  code: string;
  language: string;
}

const CodeBlockRender: React.FC<CodeBlockRenderProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2.5 rounded-lg overflow-hidden border bg-muted/40 font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-b text-muted-foreground">
        <span className="uppercase text-[10px] font-medium font-mono">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:text-foreground hover:bg-background/80 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-600" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
};

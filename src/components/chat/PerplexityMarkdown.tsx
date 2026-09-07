import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "../common/MermaidDiagram";
import { Copy, Check } from "lucide-react";

interface PerplexityMarkdownProps {
  content: string;
  isStreaming?: boolean;
  onCitationClick?: (index: number) => void;
}

export const PerplexityMarkdown: React.FC<PerplexityMarkdownProps> = React.memo(({
  content,
  isStreaming,
  onCitationClick,
}) => {
  // Pre-process inline citations like [1] or [1][2] into crisp Swiss circular pills
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    if (parts.length === 1) return text;

    return parts.map((part, i) => {
      const match = /^\[(\d+)\]$/.exec(part);
      if (match) {
        const citationNum = parseInt(match[1], 10);
        const sourceIndex = citationNum - 1; // 1-indexed to 0-indexed
        return (
          <button
            key={i}
            type="button"
            onClick={() => onCitationClick?.(sourceIndex)}
            className="inline-flex items-center justify-center font-mono text-[10px] font-bold text-[#0052FF] bg-blue-50 hover:bg-blue-100 size-4.5 rounded-md border border-blue-200 transition-colors cursor-pointer align-baseline mx-0.5 shadow-2xs"
            title={`View source citation [${citationNum}]`}
          >
            {citationNum}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="perplexity-markdown text-sm text-slate-800 leading-relaxed font-sans space-y-3.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-extrabold text-slate-900 mt-5 mb-2.5 tracking-tight font-sans">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-slate-900 mt-4 mb-2 tracking-tight font-sans">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold text-slate-900 mt-3 mb-1.5 tracking-tight font-sans">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-slate-900 mt-2 mb-1 font-sans">
              {children}
            </h4>
          ),
          p: ({ children }) => {
            return (
              <p className="my-2 leading-relaxed">
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
            <ul className="list-disc list-outside pl-5 my-2.5 space-y-1 text-slate-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 my-2.5 space-y-1 text-slate-700">
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
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 font-bold text-slate-900 uppercase font-mono text-[11px] tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-semibold text-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 border-t border-slate-100 text-slate-700">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[#0052FF] pl-4 my-3 text-slate-700 italic bg-blue-50/40 py-2 rounded-r-lg">
              {children}
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
                  className="bg-slate-100 text-slate-900 text-[12px] font-mono px-1.5 py-0.5 rounded border border-slate-200/80 font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock code={codeString} language={language} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3.5 border border-slate-800 bg-[#090D1A] rounded-xl overflow-hidden text-xs shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0F172A] border-b border-slate-800 text-slate-400 font-mono text-[11px]">
        <span className="font-semibold text-slate-300 uppercase">{language || "source"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-100 font-mono leading-relaxed text-[12px]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

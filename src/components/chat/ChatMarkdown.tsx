import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "../common/MermaidDiagram";
import { Copy, Check } from "lucide-react";

interface ChatMarkdownProps {
  content: string;
  isStreaming?: boolean;
  onCitationClick?: (index: number) => void;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = React.memo(({
  content,
  isStreaming,
  onCitationClick,
}) => {
  // Pre-process inline citations like [1] or [1][2] into sleek text citations without padding or border
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
            className="inline font-mono text-xs font-medium text-[#7C5CFC] hover:text-[#5229EC] hover:underline cursor-pointer transition-colors align-baseline mx-0.5 select-none p-0 border-none bg-transparent"
            title={`View source citation [${citationNum}]`}
          >
            [{citationNum}]
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="chat-markdown text-sm text-[#161613e6] leading-relaxed font-sans space-y-3.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-serif font-bold text-[#161613] mt-5 mb-2.5 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-serif font-bold text-[#161613] mt-4 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-serif font-bold text-[#161613] mt-3 mb-1.5 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-[#161613] mt-2 mb-1">
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
            <ul className="list-disc list-outside pl-5 my-2.5 space-y-1 text-[#161613cc]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 my-2.5 space-y-1 text-[#161613cc]">
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
            <div className="my-3.5 overflow-x-auto rounded-2xl border border-[#16161314] shadow-2xs bg-white">
              <table className="min-w-full divide-y divide-[#16161314] text-xs text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#F8F7F3] font-bold text-[#161613] uppercase font-mono text-[11px] tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-[#161613cc]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 border-t border-[#1616130d] text-[#161613d9]">
              {React.Children.map(children, (child) => {
                if (typeof child === "string") {
                  return renderFormattedText(child);
                }
                return child;
              })}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[#7C5CFC] pl-4 my-3 text-[#161613cc] italic bg-[#E2DAFF]/25 py-2.5 rounded-r-2xl">
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
                  className="bg-[#EFECE6] text-[#161613] text-[12px] font-mono px-1.5 py-0.5 rounded-lg border border-[#16161310] font-medium"
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
    <div className="my-3.5 border border-[#16161314] bg-[#161613] rounded-2xl overflow-hidden text-xs shadow-xs">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#242420] border-b border-[#ffffff10] text-[#A8A8A2] font-mono text-[11px]">
        <span className="font-semibold text-[#FAF9F6] uppercase">{language || "source"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-[#A8A8A2] hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="size-3.5 text-[#D8F3E5]" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[#F3F2EE] font-mono leading-relaxed text-[12px] scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};

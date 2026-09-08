import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { GitBranch, Copy, Check, AlertCircle } from "lucide-react";

interface MermaidDiagramProps {
  code: string;
  isStreaming?: boolean;
}

// Initialize once
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "loose",
    fontFamily: "inherit",
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: "basis",
    },
    gantt: {
      useMaxWidth: true,
    },
  });
}

function sanitizeMermaidCode(raw: string): string {
  let code = raw.trim();

  // Strip ```mermaid or ``` if embedded inside
  code = code.replace(/^```mermaid\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();

  // Auto-convert pseudo-gantt to flowchart TD if detected
  if (/^gantt\b/i.test(code)) {
    const lines = code.split("\n");
    const sections: { title: string; items: string[] }[] = [];
    let curTitle = "Process & Timeline";
    let curSection = "Milestones";
    let curItems: string[] = [];

    for (const l of lines) {
      const line = l.trim();
      if (!line) continue;
      if (line.toLowerCase().startsWith("title")) {
        curTitle = line.replace(/^title\s+/i, "").trim() || curTitle;
        continue;
      }
      if (line.toLowerCase().startsWith("section")) {
        if (curItems.length > 0) {
          sections.push({ title: curSection, items: [...curItems] });
          curItems = [];
        }
        curSection = line.replace(/^section\s+/i, "").trim() || "Milestones";
        continue;
      }
      if (
        line.startsWith("dateFormat") ||
        line.startsWith("axisFormat") ||
        line.startsWith("excludes") ||
        line.startsWith("todayMarker")
      ) {
        continue;
      }

      const taskName = line.split(":")[0].trim();
      const meta = line.includes(":") ? line.split(":")[1].trim() : "";
      const cleanMeta = meta
        .split(",")
        .map((s) => s.trim())
        .filter((s) => !/^[a-z0-9_]+$/i.test(s) && isNaN(Number(s)))
        .join(" | ");

      if (taskName) {
        curItems.push(cleanMeta ? `${taskName} (${cleanMeta})` : taskName);
      }
    }

    if (curItems.length > 0) {
      sections.push({ title: curSection, items: [...curItems] });
    }

    if (sections.length > 0) {
      let flow = "flowchart TD\n";
      flow += `  header["${curTitle.replace(/["\n]/g, " ")}"]\n`;

      let prevId = "header";
      let count = 0;

      sections.forEach((sec, sIdx) => {
        const secId = `sec_${sIdx}`;
        flow += `  subgraph ${secId}["${sec.title.replace(/["\n]/g, " ")}"]\n`;
        sec.items.forEach((item) => {
          count++;
          const nId = `n_${count}`;
          const safeItem = item.replace(/["\n]/g, "'");
          flow += `    ${nId}["${safeItem}"]\n`;
        });
        flow += "  end\n";
        flow += `  ${prevId} --> ${secId}\n`;
        prevId = secId;
      });

      return flow;
    }
  }

  // Auto-quote unquoted labels with parentheses or special chars in flowchart:
  code = code.replace(/\[([^"\]\n]+)\]/g, (match, inner) => {
    if (inner.includes("(") || inner.includes(")") || inner.includes(":") || inner.includes("&") || inner.includes("-")) {
      return `["${inner.replace(/"/g, "'")}"]`;
    }
    return match;
  });

  return code;
}

const mermaidSvgCache = new Map<string, string>();

export const MermaidDiagram: React.FC<MermaidDiagramProps> = React.memo(({ code, isStreaming }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trimmed = code.trim();
  const cachedSvg = mermaidSvgCache.get(trimmed) || "";
  const [svgContent, setSvgContent] = useState<string>(cachedSvg);
  const [prevTrimmed, setPrevTrimmed] = useState(trimmed);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync state during render if code changes to a cached entry
  if (prevTrimmed !== trimmed) {
    setPrevTrimmed(trimmed);
    setSvgContent(mermaidSvgCache.get(trimmed) || "");
    setRenderError(null);
  }

  useEffect(() => {
    let isMounted = true;
    if (!trimmed || isStreaming || mermaidSvgCache.has(trimmed)) return;

    const renderDiagram = async () => {
      const sanitized = sanitizeMermaidCode(trimmed);
      const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

      try {
        const { svg } = await mermaid.render(id, sanitized);
        mermaidSvgCache.set(trimmed, svg);
        if (isMounted) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err: unknown) {
        if (typeof document !== "undefined") {
          document.getElementById(id)?.remove();
          document.getElementById(`d${id}`)?.remove();
        }

        // Try fallback conversion if not already flowchart
        if (!sanitized.startsWith("flowchart")) {
          try {
            const fallbackId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
            const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
            let fallbackFlow = "flowchart TD\n";
            lines.slice(0, 15).forEach((line, idx) => {
              const cleanLine = line.replace(/[^a-zA-Z0-9\s\-–—:.,()]/g, "").trim();
              if (cleanLine) {
                fallbackFlow += `  step_${idx}["${cleanLine.replace(/"/g, "'")}"]\n`;
                if (idx > 0) {
                  fallbackFlow += `  step_${idx - 1} --> step_${idx}\n`;
                }
              }
            });
            const { svg } = await mermaid.render(fallbackId, fallbackFlow);
            mermaidSvgCache.set(trimmed, svg);
            if (isMounted) {
              setSvgContent(svg);
              setRenderError(null);
              return;
            }
          } catch {
            // Fallback failed
          }
        }

        if (isMounted) {
          const msg = err instanceof Error ? err.message : String(err);
          setRenderError(msg);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [trimmed, isStreaming]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isStreaming && !svgContent) {
    return (
      <div className="my-4 border border-[#E2DAFF] bg-[#F5F2FF] rounded-3xl p-4 flex items-center justify-center gap-2.5 text-xs text-[#3D2785] font-sans shadow-2xs">
        <GitBranch className="size-4 text-[#7C5CFC] animate-pulse" />
        <span className="font-medium">Generating visual diagram...</span>
      </div>
    );
  }

  if (renderError) {
    return (
      <div className="my-3 border border-[#16161315] bg-[#FAF9F6] rounded-3xl p-4 font-mono text-xs shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#16161310] text-[#16161375]">
          <span className="flex items-center gap-1.5 font-sans font-medium text-[11px] text-[#8E2800]">
            <AlertCircle className="size-3.5 text-[#FF7E49]" />
            Visual Diagram Source
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1 text-[11px] text-[#16161375] hover:text-[#161613] rounded-full px-2 py-0.5 hover:bg-[#1616130a] cursor-pointer"
          >
            {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto text-[#161613] whitespace-pre font-mono text-[11px] leading-relaxed">{code}</pre>
      </div>
    );
  }

  return (
    <div className="my-4 border border-[#16161315] bg-white rounded-3xl shadow-xs overflow-hidden font-sans">
      {/* Diagram Header */}
      <div className="px-5 py-3 bg-[#FAF9F6] border-b border-[#16161310] flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs font-medium text-[#161613]">
          <div className="size-6 rounded-full bg-[#E2DAFF] text-[#3D2785] flex items-center justify-center">
            <GitBranch className="size-3.5" />
          </div>
          <span className="font-serif text-sm">Visual Architecture Diagram</span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-[#16161375] hover:text-[#161613] hover:bg-[#16161308] rounded-full transition-colors cursor-pointer"
        >
          {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied" : "Copy Source"}</span>
        </button>
      </div>

      {/* SVG Container */}
      <div
        ref={containerRef}
        className="p-6 overflow-x-auto flex items-center justify-center min-h-[140px] [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
});

import React, { useState, useEffect } from "react";
import { SignUpButton } from "@clerk/clerk-react";
import {
  Layers,
  ArrowRight,
  Search,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Database,
  Lock,
  Zap,
  HardDrive,
  Copy,
  Check,
} from "lucide-react";
import { MermaidDiagram } from "../common/MermaidDiagram";

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [copiedDemo, setCopiedDemo] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sampleMermaid = `graph TD
    A[📄 Raw Documents] -->|Chunk & Tokenize| B(⚡ FastEmbed Engine)
    B -->|Dense Vectors 384d| C[(Upstash Vector)]
    B -->|BM25 Sparse Lexical| C
    D[🔍 User Query] -->|Hybrid RRF Fusion| C
    C -->|Top Grounded Chunks| E(✨ Mistral AI LLM)
    E -->|Grounded Answer + Citations| F[🎯 Verified Visual Response]
    style A fill:#E2DAFF,stroke:#7C5CFC,stroke-width:2px,color:#161613
    style C fill:#FFF0B3,stroke:#B88700,stroke-width:2px,color:#161613
    style E fill:#D8F3E5,stroke:#136C40,stroke-width:2px,color:#161613
    style F fill:#161613,stroke:#161613,stroke-width:2px,color:#FAF9F6`;

  const faqs = [
    {
      q: "What file formats does FileSense support?",
      a: "FileSense natively ingests and vectorizes PDF documents, Word documents (DOCX), plain text (TXT, MD), source code (TypeScript, Python, JavaScript, SQL, Prisma, YAML), and spreadsheets (CSV, XLSX).",
    },
    {
      q: "How does the Hybrid RRF search engine eliminate hallucinations?",
      a: "FileSense couples dense vector embeddings with sparse BM25 keyword matching via Reciprocal Rank Fusion (RRF). Every retrieved paragraph includes exact page numbers, cosine similarity scores, and verifiable excerpt highlights so you can fact-check answers instantly.",
    },
    {
      q: "Is my proprietary data kept private?",
      a: "Yes. All documents are stored in dedicated encrypted S3 buckets with time-limited presigned URLs. Your files and embeddings are never used to train public foundational AI models.",
    },
    {
      q: "How does reactive architecture diagramming work?",
      a: "When a technical document describes workflows, data structures, or system components, FileSense's engine formats the response into reactive Mermaid diagrams that render interactive flowcharts, sequence diagrams, and architecture maps in real time.",
    },
  ];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(
      "Explain the distributed data flow and latency bottlenecks in our ingestion pipeline."
    );
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 1800);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-[#161613] font-sans selection:bg-[#E2DAFF] selection:text-[#161613]">
      {/* 1. STICKY NAVIGATION: 100% transparent at top, frosted glass when scrolled */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
            ? "bg-[#FAF9F6]/85 backdrop-blur-md shadow-2xs py-3 border-b border-[#16161308]"
            : "bg-transparent py-4 border-b border-transparent"
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-2xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Layers className="size-4.5" />
            </div>
            <span className="font-serif text-lg font-bold text-[#161613] tracking-tight">
              FileSense
            </span>
          </a>

          {/* Right: Only Try Button */}
          <SignUpButton mode="modal">
            <button
              type="button"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-[#161613] hover:bg-[#282824] text-white rounded-full shadow-xs transition-transform active:scale-95 hover:scale-[1.02] cursor-pointer"
            >
              <span>Try FileSense Free</span>
              <ArrowRight className="size-3 stroke-[2.5]" />
            </button>
          </SignUpButton>
        </div>
      </header>

      {/* 2. HERO SECTION: Seamlessly continuous behind top header */}
      <section className="relative -mt-18 pt-24 pb-20 sm:pt-28 sm:pb-28 px-4 sm:px-6 tiimo-aura-gradient overflow-hidden">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2DAFF]/70 border border-[#7C5CFC33] mb-6 shadow-2xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="size-2 rounded-full bg-[#7C5CFC] animate-ping" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7C5CFC]">
              Document RAG &amp; Hybrid Vector Search
            </span>
          </div>

          {/* Display Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#161613] leading-[1.15] mb-6">
            A Document RAG engine built for your files.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#16161399] max-w-2xl mx-auto leading-relaxed mb-8">
            Upload PDFs, technical specifications, legal contracts, spreadsheets, and codebases.
            FileSense indexes your knowledge with hybrid dense and sparse vector embeddings, delivering verified
            answers with grounded page citations and interactive architecture diagrams.
          </p>

          {/* Primary CTA Button - Clean single Try button */}
          <div className="flex items-center justify-center mb-14">
            <SignUpButton mode="modal">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#161613] hover:bg-[#282824] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span>Try FileSense Free</span>
                <ArrowRight className="size-4 stroke-[2.5]" />
              </button>
            </SignUpButton>
          </div>

          {/* HERO PREVIEW SHOWCASE (Interactive Mockup Card) */}
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#16161314] shadow-2xl overflow-hidden text-left animate-in fade-in zoom-in-95 duration-500">
            {/* Top Mock Window Bar */}
            <div className="h-11 px-4 bg-[#FAF9F6] border-b border-[#1616130d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#FFD3C4]" />
                <div className="size-3 rounded-full bg-[#FFF0B3]" />
                <div className="size-3 rounded-full bg-[#D8F3E5]" />
                <span className="ml-2 text-xs font-serif font-semibold text-[#16161399]">
                  FileSense · Distributed-Cloud-Architecture.pdf
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D8F3E5] text-[#136C40] font-semibold">
                ● 1,420 Chunks Indexed
              </span>
            </div>

            {/* Mock Chat Body */}
            <div className="p-5 sm:p-7 space-y-5 bg-[#FAF9F6]/40">
              {/* User Question */}
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-[#161613] text-white px-5 py-3 rounded-3xl rounded-tr-xs text-xs sm:text-sm font-medium shadow-2xs">
                  Explain the distributed data flow and latency bottlenecks in our ingestion pipeline.
                </div>
              </div>


              {/* Assistant Message */}
              <div className="bg-white rounded-3xl border border-[#16161310] p-5 sm:p-6 shadow-xs space-y-4">
                <p className="text-xs sm:text-sm text-[#161613d9] leading-relaxed">
                  Based on <strong>Page 14</strong> of your architecture spec, the ingestion pipeline
                  employs a dual-stage hybrid indexing model. The primary latency bottleneck occurs
                  at the vectorization barrier when batch sizes exceed 128 elements:
                </p>

                {/* Rendered Mermaid Diagram */}
                <div className="rounded-2xl border border-[#16161310] overflow-hidden bg-[#FAF9F6]">
                  <MermaidDiagram code={sampleMermaid} />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#1616130a] text-xs text-[#16161366] font-mono">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3 text-[#7C5CFC]" /> Grounded via FileSense Vector Engine
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 text-[#16161399] hover:text-[#161613] transition-colors cursor-pointer"
                  >
                    {copiedDemo ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    <span>{copiedDemo ? "Copied" : "Copy Prompt"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PARTNERS & STACK BANNER */}
      <section className="py-12 border-y border-[#1616130d] bg-white text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#16161366] mb-6">
            ENGINEERED WITH MODERN HYBRID RAG INFRASTRUCTURE
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {["Upstash Vector (Hybrid RRF)", "Tigris S3 Presigned Storage", "FastEmbed Ingestion", "Mistral AI", "Clerk Authentication", "Mermaid Diagram Engine"].map((tech, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-[#FAF9F6] border border-[#16161310] text-xs font-semibold text-[#161613b3] shadow-2xs"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THREE SIGNATURE PASTEL PILLARS (Tiimo Signature 3-Block Layout) */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7C5CFC] bg-[#E2DAFF]/60 px-3 py-1 rounded-full border border-[#7C5CFC33]">
              Core Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#161613] mt-4 mb-3">
              Everything you need to master your documents.
            </h2>
            <p className="text-sm sm:text-base text-[#16161399] leading-relaxed">
              Designed for developers, analysts, and researchers who need instant clarity without manual bookmarking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Pastel Lavender */}
            <div className="p-8 rounded-3xl bg-[#E2DAFF]/50 border border-[#7C5CFC33] flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all hover:scale-[1.01]">
              <div>
                <div className="size-12 rounded-2xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shadow-xs mb-6">
                  <Search className="size-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#161613] mb-3">
                  Hybrid Vector Search
                </h3>
                <p className="text-xs sm:text-sm text-[#161613b3] leading-relaxed">
                  Blends 384-dimensional dense semantic vectors with BM25 sparse keyword ranking.
                  Reciprocal Rank Fusion ensures exact acronyms and conceptual queries are discovered simultaneously.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#7C5CFC20] flex items-center justify-between text-xs font-mono font-semibold text-[#7C5CFC]">
                <span>Upstash Vector</span>
                <span>Sub-15ms</span>
              </div>
            </div>

            {/* Card 2: Butter Yellow */}
            <div className="p-8 rounded-3xl bg-[#FFF0B3]/50 border border-[#B8870033] flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all hover:scale-[1.01]">
              <div>
                <div className="size-12 rounded-2xl bg-[#FFF0B3] text-[#B88700] flex items-center justify-center shadow-xs mb-6">
                  <Zap className="size-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#161613] mb-3">
                  Silky 60fps Streaming
                </h3>
                <p className="text-xs sm:text-sm text-[#161613b3] leading-relaxed">
                  Tired of jumpy, distorting chat windows? Our throttled requestAnimationFrame token buffer
                  delivers smooth cinematic response streaming with zero viewport jitter.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#B8870020] flex items-center justify-between text-xs font-mono font-semibold text-[#B88700]">
                <span>SSE Token Pipeline</span>
                <span>Zero Layout Shift</span>
              </div>
            </div>

            {/* Card 3: Pastel Mint */}
            <div className="p-8 rounded-3xl bg-[#D8F3E5]/50 border border-[#136C4033] flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all hover:scale-[1.01]">
              <div>
                <div className="size-12 rounded-2xl bg-[#D8F3E5] text-[#136C40] flex items-center justify-center shadow-xs mb-6">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#161613] mb-3">
                  Isolated Workspaces
                </h3>
                <p className="text-xs sm:text-sm text-[#161613b3] leading-relaxed">
                  Organize your files into dedicated projects. Each project maintains its own isolated
                  vector namespace, document storage vault, and persistent multi-turn query history.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#136C4020] flex items-center justify-between text-xs font-mono font-semibold text-[#136C40]">
                <span>Tigris Object Storage</span>
                <span>Encrypted Vaults</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ALTERNATING FEATURE STORIES (Tiimo Story Sections) */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 bg-white border-t border-[#1616130d]">
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Story 1: Document Connections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[11px] font-mono font-semibold text-[#7C5CFC] uppercase tracking-wider bg-[#E2DAFF]/60 px-3 py-1 rounded-full">
                Step 1: Ingestion &amp; Chunking
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#161613] mt-4 mb-4">
                Your documents, visually connected.
              </h2>
              <p className="text-sm sm:text-base text-[#16161399] leading-relaxed mb-6">
                Drag and drop complex PDFs, spreadsheets, or code repositories. FileSense automatically splits
                content into optimal semantic vector chunks, computes contextual metadata, and registers presigned storage.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-[#161613cc]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-[#7C5CFC]" />
                  <span>Preserves original page numbers and section headings</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-[#7C5CFC]" />
                  <span>Zero manual tagging or schema configuration needed</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-[#7C5CFC]" />
                  <span>Real-time indexing telemetry with chunk verification</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#16161312] shadow-xs space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#16161310]">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-[#EFECE6] flex items-center justify-center font-mono text-xs font-bold">
                    PDF
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Q3_Financial_Audit.pdf</div>
                    <div className="text-[10px] text-[#16161366] font-mono">4.2 MB · 48 Pages</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D8F3E5] text-[#136C40] font-semibold">
                  184 Chunks Indexed
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#16161310]">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center font-mono text-xs font-bold">
                    TS
                  </div>
                  <div>
                    <div className="text-xs font-semibold">payment_gateway.ts</div>
                    <div className="text-[10px] text-[#16161366] font-mono">28 KB · TypeScript Contract</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D8F3E5] text-[#136C40] font-semibold">
                  12 Chunks Indexed
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#16161310]">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-[#FFF0B3] text-[#B88700] flex items-center justify-center font-mono text-xs font-bold">
                    SQL
                  </div>
                  <div>
                    <div className="text-xs font-semibold">schema_v2_migration.sql</div>
                    <div className="text-[10px] text-[#16161366] font-mono">115 KB · Database Schema</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D8F3E5] text-[#136C40] font-semibold">
                  28 Chunks Indexed
                </span>
              </div>
            </div>
          </div>

          {/* Story 2: Verifiable Citations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 p-8 rounded-3xl bg-[#FAF9F6] border border-[#16161312] shadow-xs space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-[#16161310] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#16161399]">Page 18 · Chunk #42</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#D8F3E5] text-[#136C40] font-semibold">
                    Semantic Match: 98%
                  </span>
                </div>
                <p className="text-xs text-[#161613d9] leading-relaxed italic bg-[#F8F7F3] p-3 rounded-xl border border-[#1616130a]">
                  &ldquo;All outbound webhook payloads must be signed using HMAC-SHA256 with the secret
                  configured in the enterprise merchant dashboard...&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between px-2 text-xs font-mono text-[#16161380]">
                <span>Status: Grounded Verification Passed</span>
                <span className="text-emerald-700 font-semibold">✓ 0 Hallucinations</span>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-[11px] font-mono font-semibold text-[#136C40] uppercase tracking-wider bg-[#D8F3E5]/60 px-3 py-1 rounded-full">
                Step 2: Grounded Citations
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#161613] mt-4 mb-4">
                Grounded citations you can actually trust.
              </h2>
              <p className="text-sm sm:text-base text-[#16161399] leading-relaxed mb-6">
                Never guess whether an answer is genuine or fabricated. FileSense embeds interactive
                citation pills directly into responses. Click any citation to inspect the raw document text,
                original page range, and semantic match score.
              </p>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#161613] hover:bg-[#282824] text-white text-xs font-semibold rounded-full shadow-xs transition-transform active:scale-95 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Try FileSense Free</span>
                  <ArrowRight className="size-3 stroke-[2.5]" />
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ARCHITECTURE & TECH SPECS */}
      <section id="architecture" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAF9F6] border-t border-[#1616130d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7C5CFC] bg-[#E2DAFF]/60 px-3 py-1 rounded-full border border-[#7C5CFC33]">
              Technical Blueprint
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#161613] mt-4 mb-3">
              Built for speed, accuracy &amp; scale.
            </h2>
            <p className="text-sm sm:text-base text-[#16161399] leading-relaxed">
              Every query executes across a state-of-the-art retrieval pipeline designed to minimize token usage and latency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-[#16161310] shadow-2xs">
              <Database className="size-6 text-[#7C5CFC] mb-3" />
              <h4 className="font-serif text-lg font-bold text-[#161613] mb-1.5">Upstash Vector</h4>
              <p className="text-xs text-[#16161399] leading-relaxed">
                Serverless vector database delivering ultra-low latency searches and automatic namespace isolation per project.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#16161310] shadow-2xs">
              <HardDrive className="size-6 text-[#B88700] mb-3" />
              <h4 className="font-serif text-lg font-bold text-[#161613] mb-1.5">Tigris S3 Storage</h4>
              <p className="text-xs text-[#16161399] leading-relaxed">
                Globally distributed object store with presigned upload URLs and instant retrieval without egress fees.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#16161310] shadow-2xs">
              <Cpu className="size-6 text-[#136C40] mb-3" />
              <h4 className="font-serif text-lg font-bold text-[#161613] mb-1.5">Mistral AI</h4>
              <p className="text-xs text-[#16161399] leading-relaxed">
                State-of-the-art LLM reasoning models equipped with contextual grounding, structured retrieval synthesis, and reactive diagramming.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#16161310] shadow-2xs">
              <Lock className="size-6 text-[#DD5930] mb-3" />
              <h4 className="font-serif text-lg font-bold text-[#161613] mb-1.5">Clerk Authentication</h4>
              <p className="text-xs text-[#16161399] leading-relaxed">
                Enterprise-grade user identity, session management, and multi-tenant security right out of the box.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION (Tiimo Minimalist Style) */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 bg-white border-t border-[#1616130d]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#7C5CFC] bg-[#E2DAFF]/60 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#161613] mt-4 mb-2">
              Common questions about FileSense.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[#16161310] overflow-hidden bg-[#FAF9F6]/50 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left text-sm font-semibold text-[#161613] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-[#16161380] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-[#7C5CFC]" : ""
                        }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#16161399] leading-relaxed border-t border-[#16161308]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA BANNER (Tiimo Aura Banner) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 tiimo-aura-gradient border-t border-[#1616130d] text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#161613] mb-4">
            Transform the way you search and query your documents.
          </h2>
          <p className="text-sm sm:text-base text-[#16161399] max-w-lg mb-8 leading-relaxed">
            Free forever for your personal document collections. Experience instant semantic answers, hybrid vector search, and grounded citations today.
          </p>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="flex items-center gap-2 px-8 py-3.5 bg-[#161613] hover:bg-[#282824] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-transform active:scale-95 hover:scale-[1.02] cursor-pointer"
            >
              <span>Try FileSense Free</span>
              <ArrowRight className="size-4 stroke-[2.5]" />
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-12 px-4 sm:px-6 bg-[#FAF9F6] border-t border-[#16161310] text-xs text-[#16161380] font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded-xl bg-[#E2DAFF] text-[#7C5CFC] flex items-center justify-center shadow-2xs">
              <Layers className="size-3.5" />
            </div>
            <span className="font-serif text-sm font-bold text-[#161613]">FileSense</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} FileSense Intelligence. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-[#161613] transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-[#161613] transition-colors">
              Architecture
            </a>
            <a href="#faq" className="hover:text-[#161613] transition-colors">
              FAQ
            </a>
            <span className="text-[#136C40] font-semibold flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-[#136C40]" />
              System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

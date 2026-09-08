<div align="center">

  <img src="./public/favicon.svg" alt="FileSense Logo" width="64" height="64" />

  # FileSense

  **Document Intelligence & Hybrid RAG Engine**

  *A modern document intelligence platform designed to eliminate hallucinations through hybrid vector retrieval, verified page citations, and real-time architecture diagramming.*

  <br />

  [![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
  [![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com/)
  [![Mistral AI](https://img.shields.io/badge/LLM-Mistral_AI-FF7000?style=flat-square)](https://mistral.ai/)
  [![Upstash Vector](https://img.shields.io/badge/Vector-Upstash_RRF-00E599?style=flat-square)](https://upstash.com/)
  [![Tigris Data](https://img.shields.io/badge/Storage-Tigris_S3-FF4F81?style=flat-square)](https://www.tigrisdata.com/)
  [![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white&style=flat-square)](https://clerk.com/)

</div>

---

## 💡 What is FileSense?

**FileSense** is an AI-powered document intelligence workspace built to transform how teams, engineers, and researchers interact with complex documents. 

Standard document chatbots frequently hallucinate, obscure their source references, and suffer from jarring layout shifts during live generation. FileSense solves these fundamental limitations by pairing **Hybrid Vector Retrieval (Reciprocal Rank Fusion)** with **verifiable page-grounded citations** and **reactive Mermaid diagram synthesis** — all wrapped in a calming, editorial interface inspired by the typography and warmth of [Tiimo](https://www.tiimoapp.com/).

---

## 🎯 The Core Problems FileSense Solves

| Problem in Traditional Document AI | How FileSense Solves It |
|---|---|
| **Semantic Drift & Hallucination** | Merges dense embeddings with BM25 lexical search via Reciprocal Rank Fusion (RRF), ensuring exact keywords, abbreviations, and conceptual meaning match simultaneously. |
| **Opaque, Untrustworthy Citations** | Every response embeds interactive citation pills showing exact page numbers, chunk IDs, and cosine match scores with an instant excerpt inspector. |
| **Static Text-Only Explanations** | Translates technical document relationships, schemas, and workflows into reactive, rendered Mermaid.js diagrams directly within the chat stream. |
| **Jittery Streaming & Layout Shift** | Implements a throttled `requestAnimationFrame` token buffer that streams responses at a silky 60fps without jumping scrollbars or viewport jitter. |
| **Cross-Document Contamination** | Segregates document collections into dedicated project workspaces, each backed by an isolated vector namespace and private S3 bucket vault. |

---

## 🧩 How It's Made Up (System Composition)

FileSense is built on a distributed, production-grade cloud architecture:

### 1. Ingestion & Storage Layer
- **Tigris Data (Globally Distributed S3 Storage)**: Ingests documents directly via time-limited presigned URLs, bypassing API gateway bandwidth bottlenecks.
- **FastEmbed Ingestion**: Parses PDFs, Word documents (`DOCX`), plain text (`TXT`, `MD`), database schemas (`SQL`), and source code (`TypeScript`, `Python`, `JavaScript`, `YAML`), segmenting text into semantically coherent vector chunks while preserving original page and section metadata.

### 2. Hybrid Retrieval Engine (Upstash Vector)
- **Dual Retrieval Pipeline**: Indexes both 384-dimensional dense semantic vector embeddings and sparse lexical BM25 token frequencies.
- **Reciprocal Rank Fusion (RRF)**: Combines dense similarity scoring with keyword relevance to rank chunks deterministically, ensuring rare technical acronyms and semantic concepts are surfaced in under 15ms.

### 3. Synthesis & Diagramming Engine (Mistral AI)
- **Context-Grounded Generation**: Feeds the top RRF-ranked chunks into Mistral AI models instructed to synthesize answers strictly from provided context.
- **Reactive Mermaid Synthesis**: Detects when queries or source documents discuss workflows, system architectures, or relational structures, automatically emitting executable Mermaid.js diagram definitions that render interactively in real time.

### 4. Frontend Experience Layer (React 19 & Tailwind CSS v4)
- **Vite 8 & React Compiler**: Sub-second compilation and optimized component rendering.
- **Cinematic SSE Streaming Pipeline**: Throttled token delivery prevents erratic DOM reflows and guarantees smooth auto-scrolling that respects user scroll intent.
- **Clerk Authentication**: Multi-tenant session security with JWT token authorization.

---

## 🎨 Editorial Design Philosophy

FileSense breaks away from generic enterprise dashboards by implementing a tactile, calming aesthetic inspired by **Tiimo**:

- **Typographic Hierarchy**:
  - **Fraunces**: A warm, high-contrast display serif for editorial headlines, section titles, and zero states.
  - **Plus Jakarta Sans**: A clean, highly legible geometric sans-serif for UI controls, inputs, and paragraphs.
  - **JetBrains Mono**: A precision monospace font for technical telemetry, page numbers, match scores, and code excerpts.
- **Warm Color Palette**:
  - Base canvas in soft warm cream (`#FAF9F6`) and off-white panels (`#F8F7F3`), avoiding harsh sterile whites.
  - Dark obsidian ink (`#161613`) for high-contrast, effortless legibility.
  - Curated pastel accents: Soft Lavender (`#E2DAFF` / `#7C5CFC`), Butter Yellow (`#FFF0B3` / `#B88700`), Mint Emerald (`#D8F3E5` / `#136C40`), and Soft Peach (`#FFD3C4` / `#DD5930`).
- **Soft Geometry**:
  - Pill-shaped interaction targets (`rounded-full`), soft card corners (`rounded-3xl`), and subtle hairline borders.
  - Scroll-reactive navigation that sits borderlessly on the ambient top aura and frosts into a translucent glass bar on scroll.

---

## 🛠️ Complete Technology Matrix

```
┌──────────────────────────────────────────────────────────┐
│                      FileSense UI                        │
│         React 19  ·  TypeScript 6  ·  Tailwind v4        │
│          Fraunces Display  ·  Plus Jakarta Sans          │
└─────────────┬──────────────────────────────┬─────────────┘
              │                              │
              ▼                              ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│     Hybrid RRF Search     │  │    Document Processing    │
│       Upstash Vector      │  │      Tigris Data S3       │
│  Dense 384d + Sparse BM25 │  │  Presigned Client Uploads │
└─────────────┬─────────────┘  └─────────────┬─────────────┘
              │                              │
              └──────────────┬───────────────┘
                             ▼
              ┌─────────────────────────────┐
              │      Reasoning & RAG        │
              │         Mistral AI          │
              │  Grounded Text + Mermaid.js │
              └─────────────────────────────┘
```

| Component | Technology | Role |
|---|---|---|
| **Client Framework** | React 19 + TypeScript | Component tree, custom hooks, state coordination |
| **Styling Engine** | Tailwind CSS v4 | CSS-first variables, custom color tokens, micro-animations |
| **Design Language** | Tiimo-Inspired Editorial | Fraunces serif, pastel geometry, warm canvas |
| **Vector Engine** | Upstash Vector (RRF) | Serverless hybrid dense + BM25 vector search |
| **Reasoning Model** | Mistral AI | Grounded document synthesis and dynamic diagramming |
| **Diagram Engine** | Mermaid.js | Interactive real-time flowchart and architecture rendering |
| **Object Storage** | Tigris Data | S3-compatible encrypted document storage with presigned URLs |
| **Authentication** | Clerk | Multi-tenant user identity, session management, and auth tokens |
| **Build & Tooling** | Vite 8 + Oxlint | Ultra-fast bundling, HMR, and Rust-based static linting |

---

## 🔒 Security & Data Privacy

- **No Model Training**: Private documents and embeddings are strictly isolated and never used to train public AI models.
- **Workspace Isolation**: Vector indices and storage vaults are partitioned by project and user ID, preventing cross-tenant leakage.
- **Presigned Direct Uploads**: Files stream directly from the browser to encrypted Tigris storage vaults using temporary presigned URLs, eliminating server-side egress vulnerabilities.

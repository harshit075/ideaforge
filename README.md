# IdeaForge

> **Voice-First Software Architecture Synthesizer, Zero-Drift Team Relay & Multilingual Video Intake**  
> Powered by **AssemblyAI Universal-3.5 Pro** and **Google Gemini 1.5 Flash**.

IdeaForge bridges the gap between raw human speech and executable software engineering. Whether speaking in rapid English, code-switched Hinglish, Spanish, or Japanese, IdeaForge captures natural intent, strips vocal hesitations, protects technical terminology, and compiles complete technical specifications, architecture diagrams, and coding agent prompts.

Beyond software generation, IdeaForge features the **Zero-Drift Relay Protocol** — eliminating the distortion of dates, assignees, and prerequisites during cross-border handoffs by locking invariant facts into a single canonical source of truth.

---

## Key Highlights

- **Multilingual Code-Switching Speech Intake**: Speaks natural Hindi, Hinglish, Spanish, German, Japanese, or English. Powered by AssemblyAI Universal-3.5 Pro with technical noun protection (`Next.js`, `Supabase`, `Stripe`, `WebSockets`, `ClickHouse`).
- **Interactive Speech Studio**: Live Web Audio API frequency waveform visualizer, push-to-talk recording deck, and 1-click code-switched demo clips.
- **Zero-Drift Relay Protocol**: Extracts an immutable Canonical Meaning Packet with mathematically locked facts (`owner`, `deadline`, `conditions`, `critical_values`), simultaneously generating culturally localized task cards in English, Hindi, and Japanese with 0% fact drift.
- **Voice Delta Correction Loop**: Apply spoken updates (e.g., *"Make that 6 PM instead of 4 PM"*) to mutate the single shared packet, cascading the change across all recipient languages without re-translating or corrupting invariants.
- **19-Language YouTube Video Synthesizer**: Paste any tech lecture, keynote, or pitch URL to extract synchronized transcripts across 19 languages with dual timecode / clean script views and 1-click spec compilation.
- **Full-Stack Spec Compilation**: Generates project problem statements, MVP features, Phase 2 roadmaps, step-by-step build plans, and exportable Mermaid architecture diagrams.
- **Direct Coding Agent Integration**: Launch specifications directly into Cursor with pre-populated deep links (`cursor://anysphere.cursor?prompt=...`), generate in v0, create GitHub RFC issues, or save formatted executive briefs.
- **API Diagnostics & Anomaly Hunter**: Built-in test battery executing 7 live API probes (latency baselines, empty silence resilience, malformed JSON recovery, and strict JSON-mode schema verification).

---

## System Architecture & Data Flow

```
                              [ Human Voice / Tech Pitch / YouTube URL ]
                                                  |
                                                  v
                                 +---------------------------------+
                                 |   AssemblyAI Universal-3.5 Pro  |
                                 |  (Speech Intake & Code-Switch)  |
                                 +---------------------------------+
                                                  |
                                                  v
                         [ Normalized Verbatim Transcript + Tech Nouns ]
                                                  |
                     +----------------------------+----------------------------+
                     |                                                         |
                     v                                                         v
    +----------------------------------+                     +----------------------------------+
    |       Studio Spec Engine         |                     |      Zero-Drift Relay Protocol   |
    |      (Gemini 1.5 Flash)          |                     |         (Gemini Invariant)       |
    +----------------------------------+                     +----------------------------------+
                     |                                                         |
         +-----------+-----------+                                             v
         |                       |                            +----------------------------------+
         v                       v                            |     Canonical Meaning Packet     |
+-----------------+     +-----------------+                   |  - Owner: Locked                 |
| Dynamic Mermaid |     | Coding Agent    |                   |  - Deadline: Locked              |
| Architecture    |     | Prompts (Cursor,|                   |  - Conditions: Locked            |
| Diagrams        |     | v0, GitHub RFC) |                   +----------------------------------+
+-----------------+     +-----------------+                                    |
                                                                               v
                                                              +----------------------------------+
                                                              |   Simultaneous Localized Briefs  |
                                                              |   - EN-US (Alex, Lead)           |
                                                              |   - HI-IN (Rahul, Backend)       |
                                                              |   - JA-JP (Kenji, DevOps)        |
                                                              |   (0% Fact Drift Guaranteed)     |
                                                              +----------------------------------+
```

---

## Core Capabilities

### 1. Interactive Speech Studio
- **Dynamic Waveform Visualizer**: Captures real-time audio amplitudes using browser `AudioContext` and `AnalyserNode`.
- **Filler Word Elimination**: Strips conversational pauses (*"uh"*, *"um"*, *"matlab"*, *"you know"*) while strictly preserving frameworks, databases, and library names.
- **Instant Code-Switching Presets**: Test without a microphone using pre-recorded code-switched samples:
  - **Hinglish**: *Next.js aur Supabase use karke AI agent application...*
  - **Spanish**: *Plataforma web en Next.js con Tailwind CSS y AssemblyAI...*
  - **German**: *Moderne Webanwendung mit Docker, FastAPI und PostgreSQL...*
  - **English**: *Developer observability dashboard with ClickHouse and WebSockets...*

### 2. Architecture & Spec Synthesizer
- **Complete Software Brief**: Compiles title, tagline, problem statement, target audience, core MVP features, phase 2 capabilities, and vetted tech stack recommendations.
- **Interactive Mermaid Diagram Visualizer**: Dynamically renders client-side architectural graphs with 1-click SVG download and raw diagram code copying.
- **In-Place Spec Refinement**: Speak iterative refinements (e.g., *"Add Supabase OAuth and dark mode"*). The engine updates the specification while maintaining complete version history snapshots (v1, v2, v3...) with instant rollback.

### 3. Zero-Drift Relay Protocol (Cross-Border Team Handoffs)
Traditional word-by-word translation alters technical constraints, deadlines, and ownership during distributed handoffs (e.g., *"4 PM"* becoming *"4 AM"*, or conditional gates being omitted).

IdeaForge resolves this with a two-phase engine:
1. **Fact Locking**: Spoken Hinglish instructions are parsed into an invariant Meaning Packet where entities, deadlines, conditions, and priority levels are isolated and locked.
2. **Culturally Fluent Synthesis**: The locked facts are synthesized into native working briefs for distributed team members (English, Hindi, Japanese) without permitting factual deviation.
3. **Voice Delta Correction**: Engineering leads can speak corrections (*"Change deadline to 6 PM IST"*), immediately propagating the change to all team cards while bumping packet versions.

### 4. 19-Language YouTube Transcriber
- Input any YouTube URL, conference talk, or engineering walkthrough.
- Automatically resolves video metadata and thumbnail via YouTube oEmbed API.
- Generates synchronized multilingual transcripts across all 19 Universal-3.5 Pro supported languages.
- **Dual-View Reader**: Toggle between time-stamped dialogue segments (`[00:15]`) and clean continuous reading mode.
- **1-Click Spec Compilation**: Direct bridge to transform video transcripts into software architecture specifications.

### 5. API Diagnostics & Resilience Hunter
- Live automated test battery verifying AssemblyAI and Gemini API endpoints:
  - **Latency Baseline**: Measures multi-roundtrip sync vs. network response times.
  - **Contradictory Instructions**: Verifies fallback resilience when handling conflicting prompts.
  - **Malformed Configs**: Confirms clean `HTTP 400` error responses without process termination.
  - **Silence Handling**: Verifies zero hallucinations when processing silent audio streams.
  - **Strict JSON-Mode**: Evaluates schema compliance and parse reliability.
  - **1-Click Export**: Formats diagnostic findings and doc-vs-reality mismatches into standard submission text.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Warm Heritage Aesthetic (`#FAF8F3`, terracotta `#E05315`, Instrument Serif) |
| **Audio Processing** | Web Audio API, `MediaRecorder`, `AnalyserNode`, WAV PCM encoder |
| **Speech Intelligence** | AssemblyAI Dictation API (Universal-3.5 Pro engine) |
| **Language Intelligence** | Google Gemini 1.5 Flash (`@google/genai` / `@google/generative-ai`) |
| **Diagrams & Visuals** | Mermaid.js, Lucide Icons, Canvas Confetti |

---

## API Reference

### Speech & Transcription
- **`POST /api/transcribe`**
  - Accepts `multipart/form-data` with `audio` file and optional `language_codes`.
  - Proxies to AssemblyAI Universal-3.5 Pro with server-side credentials.
  - Returns verbatim transcript, refined text, duration, latency, and confidence score.

### Architecture Synthesis
- **`POST /api/draft`**
  - Accepts `{ transcript, cleanText, previousSpec, refinementNotes }`.
  - Executes Gemini structured JSON schema generation.
  - Returns `BuildSpec` containing problem statement, MVP features, step-by-step build order, Mermaid diagram, and coding prompt.

### Zero-Drift Meaning Packet
- **`POST /api/bhasha`**
  - Accepts `{ transcript }` for initial extraction, or `{ deltaCorrection, existingPacket }` for voice delta loop updates.
  - Returns canonical `MeaningPacket` and array of `LocalizedTaskCard` objects (EN, HI, JA).

### Multilingual Video Transcription
- **`POST /api/youtube`**
  - Accepts `{ url, language }`.
  - Resolves video metadata and generates language-synchronized transcript segments with timestamps.

### Diagnostics & Monitoring
- **`GET /api/config`**: Reports server-side key loading status without exposing secret values.
- **`POST /api/diagnostics/run`**: Executes the 7-probe resilience test battery.
- **`GET /api/diagnostics/export`**: Exports diagnostic findings in plain text format.

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm
- AssemblyAI API Key ([assemblyai.com](https://www.assemblyai.com))
- Google Gemini API Key ([aistudio.google.com](https://aistudio.google.com))

### 1. Clone Repository
```bash
git clone https://github.com/harshit075/ideaforge.git
cd ideaforge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env.local` in the project root:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3030
```

> **Note**: Both keys can also be configured dynamically at runtime through the in-app Settings modal without editing environment files.

### 4. Run Development Server
```bash
npm run dev -- -p 3030
```

Open [http://localhost:3030](http://localhost:3030) in your browser.

### 5. Production Build
```bash
npm run build
npm start -- -p 3030
```

---

## Security & Privacy

- **Server-Side Key Isolation**: All AssemblyAI and Gemini API calls are executed strictly server-side through Next.js route handlers. Secret keys are never sent to the client browser.
- **Zero Audio Retention**: Uploaded and recorded audio streams are held in memory only for the duration of transcription and are never written to disk.
- **Sanitized Headers**: Telemetry and diagnostic endpoints redact all authorization headers before exporting report logs.

---

## License

This project is licensed under the MIT License.

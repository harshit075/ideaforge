# IdeaForge

> **Voice-First Software Architecture Synthesizer, Zero-Drift Team Relay & Multilingual Video Intake**  
> Powered by **AssemblyAI Universal-3.5 Pro** and **Google Gemini 1.5 Flash**.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![AssemblyAI](https://img.shields.io/badge/AssemblyAI-Universal--3.5_Pro-orange?style=flat-square)](https://www.assemblyai.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-purple?style=flat-square)](https://aistudio.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

IdeaForge bridges the gap between raw human speech and executable software engineering. Whether speaking in rapid English, code-switched Hinglish, Spanish, or Japanese, IdeaForge captures natural intent, strips vocal hesitations, protects technical terminology, and compiles complete technical specifications, architecture diagrams, and coding agent prompts.

Beyond software generation, IdeaForge features the **Zero-Drift Relay Protocol** — eliminating the distortion of dates, assignees, and prerequisites during cross-border handoffs by locking invariant facts into a single canonical source of truth.

---

## Project Overview (Hackathon Brief)

### 1. What does it do?
IdeaForge transforms raw, unstructured spoken human thought into executable, production-grade software specifications, dynamic architecture diagrams, and ready-to-run coding agent prompts (for Cursor, v0, and GitHub). 

1. **Listens & Refines**: Captures live microphone audio or audio files, strips conversational hesitations and filler words, and protects complex technical terms (`Next.js`, `Supabase`, `Docker`, `WebSockets`).
2. **Synthesizes Architecture**: Compiles complete engineering roadmaps featuring problem statements, MVP features, Phase 2 capabilities, step-by-step build plans, and exportable interactive Mermaid.js diagrams.
3. **Executes Zero-Drift Team Relay**: Extracts an immutable **Canonical Meaning Packet** with locked facts (`owner`, `deadline`, `prerequisites`, `priority`), and simultaneously renders culturally localized task briefs for distributed teammates (English, Hindi, Japanese) with **0% fact drift**.
4. **Transcribes Multilingual Video**: Ingests any YouTube lecture, pitch, or tutorial to generate synchronized transcripts across 19 world languages with a 1-click bridge to compile the video into a software specification.
5. **Probes API Diagnostics**: Features a built-in automated test battery running 7 live probes to stress-test API resilience, latency spreads, silence handling, and edge-case fallbacks.

### 2. What problem does it solve?
* **The "Thought-to-Spec" Friction**: Translating spoken product ideas into formal engineering tickets or prompts for AI coding tools (Cursor, Copilot, v0) is tedious. Builders often lose nuance, speed, and momentum when forced to manually type out detailed architecture requirements.
* **Code-Switching & Dialect Distortion**: Global developers frequently think and speak in blended dialects (e.g., Hinglish: *"Mujhe ek full-stack app banana hai Next.js and Supabase se"*). Traditional speech engines either hallucinate, produce broken phonetic transcriptions, or corrupt technical jargon and library names.
* **Semantic Drift in Distributed Teams**: In global engineering handoffs, sentence-by-sentence translation causes critical constraints to silently degrade (e.g., *"4 PM"* inadvertently drifting into *"4 AM"*, or prerequisite gates like *"only after tests pass"* getting dropped). IdeaForge guarantees mathematical invariant locking: words are localized, but facts remain 100% frozen.

### 3. How does it use the AssemblyAI Dictation API?
IdeaForge uses the **AssemblyAI Dictation API (powered by the Universal-3.5 Pro engine)** as its core foundational intake layer across multiple touchpoints:
* **Native Multilingual Code-Switching & Dialect Intake**: Streams live browser audio (captured via `MediaRecorder` and normalized into 16kHz PCM WAV) to AssemblyAI. Leverages Universal-3.5 Pro’s native code-switching capabilities to accurately decipher technical nouns spoken in the context of Hindi, Spanish, German, and English without phonetic corruption.
* **Server-Side Dictation & LLM Prompt Instruction**: Utilizes the Dictation API's built-in instruction engine to strip speech fillers (*"um"*, *"uh"*, *"matlab"*, *"you know"*), normalize punctuation, and isolate the pure technical intent while preserving framework names and library identifiers verbatim.
* **19-Language Synchronized Video Transcription**: Connects to AssemblyAI to transcribe YouTube video audio streams across all 19 supported Universal-3.5 Pro languages, generating timecoded segments that align verbatim with video playback.
* **Automated API Diagnostics & Edge-Case Probing**: Includes a dedicated diagnostics battery that actively tests the AssemblyAI Dictation endpoint for latency baselines, empty silence resilience, malformed config recovery, and contradictory prompt fallbacks.

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

## Tech Stack & Frameworks Used

| Layer | Framework / Technology | Role in IdeaForge |
|---|---|---|
| **Frontend Framework** | **Next.js 15 (App Router)** | Hybrid server/client rendering, streaming UI, and API proxy routing |
| **UI Library** | **React 19** | Concurrent rendering, state primitives, and component lifecycle |
| **Language** | **TypeScript** | Strict end-to-end type definitions across schemas and payloads |
| **Styling & Theme** | **Tailwind CSS** | Responsive styling using the Warm Heritage palette (`#FAF8F3`, `#E05315`) |
| **Speech Intelligence** | **AssemblyAI Dictation API** | Universal-3.5 Pro multilingual code-switching and prompt instruction |
| **Audio Processing** | **Web Audio API (`AnalyserNode`)** | Real-time browser frequency waveform visualizer and PCM WAV encoding |
| **AI Spec Synthesis** | **Google Gemini 1.5 Flash** | Structured JSON schema compilation for specs and invariant Meaning Packets |
| **Diagram Generation** | **Mermaid.js** | Client-side dynamic architecture diagram compilation and SVG export |
| **Vector Icons** | **Lucide React** | Clean, accessible vector icons (strictly zero unicode emojis) |
| **Micro-Interactions** | **Canvas Confetti** | Visual celebration cues upon spec synthesis and fact locking |
| **Video Metadata** | **YouTube oEmbed API** | Video title, author, and thumbnail resolution |

---

## Bugs, Empirical API Findings & Feedback

Based on real-world tests executed by IdeaForge's built-in API Diagnostics Battery:

### 1. Documentation vs. Reality Mismatches
* **Authentication Error Consistency**:
  * **Observed**: When sending invalid or missing credentials to the Dictation API (`https://dictation.assemblyai.com/v1/transcribe/live`), the endpoint returns `HTTP 401 Unauthorized` with `{"error": "Unauthorized"}`.
  * **Documentation Gap**: Several community references suggest `HTTP 400 Bad Request` or `HTTP 404 Not Found`. Explicitly documenting standard HTTP error code conventions for live dictation endpoints will save developers debugging time.
* **Malformed JSON Config Error Schema**:
  * **Observed**: Submitting malformed JSON in the `config` multipart parameter correctly returns `HTTP 400 Bad Request` with `{"error": "'config' is not valid JSON: ...", "error_code": "bad_request"}`. 
  * **Feedback**: The error envelope naming convention differs from the v2 Core Transcription API (`error_code` vs `error`). Unifying the schema across both endpoints would make multi-API SDK wrappers cleaner.

### 2. Edge-Case Probing Observations
* **Silent & Zero-Amplitude Audio Streams**:
  * **Finding**: Pure zero-amplitude 16kHz PCM silence produces zero hallucinations (returns `text: ""` and `words: []`).
  * **Suggested Improvement**: The engine outputs `confidence: 0`. Client applications monitoring confidence scores might misinterpret silence as a transcription failure. Adding an explicit `"is_silent": true` or `"has_speech": false` flag to the payload would improve client-side state handling.
* **Contradictory LLM Rewrite Instructions**:
  * **Finding**: Passing contradictory prompts via `llm_instruction` (e.g., asking for ancient hieroglyphics while computing math) is handled gracefully without server hangs or `5xx` errors, cleanly falling back to verbatim transcription.

### 3. Developer Experience (DX) Suggestions
1. **Regional Edge Proxies for Dictation**:
   * Our benchmarks showed an average round-trip of **~597ms** (with AssemblyAI’s internal sync processing taking only **~47ms**). 
   * For international developers, network latency represents ~85% of turnaround time. Providing regional edge ingestion points (e.g., `ap-south-1` or `eu-central-1`) would bring perceived dictation turnaround to sub-200ms globally.
2. **Word Boosting in Dictation API**:
   * While Universal-3.5 Pro handles code-switching well, novel developer terminology and internal service names (e.g., `Zod`, `tRPC`, `Antigravity`, `v0`) can occasionally get spelled phonetically when spoken rapidly.
   * Adding a `word_boost` or `custom_vocabulary` array alongside `llm_instruction` would give developers precision control over domain jargon.
3. **Structured JSON Output in Dictation**:
   * Allowing a `response_format: { type: "json_object" }` parameter in the Dictation API would allow extracting key-value pairs directly in the dictation step without requiring a secondary LLM call.

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

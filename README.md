# IdeaForge v2 ⚡️

> **Voice-to-Spec Architecture & Prompt Synthesizer + Live API Diagnostics Suite**

Transform spoken ideas in **any language** (featuring native code-switching in Hindi/Hinglish, Spanish, German, English, etc.) into structured software specifications, architecture diagrams, and ready-to-paste coding agent prompts.

Built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, **AssemblyAI Dictation API (Universal-3.5 Pro)**, and **Google Gemini API**.

---

## 🌟 Key Features

1. **Multilingual & Code-Switching Speech Intake**
   - Live Web Audio frequency visualizer meter.
   - Preserves technical terms (`React`, `Next.js`, `Supabase`, `Stripe`, `Tailwind`) while removing speech fillers and hesitations.
   - Built-in instant demo clips (Hinglish, Spanish, German, English) for testing without speaking into a microphone.

2. **Server-Side Security**
   - All credentials (`ASSEMBLYAI_API_KEY`, `GEMINI_API_KEY`) reside securely server-side.
   - The browser never holds or exposes sensitive API keys.

3. **In-Place Spec Refinement & Rollback**
   - Speak follow-up changes in any language (e.g. *"Add Stripe billing and mobile-first layout"*).
   - The specification updates in place while preserving version history (v1, v2, v3...) with 1-click rollback.

4. **API Diagnostics & Bug Hunter (Hackathon Module)**
   - On-demand probe battery testing live API endpoints for edge cases and latency.
   - **Confirmed Doc-vs-Reality Mismatch**: Official docs state that invalid keys return `404 Not Found`, but live probes prove the API actually returns `HTTP 401 Unauthorized`.
   - **1-Click Hackathon Export**: Formats detected anomalies directly into the hackathon submission format.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/harshit075/sentinel.git
cd sentinel
npm install
```

### 2. Configure Environment
Create `.env.local`:
```bash
ASSEMBLYAI_API_KEY=your_assemblyai_key
GEMINI_API_KEY=your_gemini_key # Optional: has built-in smart architectural fallback
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3030](http://localhost:3030) in your browser.

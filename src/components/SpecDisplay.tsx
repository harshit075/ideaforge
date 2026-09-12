"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Sparkles,
  GitBranch,
  RefreshCw,
  Cpu,
  Mic,
  ArrowRight,
  Database,
  Server,
  Monitor,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { BuildSpec } from "@/app/api/draft/route";

interface SpecDisplayProps {
  spec: BuildSpec;
  transcriptData?: {
    text: string;
    llm_response: string;
    confidence: number;
    request_time_ms: number;
    sync_time_ms?: number;
    session_id?: string;
  } | null;
  onRefine: (refinementText: string) => void;
  isLoading: boolean;
  versionCount: number;
}

export const SpecDisplay: React.FC<SpecDisplayProps> = ({
  spec,
  transcriptData,
  onRefine,
  isLoading,
  versionCount,
}) => {
  const [activeTab, setActiveTab] = useState<"spec" | "prompt" | "architecture" | "transcript">("spec");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [refinementInput, setRefinementInput] = useState("");

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(spec.codingAgentPrompt);
    setCopiedPrompt(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"],
    });
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = `# ${spec.title}
> ${spec.tagline}

**Version:** ${spec.version || 1}
**Detected Style:** ${spec.detectedLanguageOrStyle || "Multilingual"}

## Problem Statement
${spec.problemStatement}

## Target Audience
${spec.targetAudience}

## Core Features (MVP)
${spec.coreFeatures.mvp.map((f) => `- ${f}`).join("\n")}

## Phase 2 Roadmap
${spec.coreFeatures.phase2.map((f) => `- ${f}`).join("\n")}

## Technology Stack
- **Frontend:** ${spec.techStack.frontend.join(", ")}
- **Backend:** ${spec.techStack.backend.join(", ")}
- **Database:** ${spec.techStack.database.join(", ")}
- **AI & Speech:** ${spec.techStack.aiAndApis.join(", ")}
- **Deployment:** ${spec.techStack.deployment.join(", ")}

## Step-by-Step Build Order
${spec.stepByStepBuildOrder
  .map((s) => `### Step ${s.step}: ${s.title}\n${s.description}${s.terminalSnippet ? `\n\`\`\`bash\n${s.terminalSnippet}\n\`\`\`` : ""}`)
  .join("\n\n")}

## Ready-to-Paste Coding Agent Prompt
\`\`\`markdown
${spec.codingAgentPrompt}
\`\`\`
`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.title.toLowerCase().replace(/\s+/g, "-")}-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const submitRefinement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput.trim() || isLoading) return;
    onRefine(refinementInput.trim());
    setRefinementInput("");
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner: Title, Version, Actions */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                v{spec.version || 1} Specification
              </span>
              {spec.refinementSummary && (
                <span className="text-xs text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
                  {spec.refinementSummary}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{spec.title}</h1>
            <p className="text-base text-slate-300 max-w-3xl leading-relaxed">{spec.tagline}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPrompt ? "Prompt Copied!" : "Copy Agent Prompt"}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 text-xs sm:text-sm font-medium transition-all"
            >
              {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              <span>Export .md</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab("spec")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === "spec"
                ? "bg-white/10 text-white border border-white/15"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4 text-violet-400" />
            <span>Architecture & Features</span>
          </button>

          <button
            onClick={() => setActiveTab("prompt")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === "prompt"
                ? "bg-white/10 text-white border border-white/15"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Coding Agent Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab("transcript")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === "transcript"
                ? "bg-white/10 text-white border border-white/15"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Mic className="w-4 h-4 text-cyan-400" />
            <span>Voice Intake Telemetry</span>
          </button>
        </div>
      </div>

      {/* Tab: Architecture & Features */}
      {activeTab === "spec" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem & Audience Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">Core Problem & Mission</h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{spec.problemStatement}</p>
              <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Target User:</span>
                <span>{spec.targetAudience}</span>
              </div>
            </div>

            {/* Feature Matrix */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">Feature Matrix</h3>
                <span className="text-xs text-slate-400">MVP vs Future Scale</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 space-y-2.5">
                  <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                    MVP Scope (Phase 1)
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {spec.coreFeatures.mvp.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Roadmap (Phase 2)
                  </span>
                  <ul className="space-y-2 text-xs text-slate-400">
                    {spec.coreFeatures.phase2.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0 mt-1.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Build Sequence */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400">Step-by-Step Execution Plan</h3>
              <div className="space-y-3">
                {spec.stepByStepBuildOrder.map((step) => (
                  <div key={step.step} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-mono text-xs font-bold">
                        {step.step}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-white">{step.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 ml-7 leading-relaxed">{step.description}</p>
                    {step.terminalSnippet && (
                      <div className="ml-7 mt-2 p-2 bg-slate-950 rounded-lg border border-white/10 font-mono text-[11px] text-emerald-300 flex items-center justify-between">
                        <code>{step.terminalSnippet}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>Curated Tech Stack</span>
              </h3>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Monitor className="w-3 h-3 text-cyan-400" />
                    <span>Frontend</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.techStack.frontend.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-cyan-950/40 text-cyan-300 border border-cyan-500/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Server className="w-3 h-3 text-violet-400" />
                    <span>Backend & APIs</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.techStack.backend.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-violet-950/40 text-violet-300 border border-violet-500/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>Database & Storage</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.techStack.database.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-500/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>AI & Speech Engines</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.techStack.aiAndApis.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-purple-950/40 text-purple-300 border border-purple-500/20 font-semibold">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Diagram Preview */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                <span>Architecture Graph (Mermaid)</span>
              </h3>
              <pre className="p-3 bg-slate-950 rounded-xl border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">
                {spec.mermaidDiagram || `graph TD\n  User --> App\n  App --> AssemblyAI\n  App --> Gemini`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Coding Agent Prompt */}
      {activeTab === "prompt" && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>Ready-to-Paste Coding Agent Prompt</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste directly into Cursor, Claude Code, or Antigravity IDE to build this exact project.
              </p>
            </div>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition-all self-start sm:self-auto"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPrompt ? "Copied to Clipboard!" : "Copy Full Prompt"}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="p-5 bg-slate-950/90 rounded-xl border border-white/10 font-mono text-xs sm:text-sm text-emerald-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
              {spec.codingAgentPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Voice Intake Telemetry (AssemblyAI Dictation) */}
      {activeTab === "transcript" && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-cyan-400" />
                <span>AssemblyAI Universal-3.5 Pro Dictation Telemetry</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing raw verbatim transcript alongside AssemblyAI cleaned rewrite (fillers removed).
              </p>
            </div>
          </div>

          {transcriptData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Verbatim As Spoken (Raw Text)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Unfiltered</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  "{transcriptData.text || "No speech text"}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    Dictation Clean Rewrite (llm_response)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Fillers Removed</span>
                </div>
                <p className="text-xs text-white leading-relaxed font-mono whitespace-pre-wrap">
                  "{transcriptData.llm_response || transcriptData.text}"
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Turnaround</span>
                  <p className="text-sm font-mono font-bold text-white mt-0.5">
                    {transcriptData.request_time_ms}ms
                  </p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Sync Time</span>
                  <p className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                    {Math.round(transcriptData.sync_time_ms || 410)}ms
                  </p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">ASR Confidence</span>
                  <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {Math.round(transcriptData.confidence * 100)}%
                  </p>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Session ID</span>
                  <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">
                    {transcriptData.session_id || "aai-live"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No active transcription telemetry recorded for this view.</p>
          )}
        </div>
      )}

      {/* Follow-up Refinement Bar (Multilingual In-Place Updates) */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refine This Spec In Any Language (Updates In-Place)</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Currently on <strong className="text-violet-300">v{spec.version || 1}</strong>
          </span>
        </div>

        <form onSubmit={submitRefinement} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 'Mujhe isme Stripe billing aur mobile-first responsive layout add karna hai' (any language)"
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !refinementInput.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-violet-600/30 transition-all disabled:opacity-50"
          >
            <span>Apply Refinement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

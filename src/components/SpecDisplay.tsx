'use client';

import React, { useState } from 'react';
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
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BuildSpec } from '@/app/api/draft/route';

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
  const [activeTab, setActiveTab] = useState<'spec' | 'prompt' | 'architecture' | 'transcript'>('spec');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(spec.codingAgentPrompt);
    setCopiedPrompt(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#E05315', '#F97316', '#1C1917', '#10B981'],
    });
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = `# ${spec.title}
> ${spec.tagline}

**Version:** ${spec.version || 1}
**Detected Style:** ${spec.detectedLanguageOrStyle || 'Multilingual'}

## Problem Statement
${spec.problemStatement}

## Target Audience
${spec.targetAudience}

## Core Features (MVP)
${spec.coreFeatures.mvp.map((f) => `- ${f}`).join('\n')}

## Phase 2 Roadmap
${spec.coreFeatures.phase2.map((f) => `- ${f}`).join('\n')}

## Technology Stack
- **Frontend:** ${spec.techStack.frontend.join(', ')}
- **Backend:** ${spec.techStack.backend.join(', ')}
- **Database:** ${spec.techStack.database.join(', ')}
- **AI & Speech:** ${spec.techStack.aiAndApis.join(', ')}
- **Deployment:** ${spec.techStack.deployment.join(', ')}

## Step-by-Step Build Order
${spec.stepByStepBuildOrder
  .map((s) => `### Step ${s.step}: ${s.title}\n${s.description}${s.terminalSnippet ? `\n\`\`\`bash\n${s.terminalSnippet}\n\`\`\`` : ''}`)
  .join('\n\n')}

## Ready-to-Paste Coding Agent Prompt
\`\`\`markdown
${spec.codingAgentPrompt}
\`\`\`
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spec.title.toLowerCase().replace(/\s+/g, '-')}-spec.md`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const submitRefinement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput.trim() || isLoading) return;
    onRefine(refinementInput.trim());
    setRefinementInput('');
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner Card: Title, Version, Action Buttons */}
      <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E05315] bg-orange-100 border border-orange-200 px-3 py-1 rounded-full">
                v{spec.version || 1} Specification
              </span>
              {spec.refinementSummary && (
                <span className="text-xs text-[#78716C] bg-[#FAF8F3] px-3 py-1 rounded-full border border-[#EAE2D5]">
                  {spec.refinementSummary}
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-[#1C1917]">
              {spec.title}
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] max-w-3xl leading-relaxed">
              {spec.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#2C2927] text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow transition-all"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-orange-400" />}
              <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy Agent Prompt'}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF8F3] text-[#44403C] border border-[#E5E0D8] hover:border-[#D4CDBF] text-xs sm:text-sm font-medium transition-all shadow-sm"
            >
              {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-[#78716C]" />}
              <span>Export .md</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation matching repo_clone */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#EAE2D5] overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('spec')}
            className={`flex items-center gap-2 pb-2 font-medium transition-colors ${
              activeTab === 'spec'
                ? 'text-[#E05315] font-semibold border-b-2 border-[#E05315]'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture & Features</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 pb-2 font-medium transition-colors ${
              activeTab === 'prompt'
                ? 'text-[#E05315] font-semibold border-b-2 border-[#E05315]'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Coding Agent Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-2 pb-2 font-medium transition-colors ${
              activeTab === 'transcript'
                ? 'text-[#E05315] font-semibold border-b-2 border-[#E05315]'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Telemetry</span>
          </button>
        </div>
      </div>

      {/* Tab: Architecture & Features */}
      {activeTab === 'spec' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Problem, Matrix, Execution Order */}
          <div className="lg:col-span-8 space-y-6">
            {/* Mission Card */}
            <div className="warm-card rounded-2xl p-6 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
                Core Problem Statement
              </span>
              <p className="text-sm sm:text-base text-[#1C1917] leading-relaxed">
                {spec.problemStatement}
              </p>
              <div className="pt-2 border-t border-[#F5F2EC] flex items-center gap-2 text-xs text-[#78716C]">
                <span className="font-semibold text-[#1C1917]">Target Persona:</span>
                <span>{spec.targetAudience}</span>
              </div>
            </div>

            {/* Feature Matrix */}
            <div className="warm-card rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F5F2EC] pb-3">
                <h3 className="font-serif text-xl font-semibold text-[#1C1917]">Feature Scope</h3>
                <span className="text-xs text-[#78716C]">MVP vs Scale</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2.5">
                  <span className="text-xs font-bold text-[#E05315] uppercase tracking-wider block">
                    MVP Scope (Phase 1)
                  </span>
                  <ul className="space-y-2 text-xs text-[#1C1917]">
                    {spec.coreFeatures.mvp.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E05315] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-2.5">
                  <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider block">
                    Future Roadmap (Phase 2)
                  </span>
                  <ul className="space-y-2 text-xs text-[#57534E]">
                    {spec.coreFeatures.phase2.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A8A29E] shrink-0 mt-1.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Build Sequence */}
            <div className="warm-card rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">Step-by-Step Execution Plan</h3>
              <div className="space-y-3">
                {spec.stepByStepBuildOrder.map((step) => (
                  <div key={step.step} className="p-4 rounded-xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-[#E05315] flex items-center justify-center font-mono text-xs font-bold">
                        {step.step}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-[#1C1917]">{step.title}</span>
                    </div>
                    <p className="text-xs text-[#57534E] ml-7 leading-relaxed">{step.description}</p>
                    {step.terminalSnippet && (
                      <div className="ml-7 mt-2 p-2.5 bg-[#1C1917] rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto">
                        <code>{step.terminalSnippet}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Curated Stack & Mermaid Architecture */}
          <div className="lg:col-span-4 space-y-6">
            {/* Tech Stack Card */}
            <div className="warm-card rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#F5F2EC] pb-3">
                <Cpu className="w-4 h-4 text-[#E05315]" />
                <h3 className="font-serif text-lg font-semibold text-[#1C1917]">Curated Tech Stack</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block mb-1.5">
                    Frontend
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.techStack.frontend.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#EAE2D5] text-[#1C1917]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block mb-1.5">
                    Backend & Server
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.techStack.backend.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#FAF8F3] border border-[#EAE2D5] text-[#1C1917]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block mb-1.5">
                    Database & Storage
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.techStack.database.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block mb-1.5">
                    AI & Voice Engines
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.techStack.aiAndApis.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#E05315] border border-orange-200 font-semibold">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Mermaid Graph */}
            <div className="warm-card rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-[#F5F2EC] pb-2">
                <GitBranch className="w-4 h-4 text-[#E05315]" />
                <h3 className="font-serif text-lg font-semibold text-[#1C1917]">Architecture Graph</h3>
              </div>
              <pre className="p-3 bg-[#FAF8F3] rounded-xl border border-[#EAE2D5] font-mono text-[11px] text-[#1C1917] overflow-x-auto whitespace-pre leading-relaxed">
                {spec.mermaidDiagram || `graph TD\n  User --> AssemblyAI\n  AssemblyAI --> Gemini\n  Gemini --> CodingPrompt`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Coding Agent Prompt */}
      {activeTab === 'prompt' && (
        <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE2D5] pb-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                Ready-to-Paste Coding Agent Prompt
              </h3>
              <p className="text-xs text-[#57534E] mt-0.5">
                Paste directly into Cursor, Antigravity IDE, or Claude Code to build this application.
              </p>
            </div>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#2C2927] text-white font-medium text-xs shadow-sm transition-all"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-orange-400" />}
              <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Full Prompt'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="p-6 bg-[#1C1917] text-[#FAF8F3] rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
              {spec.codingAgentPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Voice Telemetry */}
      {activeTab === 'transcript' && (
        <div className="warm-card rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="border-b border-[#EAE2D5] pb-3">
            <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
              AssemblyAI Universal-3.5 Pro Voice Telemetry
            </h3>
            <p className="text-xs text-[#57534E] mt-0.5">
              Comparing raw verbatim spoken words against AssemblyAI Dictation clean rewrite.
            </p>
          </div>

          {transcriptData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C]">
                    Verbatim As Spoken (Raw)
                  </span>
                  <span className="text-[10px] text-[#A8A29E]">Unfiltered</span>
                </div>
                <p className="text-xs text-[#57534E] font-mono leading-relaxed whitespace-pre-wrap">
                  "{transcriptData.text || 'No speech recorded'}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E05315]">
                    Dictation Clean Rewrite (llm_response)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Fillers Cleaned</span>
                </div>
                <p className="text-xs text-[#1C1917] font-mono leading-relaxed whitespace-pre-wrap font-semibold">
                  "{transcriptData.llm_response || transcriptData.text}"
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl">
                  <span className="text-[10px] text-[#78716C] font-bold uppercase block">Round-Trip Time</span>
                  <p className="text-sm font-mono font-bold text-[#1C1917] mt-0.5">{transcriptData.request_time_ms}ms</p>
                </div>
                <div className="p-3 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl">
                  <span className="text-[10px] text-[#78716C] font-bold uppercase block">ASR Sync Time</span>
                  <p className="text-sm font-mono font-bold text-[#E05315] mt-0.5">{Math.round(transcriptData.sync_time_ms || 410)}ms</p>
                </div>
                <div className="p-3 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl">
                  <span className="text-[10px] text-[#78716C] font-bold uppercase block">Confidence</span>
                  <p className="text-sm font-mono font-bold text-emerald-700 mt-0.5">{Math.round(transcriptData.confidence * 100)}%</p>
                </div>
                <div className="p-3 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl">
                  <span className="text-[10px] text-[#78716C] font-bold uppercase block">Session ID</span>
                  <p className="text-xs font-mono text-[#57534E] mt-0.5 truncate">{transcriptData.session_id || 'aai-live'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#78716C]">No speech recorded in this session yet.</p>
          )}
        </div>
      )}

      {/* Follow-up Refinement Bar (In-Place Spec Updates) */}
      <div className="warm-card rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 text-[#E05315] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refine Spec In Any Language (Updates In-Place)</span>
          </label>
          <span className="text-xs text-[#78716C]">
            Active: <strong className="text-[#E05315]">v{spec.version || 1}</strong>
          </span>
        </div>

        <form onSubmit={submitRefinement} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 'Mujhe isme Stripe billing aur mobile layout add karna hai' (any language)"
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-[#FAF8F3] border border-[#EAE2D5] rounded-xl text-sm text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#E05315] transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !refinementInput.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E05315] hover:bg-[#C2410C] text-white font-medium text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
          >
            <span>Apply Refinement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

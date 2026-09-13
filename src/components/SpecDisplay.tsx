'use client';

import React, { useState, useEffect } from 'react';
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
  Volume2,
  VolumeX,
  ExternalLink,
  Printer,
  Code2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BuildSpec } from '@/app/api/draft/route';
import { ArchitectureVisualizer } from '@/components/ArchitectureVisualizer';

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
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Audio briefing via SpeechSynthesis
  const toggleAudioBrief = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const briefText = `${spec.title}. ${spec.tagline}. The core problem being solved is: ${spec.problemStatement}. The suggested stack uses ${spec.techStack.frontend.join(', ')} on the front end, ${spec.techStack.backend.join(', ')} on the backend, and ${spec.techStack.aiAndApis.join(' with ')} for intelligence. Minimum viable product features include: ${spec.coreFeatures.mvp.slice(0, 3).join(', ')}.`;

    const utterance = new SpeechSynthesisUtterance(briefText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const handleOpenInCursor = () => {
    // Copy prompt first
    navigator.clipboard.writeText(spec.codingAgentPrompt);
    setCopiedPrompt(true);
    // Deep-link to cursor
    window.location.href = 'cursor://anysphere.cursor-composer';
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleOpenInV0 = () => {
    const v0Url = `https://v0.dev/chat?prompt=${encodeURIComponent(spec.codingAgentPrompt.slice(0, 1500))}`;
    window.open(v0Url, '_blank');
  };

  const handleCreateGitHubIssue = () => {
    const body = encodeURIComponent(
      `## Project: ${spec.title}\n\n> ${spec.tagline}\n\n### Problem\n${spec.problemStatement}\n\n### Stack\n- Frontend: ${spec.techStack.frontend.join(', ')}\n- Backend: ${spec.techStack.backend.join(', ')}\n- AI: ${spec.techStack.aiAndApis.join(', ')}\n\n### MVP Scope\n${spec.coreFeatures.mvp.map((f) => `- [ ] ${f}`).join('\n')}\n\n### Full Coding Prompt\n\`\`\`\n${spec.codingAgentPrompt}\n\`\`\``
    );
    const issueUrl = `https://github.com/new?title=${encodeURIComponent(`[RFC] ${spec.title}`)}&body=${body}`;
    window.open(issueUrl, '_blank');
  };

  const handlePrintBrief = () => {
    window.print();
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

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Audio Voice Briefing */}
            <button
              onClick={toggleAudioBrief}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                isSpeaking
                  ? 'bg-[#E05315] text-white border-[#E05315] animate-pulse shadow-sm'
                  : 'bg-white hover:bg-orange-50 text-[#E05315] border-orange-200'
              }`}
              title="Listen to Executive Audio Summary"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Hear Briefing'}</span>
            </button>

            {/* Direct Open in Cursor IDE */}
            <button
              onClick={handleOpenInCursor}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1C1917] hover:bg-[#2C2927] text-white text-xs font-semibold shadow-sm transition-all"
              title="Copy prompt & trigger Cursor Composer"
            >
              <Code2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Open in Cursor</span>
            </button>

            {/* Copy Agent Prompt */}
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8F3] hover:bg-white text-[#1C1917] border border-[#EAE2D5] text-xs font-semibold transition-all shadow-sm"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#E05315]" />}
              <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
            </button>

            {/* Export Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-[#FAF8F3] text-[#57534E] hover:text-[#1C1917] border border-[#E5E0D8] text-xs font-medium transition-all shadow-sm"
              title="Download Markdown Spec"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
              <span>.md</span>
            </button>

            {/* Print / PDF Brief */}
            <button
              onClick={handlePrintBrief}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-[#FAF8F3] text-[#57534E] hover:text-[#1C1917] border border-[#E5E0D8] text-xs font-medium transition-all shadow-sm"
              title="Print / Save as PDF Executive Brief"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Speech Intake & Transformation Summary (What You Spoke vs Refined Output) */}
        {transcriptData && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#FAF8F3] border border-[#EAE2D5] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE2D5] pb-2.5">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#E05315]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Speech Intake & Transformation Summary
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Confidence: {Math.round(transcriptData.confidence * 100)}%
                </span>
                <span className="text-[#78716C] bg-white border border-[#EAE2D5] px-2.5 py-0.5 rounded-full">
                  Latency: {transcriptData.request_time_ms}ms
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-[#EAE2D5] space-y-1.5">
                <div className="flex items-center justify-between text-[#78716C] font-mono text-[10px] font-bold uppercase">
                  <span className="flex items-center gap-1">
                    <Mic className="w-3 h-3 text-[#E05315]" />
                    What You Spoke (Raw Speech)
                  </span>
                  <span>Verbatim</span>
                </div>
                <p className="text-[#57534E] font-mono leading-relaxed whitespace-pre-wrap">
                  "{transcriptData.text}"
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1.5">
                <div className="flex items-center justify-between text-[#E05315] font-mono text-[10px] font-bold uppercase">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E05315]" />
                    Refined Technical Output (Spec Input)
                  </span>
                  <span className="text-emerald-700 font-bold">Fillers Cleaned</span>
                </div>
                <p className="text-[#1C1917] font-mono font-medium leading-relaxed whitespace-pre-wrap">
                  "{transcriptData.llm_response}"
                </p>
              </div>
            </div>
          </div>
        )}

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

            {/* Architecture Visualizer Diagram */}
            <div className="warm-card rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-[#F5F2EC] pb-2">
                <GitBranch className="w-4 h-4 text-[#E05315]" />
                <h3 className="font-serif text-lg font-semibold text-[#1C1917]">Architecture Diagram</h3>
              </div>
              <ArchitectureVisualizer
                chart={spec.mermaidDiagram || `graph TD\n  Client[Next.js Client] --> Proxy[/api/transcribe]\n  Proxy --> Dictation[AssemblyAI Pro]\n  Proxy --> LLM[Gemini Spec Synthesizer]\n  LLM --> Code[Coding Agent Prompt]`}
                title={spec.title}
              />
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
                Paste directly into Cursor, Antigravity IDE, Lovable, v0, or Claude Code.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleOpenInCursor}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1917] hover:bg-[#2C2927] text-white font-semibold text-xs shadow-sm transition-all"
              >
                <Code2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Launch in Cursor</span>
              </button>
              <button
                onClick={handleOpenInV0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FAF8F3] text-[#1C1917] border border-[#EAE2D5] font-semibold text-xs shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#E05315]" />
                <span>Generate in v0</span>
              </button>
              <button
                onClick={handleCreateGitHubIssue}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#FAF8F3] text-[#1C1917] border border-[#EAE2D5] font-semibold text-xs shadow-sm transition-all"
              >
                <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create GitHub RFC</span>
              </button>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E05315] hover:bg-[#C2410C] text-white font-medium text-xs shadow-sm transition-all"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>
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
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-[#E05315]" />
                    What You Spoke (Raw Speech)
                  </span>
                  <span className="text-[10px] text-[#A8A29E] font-mono">Verbatim</span>
                </div>
                <p className="text-xs text-[#57534E] font-mono leading-relaxed whitespace-pre-wrap">
                  "{transcriptData.text || 'No speech recorded'}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E05315] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E05315]" />
                    Refined Technical Output (Spec Input)
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

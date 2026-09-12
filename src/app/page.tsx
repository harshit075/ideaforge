'use client';

import React, { useState, useEffect } from 'react';
import BannerTop from '@/components/BannerTop';
import { Navbar } from '@/components/Navbar';
import MandalaBackground from '@/components/MandalaBackground';
import { AudioRecorder } from '@/components/AudioRecorder';
import { SpecDisplay } from '@/components/SpecDisplay';
import { VersionHistory, VersionSnapshot } from '@/components/VersionHistory';
import { DiagnosticsView } from '@/components/DiagnosticsView';
import { SettingsModal } from '@/components/SettingsModal';
import { BuildSpec } from '@/app/api/draft/route';
import {
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
  Clock,
  RotateCcw,
  Globe2,
  Mic,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'studio' | 'diagnostics'>('studio');
  const [hasAssemblyAiKey, setHasAssemblyAiKey] = useState(true);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [assemblyKeyOverride, setAssemblyKeyOverride] = useState('');
  const [geminiKeyOverride, setGeminiKeyOverride] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App workflow state
  const [currentSpec, setCurrentSpec] = useState<BuildSpec | null>(null);
  const [versionHistory, setVersionHistory] = useState<VersionSnapshot[]>([]);
  const [transcriptData, setTranscriptData] = useState<{
    text: string;
    llm_response: string;
    confidence: number;
    audio_duration_ms: number;
    request_time_ms: number;
    session_id?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');
  const [errorMessage, setErrorMessage] = useState<{
    title: string;
    message: string;
    type?: 'auth' | 'rate_limit' | 'low_confidence' | 'general';
    retryAfter?: number;
  } | null>(null);

  const [anomalyCount, setAnomalyCount] = useState<number>(0);

  // Check server configuration status on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setHasAssemblyAiKey(data.hasAssemblyAiKey);
        setHasGeminiKey(data.hasGeminiKey);
      })
      .catch(() => {});
  }, []);

  // When transcription finishes, automatically pipe text into Gemini / Spec Synthesizer
  const handleTranscribeComplete = async (data: {
    text: string;
    llm_response: string;
    confidence: number;
    audio_duration_ms: number;
    request_time_ms: number;
    session_id?: string;
  }) => {
    setTranscriptData(data);
    setErrorMessage(null);

    // If confidence is low, warn
    if (data.confidence < 0.4 && data.text.length > 0) {
      setErrorMessage({
        title: 'Low Transcription Confidence',
        message:
          'AssemblyAI detected lower confidence audio. You can proceed with this draft or tap to re-record.',
        type: 'low_confidence',
      });
    }

    // Call /api/draft
    setIsLoading(true);
    setLoadingText('Synthesizing technical architecture & coding prompt with Gemini...');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKeyOverride) headers['x-gemini-key'] = geminiKeyOverride;

      const res = await fetch('/api/draft', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transcript: data.text,
          cleanText: data.llm_response,
          previousSpec: currentSpec,
        }),
      });

      const draftResult = await res.json();
      if (!res.ok) {
        throw new Error(draftResult.error || 'Failed to generate spec');
      }

      const newSpec: BuildSpec = draftResult.spec;
      setCurrentSpec(newSpec);

      // Record snapshot in version history
      const snapshot: VersionSnapshot = {
        version: newSpec.version || versionHistory.length + 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spec: newSpec,
        summary: newSpec.refinementSummary || 'Voice synthesized draft',
      };

      setVersionHistory((prev) => [...prev, snapshot]);
    } catch (err: any) {
      setErrorMessage({
        title: 'Architecture Synthesis Failed',
        message: err.message || 'Failed to build specification from transcript.',
        type: 'general',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // In-place refinement handler
  const handleRefine = async (refinementText: string) => {
    if (!currentSpec) return;
    setIsLoading(true);
    setLoadingText(`Incorporating refinement ("${refinementText.slice(0, 30)}...")...`);
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKeyOverride) headers['x-gemini-key'] = geminiKeyOverride;

      const res = await fetch('/api/draft', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          refinementNotes: refinementText,
          previousSpec: currentSpec,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refinement failed');

      const updatedSpec: BuildSpec = data.spec;
      setCurrentSpec(updatedSpec);

      const snapshot: VersionSnapshot = {
        version: updatedSpec.version || versionHistory.length + 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spec: updatedSpec,
        summary: updatedSpec.refinementSummary || 'Refinement update',
      };

      setVersionHistory((prev) => [...prev, snapshot]);
    } catch (err: any) {
      setErrorMessage({
        title: 'Refinement Error',
        message: err.message,
        type: 'general',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Revert back to earlier version snapshot
  const handleRevert = (snapshot: VersionSnapshot) => {
    setCurrentSpec(snapshot.spec);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1C1917] flex flex-col relative selection:bg-orange-100 selection:text-[#E05315] pb-24">
      {/* Top Banner Bar */}
      <BannerTop />

      {/* Header Navigation matching repo_clone */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasAssemblyAiKey={hasAssemblyAiKey}
        hasGeminiKey={hasGeminiKey}
        onOpenSettings={() => setIsSettingsOpen(true)}
        anomalyCount={anomalyCount}
      />

      {/* Heritage Mandala Decorative Background Accent */}
      <MandalaBackground />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 w-full space-y-8">
        {/* Real Error State Banner */}
        {errorMessage && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-4 animate-fadeIn ${
              errorMessage.type === 'auth'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : errorMessage.type === 'rate_limit'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-orange-50 border-orange-200 text-[#E05315]'
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[#1C1917]">{errorMessage.title}</h4>
              <p className="text-xs mt-1 leading-relaxed text-[#57534E]">{errorMessage.message}</p>
            </div>
            {errorMessage.type === 'auth' && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#E05315] hover:bg-[#C2410C] text-white font-semibold text-xs transition-all"
              >
                Configure Keys
              </button>
            )}
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-[#78716C] hover:text-[#1C1917] px-2 py-1 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Real Loading State with Informative Steps */}
        {isLoading && (
          <div className="warm-card rounded-2xl p-6 flex items-center justify-center gap-4 shadow-md animate-pulse">
            <div className="w-7 h-7 rounded-full border-2 border-[#E05315] border-t-transparent animate-spin" />
            <div>
              <p className="font-bold text-[#1C1917] text-sm">{loadingText}</p>
              <p className="text-xs text-[#78716C] mt-0.5">
                Universal-3.5 Pro + Gemini Architecture Orchestrator
              </p>
            </div>
          </div>
        )}

        {/* View 1: Build Studio */}
        {activeTab === 'studio' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Audio Intake Component */}
            <AudioRecorder
              onTranscribeComplete={handleTranscribeComplete}
              isLoading={isLoading}
              setLoadingStateText={setLoadingText}
              assemblyKeyOverride={assemblyKeyOverride}
              geminiKeyOverride={geminiKeyOverride}
            />

            {/* Version History Slider */}
            {currentSpec && (
              <VersionHistory
                history={versionHistory}
                currentVersion={currentSpec.version || 1}
                onRevert={handleRevert}
              />
            )}

            {/* Structured Spec & Prompt Viewer */}
            {currentSpec ? (
              <SpecDisplay
                spec={currentSpec}
                transcriptData={transcriptData}
                onRefine={handleRefine}
                isLoading={isLoading}
                versionCount={versionHistory.length}
              />
            ) : (
              /* Empty state matching repo_clone */
              <div className="warm-card rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#E05315] flex items-center justify-center mx-auto border border-orange-200">
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">Your Build Studio is Ready</h3>
                <p className="text-sm text-[#57534E] max-w-md mx-auto leading-relaxed">
                  Press the microphone button or pick one of the code-switching demo clips to watch Universal-3.5 Pro transcribe your words and Gemini compile your engineering roadmap.
                </p>
                <div className="flex items-center justify-center gap-6 pt-3 text-xs text-[#78716C]">
                  <span className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-[#E05315]" />
                    <span>19 Native Languages</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E05315]" />
                    <span>Instant Code-Switching</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#E05315]" />
                    <span>Cursor & Antigravity Ready</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: API Diagnostics & Bug Hunter */}
        {activeTab === 'diagnostics' && (
          <div className="animate-fadeIn">
            <DiagnosticsView
              assemblyKeyOverride={assemblyKeyOverride}
              geminiKeyOverride={geminiKeyOverride}
              onAnomaliesDetected={(count) => setAnomalyCount(count)}
            />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        hasAssemblyAiKey={hasAssemblyAiKey}
        hasGeminiKey={hasGeminiKey}
        assemblyKeyOverride={assemblyKeyOverride}
        setAssemblyKeyOverride={setAssemblyKeyOverride}
        geminiKeyOverride={geminiKeyOverride}
        setGeminiKeyOverride={setGeminiKeyOverride}
      />
    </div>
  );
}
